package com.pm.userservice.service;

import com.pm.userservice.dto.MessageConversationDTO;
import com.pm.userservice.dto.MessageSendRequestDTO;
import com.pm.userservice.exception.UserNotFoundException;
import com.pm.userservice.mapper.MessageMapper;
import com.pm.userservice.model.MessageConversation;
import com.pm.userservice.model.MessageEntry;
import com.pm.userservice.model.MessageSenderType;
import com.pm.userservice.model.User;
import com.pm.userservice.repository.MessageConversationRepository;
import com.pm.userservice.repository.MessageEntryRepository;
import com.pm.userservice.repository.UserRepository;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class MessageService {
    private final MessageConversationRepository conversationRepository;
    private final MessageEntryRepository entryRepository;
    private final UserRepository userRepository;

    public MessageService(
            MessageConversationRepository conversationRepository,
            MessageEntryRepository entryRepository,
            UserRepository userRepository
    ) {
        this.conversationRepository = conversationRepository;
        this.entryRepository = entryRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public MessageConversationDTO getMyConversation(UUID userId) {
        User user = getUser(userId);
        MessageConversation conversation = getOrCreateConversation(user);
        conversation.setUnreadByUserCount(0);
        conversationRepository.save(conversation);
        return toDTO(conversation);
    }

    @Transactional
    public MessageConversationDTO sendUserMessage(UUID userId, MessageSendRequestDTO request) {
        User user = getUser(userId);
        MessageConversation conversation = getOrCreateConversation(user);
        addMessage(conversation, userId, MessageSenderType.USER, request.getBody());
        conversation.setUnreadByAdminCount(valueOrZero(conversation.getUnreadByAdminCount()) + 1);
        conversation.setUnreadByUserCount(valueOrZero(conversation.getUnreadByUserCount()));
        conversationRepository.save(conversation);
        return toDTO(conversation);
    }

    @Transactional
    public List<MessageConversationDTO> listAdminConversations(UUID adminUserId) {
        User admin = getUser(adminUserId);
        return conversationRepository.findAllByCompanyIdOrderByLastMessageAtDesc(admin.getCompanyId())
                .stream()
                .map(conversation -> MessageMapper.toDTO(conversation, List.of()))
                .toList();
    }

    @Transactional
    public MessageConversationDTO getAdminConversation(UUID adminUserId, UUID conversationId) {
        User admin = getUser(adminUserId);
        MessageConversation conversation = conversationRepository
                .findByConversationIdAndCompanyId(conversationId, admin.getCompanyId())
                .orElseThrow(() -> new IllegalArgumentException("Conversation not found"));
        conversation.setUnreadByAdminCount(0);
        conversationRepository.save(conversation);
        return toDTO(conversation);
    }

    @Transactional
    public MessageConversationDTO sendAdminMessage(UUID adminUserId, UUID conversationId, MessageSendRequestDTO request) {
        User admin = getUser(adminUserId);
        MessageConversation conversation = conversationRepository
                .findByConversationIdAndCompanyId(conversationId, admin.getCompanyId())
                .orElseThrow(() -> new IllegalArgumentException("Conversation not found"));
        addMessage(conversation, adminUserId, MessageSenderType.ADMIN, request.getBody());
        conversation.setUnreadByUserCount(valueOrZero(conversation.getUnreadByUserCount()) + 1);
        conversation.setUnreadByAdminCount(valueOrZero(conversation.getUnreadByAdminCount()));
        conversationRepository.save(conversation);
        return toDTO(conversation);
    }

    private MessageConversation getOrCreateConversation(User user) {
        return conversationRepository.findByUser_UserIdAndCompanyId(user.getUserId(), user.getCompanyId())
                .orElseGet(() -> {
                    MessageConversation conversation = new MessageConversation();
                    conversation.setConversationId(UUID.randomUUID());
                    conversation.setUser(user);
                    conversation.setCompanyId(user.getCompanyId());
                    conversation.setUnreadByAdminCount(0);
                    conversation.setUnreadByUserCount(0);
                    return conversationRepository.save(conversation);
                });
    }

    private void addMessage(
            MessageConversation conversation,
            UUID senderUserId,
            MessageSenderType senderType,
            String body
    ) {
        String normalizedBody = normalizeBody(body);
        OffsetDateTime now = OffsetDateTime.now();
        MessageEntry entry = new MessageEntry();
        entry.setMessageId(UUID.randomUUID());
        entry.setConversation(conversation);
        entry.setSenderUserId(senderUserId);
        entry.setSenderType(senderType);
        entry.setBody(normalizedBody);
        entry.setCreatedAt(now);
        entryRepository.save(entry);
        conversation.setLastMessageAt(now);
        conversation.setLastMessagePreview(preview(normalizedBody));
    }

    private MessageConversationDTO toDTO(MessageConversation conversation) {
        List<MessageEntry> messages = entryRepository
                .findAllByConversation_ConversationIdOrderByCreatedAtAsc(conversation.getConversationId());
        return MessageMapper.toDTO(conversation, messages);
    }

    private User getUser(UUID userId) {
        return userRepository.findByUserId(userId)
                .orElseThrow(() -> new UserNotFoundException("User " + userId + " not found"));
    }

    private String normalizeBody(String body) {
        String normalized = body == null ? "" : body.trim();
        if (normalized.isBlank()) {
            throw new IllegalArgumentException("Message body is required");
        }
        if (normalized.length() > 4000) {
            throw new IllegalArgumentException("Message body can be at most 4000 characters");
        }
        return normalized;
    }

    private String preview(String body) {
        return body.length() <= 140 ? body : body.substring(0, 137) + "...";
    }

    private int valueOrZero(Integer value) {
        return value == null ? 0 : value;
    }
}
