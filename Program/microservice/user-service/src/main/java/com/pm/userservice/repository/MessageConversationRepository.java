package com.pm.userservice.repository;

import com.pm.userservice.model.MessageConversation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface MessageConversationRepository extends JpaRepository<MessageConversation, UUID> {
    Optional<MessageConversation> findByUser_UserIdAndCompanyId(UUID userId, UUID companyId);
    Optional<MessageConversation> findByConversationIdAndCompanyId(UUID conversationId, UUID companyId);
    List<MessageConversation> findAllByCompanyIdOrderByLastMessageAtDesc(UUID companyId);
}
