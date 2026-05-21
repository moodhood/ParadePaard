package com.pm.userservice.service;

import com.pm.userservice.dto.MessageRealtimeEventDTO;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.time.Duration;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;

@Service
public class MessageSseService {
    private static final Logger log = LoggerFactory.getLogger(MessageSseService.class);
    private static final long EMITTER_TIMEOUT_MILLIS = Duration.ofMinutes(30).toMillis();

    private final Map<UUID, CopyOnWriteArrayList<SseEmitter>> conversationEmitters = new ConcurrentHashMap<>();
    private final Map<UUID, CopyOnWriteArrayList<SseEmitter>> companyInboxEmitters = new ConcurrentHashMap<>();

    public SseEmitter subscribeConversation(UUID conversationId) {
        SseEmitter emitter = new SseEmitter(EMITTER_TIMEOUT_MILLIS);
        addEmitter(conversationEmitters, conversationId, emitter);
        sendConnected(emitter, "conversation");
        return emitter;
    }

    public SseEmitter subscribeCompanyInbox(UUID companyId) {
        SseEmitter emitter = new SseEmitter(EMITTER_TIMEOUT_MILLIS);
        addEmitter(companyInboxEmitters, companyId, emitter);
        sendConnected(emitter, "company");
        return emitter;
    }

    public void publishConversationMessage(UUID conversationId, MessageRealtimeEventDTO event) {
        broadcast(conversationEmitters.get(conversationId), "message", event);
    }

    public void publishCompanyInboxMessage(UUID companyId, MessageRealtimeEventDTO event) {
        broadcast(companyInboxEmitters.get(companyId), "message", event);
    }

    private void addEmitter(Map<UUID, CopyOnWriteArrayList<SseEmitter>> map, UUID key, SseEmitter emitter) {
        CopyOnWriteArrayList<SseEmitter> emitters = map.computeIfAbsent(key, ignored -> new CopyOnWriteArrayList<>());
        emitters.add(emitter);

        emitter.onCompletion(() -> removeEmitter(map, key, emitter));
        emitter.onTimeout(() -> removeEmitter(map, key, emitter));
        emitter.onError(err -> removeEmitter(map, key, emitter));
    }

    private void removeEmitter(Map<UUID, CopyOnWriteArrayList<SseEmitter>> map, UUID key, SseEmitter emitter) {
        CopyOnWriteArrayList<SseEmitter> emitters = map.get(key);
        if (emitters == null) return;
        emitters.remove(emitter);
        if (emitters.isEmpty()) {
            map.remove(key);
        }
    }

    private void sendConnected(SseEmitter emitter, String scope) {
        try {
            emitter.send(SseEmitter.event()
                    .name("connected")
                    .data(Map.of("scope", scope), MediaType.APPLICATION_JSON));
        } catch (IOException e) {
            emitter.completeWithError(e);
        }
    }

    private void broadcast(List<SseEmitter> emitters, String eventName, Object payload) {
        if (emitters == null || emitters.isEmpty()) return;
        for (SseEmitter emitter : emitters) {
            try {
                emitter.send(SseEmitter.event()
                        .name(eventName)
                        .data(payload, MediaType.APPLICATION_JSON));
            } catch (IOException e) {
                log.debug("SSE send failed, completing emitter", e);
                emitter.completeWithError(e);
            }
        }
    }
}

