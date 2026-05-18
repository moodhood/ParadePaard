package com.pm.userservice.repository;

import com.pm.userservice.model.MessageEntry;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface MessageEntryRepository extends JpaRepository<MessageEntry, UUID> {
    List<MessageEntry> findAllByConversation_ConversationIdOrderByCreatedAtAsc(UUID conversationId);
}
