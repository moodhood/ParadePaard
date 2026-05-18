package com.pm.userservice.mapper;

import com.pm.userservice.dto.MessageConversationDTO;
import com.pm.userservice.dto.MessageEntryDTO;
import com.pm.userservice.model.MessageConversation;
import com.pm.userservice.model.MessageEntry;
import com.pm.userservice.model.MessageSenderType;
import com.pm.userservice.model.User;

import java.util.List;
import java.util.stream.Stream;

public class MessageMapper {
    private MessageMapper() {
    }

    public static MessageConversationDTO toDTO(MessageConversation conversation, List<MessageEntry> messages) {
        MessageConversationDTO dto = new MessageConversationDTO();
        User user = conversation.getUser();
        dto.setConversationId(conversation.getConversationId() != null ? conversation.getConversationId().toString() : null);
        dto.setUserId(user != null && user.getUserId() != null ? user.getUserId().toString() : null);
        dto.setUserDisplayName(displayName(user));
        dto.setUserEmail(user != null ? user.getEmail() : null);
        dto.setLastMessagePreview(conversation.getLastMessagePreview());
        dto.setLastMessageAt(conversation.getLastMessageAt() != null ? conversation.getLastMessageAt().toString() : null);
        dto.setUnreadByAdminCount(valueOrZero(conversation.getUnreadByAdminCount()));
        dto.setUnreadByUserCount(valueOrZero(conversation.getUnreadByUserCount()));
        dto.setMessages(messages.stream().map(MessageMapper::toEntryDTO).toList());
        return dto;
    }

    public static MessageEntryDTO toEntryDTO(MessageEntry entry) {
        MessageEntryDTO dto = new MessageEntryDTO();
        dto.setMessageId(entry.getMessageId() != null ? entry.getMessageId().toString() : null);
        dto.setSenderType(entry.getSenderType() != null ? entry.getSenderType().name() : null);
        dto.setSenderLabel(entry.getSenderType() == MessageSenderType.ADMIN ? "Company" : "You");
        dto.setBody(entry.getBody());
        dto.setCreatedAt(entry.getCreatedAt() != null ? entry.getCreatedAt().toString() : null);
        return dto;
    }

    private static String displayName(User user) {
        if (user == null) return "-";
        String name = String.join(" ",
                Stream.of(user.getFirstNames(), user.getMiddleNamePrefix(), user.getLastName())
                        .filter(part -> part != null && !part.isBlank())
                        .map(String::trim)
                        .toList());
        if (!name.isBlank()) return name;
        if (user.getPreferredName() != null && !user.getPreferredName().isBlank()) return user.getPreferredName();
        return user.getEmail() != null ? user.getEmail() : "-";
    }

    private static Integer valueOrZero(Integer value) {
        return value == null ? 0 : value;
    }
}
