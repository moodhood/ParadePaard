package com.pm.userservice.service.events;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

@Service
public class NotificationEventListener {

    private static final Logger log = LoggerFactory.getLogger(NotificationEventListener.class);

    @KafkaListener(topics = "notification-events", groupId = "notification-service")
    public void handleNotificationEvent(byte[] event) {
        String payload = event == null ? "" : new String(event, java.nio.charset.StandardCharsets.UTF_8);
        log.info("Stub email delivery for notification event: {}", payload);
    }
}
