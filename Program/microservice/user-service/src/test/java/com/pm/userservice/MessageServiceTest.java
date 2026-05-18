package com.pm.userservice;

import com.pm.userservice.dto.MessageConversationDTO;
import com.pm.userservice.dto.MessageSendRequestDTO;
import com.pm.userservice.model.MessageConversation;
import com.pm.userservice.model.MessageEntry;
import com.pm.userservice.model.MessageSenderType;
import com.pm.userservice.model.User;
import com.pm.userservice.repository.MessageConversationRepository;
import com.pm.userservice.repository.MessageEntryRepository;
import com.pm.userservice.repository.UserRepository;
import com.pm.userservice.service.MessageService;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class MessageServiceTest {

    private final MessageConversationRepository conversationRepository = mock(MessageConversationRepository.class);
    private final MessageEntryRepository entryRepository = mock(MessageEntryRepository.class);
    private final UserRepository userRepository = mock(UserRepository.class);
    private final MessageService messageService = new MessageService(
            conversationRepository,
            entryRepository,
            userRepository
    );

    @Test
    void userMessageCreatesOneConversationAndReusesItForLaterMessages() {
        UUID userId = UUID.randomUUID();
        UUID companyId = UUID.randomUUID();
        User user = user(userId, companyId, "Ava", "Jansen", "ava@example.com");

        when(userRepository.findByUserId(userId)).thenReturn(Optional.of(user));
        when(conversationRepository.findByUser_UserIdAndCompanyId(userId, companyId))
                .thenReturn(Optional.empty())
                .thenReturn(Optional.of(conversation(user, companyId)));
        when(conversationRepository.save(any(MessageConversation.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));
        when(entryRepository.save(any(MessageEntry.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));
        when(entryRepository.findAllByConversation_ConversationIdOrderByCreatedAtAsc(any(UUID.class)))
                .thenReturn(List.of());

        MessageSendRequestDTO first = new MessageSendRequestDTO();
        first.setBody("Can someone help me with my planning?");
        MessageConversationDTO firstConversation = messageService.sendUserMessage(userId, first);

        MessageSendRequestDTO second = new MessageSendRequestDTO();
        second.setBody("I also have a question about Friday.");
        MessageConversationDTO secondConversation = messageService.sendUserMessage(userId, second);

        assertThat(firstConversation.getUserId()).isEqualTo(userId.toString());
        assertThat(firstConversation.getUnreadByAdminCount()).isEqualTo(1);
        assertThat(secondConversation.getUserId()).isEqualTo(userId.toString());
        assertThat(secondConversation.getUnreadByAdminCount()).isEqualTo(1);
    }

    @Test
    void adminCanReplyOnlyToAConversationInTheAdminsCompany() {
        UUID companyId = UUID.randomUUID();
        UUID otherCompanyId = UUID.randomUUID();
        UUID adminId = UUID.randomUUID();
        UUID userId = UUID.randomUUID();
        UUID conversationId = UUID.randomUUID();
        User admin = user(adminId, companyId, "Admin", "One", "admin@example.com");
        User normalUser = user(userId, companyId, "Ava", "Jansen", "ava@example.com");
        MessageConversation conversation = conversation(normalUser, companyId);
        conversation.setConversationId(conversationId);

        when(userRepository.findByUserId(adminId)).thenReturn(Optional.of(admin));
        when(conversationRepository.findByConversationIdAndCompanyId(conversationId, companyId))
                .thenReturn(Optional.of(conversation));
        when(conversationRepository.save(any(MessageConversation.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));
        when(entryRepository.save(any(MessageEntry.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));
        when(entryRepository.findAllByConversation_ConversationIdOrderByCreatedAtAsc(conversationId))
                .thenReturn(List.of());

        MessageSendRequestDTO reply = new MessageSendRequestDTO();
        reply.setBody("We will check this for you.");
        MessageConversationDTO dto = messageService.sendAdminMessage(adminId, conversationId, reply);

        assertThat(dto.getConversationId()).isEqualTo(conversationId.toString());
        assertThat(dto.getUnreadByUserCount()).isEqualTo(1);

        UUID otherConversationId = UUID.randomUUID();
        User otherUser = user(UUID.randomUUID(), otherCompanyId, "Other", "User", "other@example.com");
        MessageConversation otherConversation = conversation(otherUser, otherCompanyId);
        otherConversation.setConversationId(otherConversationId);
        when(conversationRepository.findByConversationIdAndCompanyId(otherConversationId, companyId))
                .thenReturn(Optional.empty());

        assertThatThrownBy(() -> messageService.sendAdminMessage(adminId, otherConversationId, reply))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Conversation not found");
    }

    private static User user(UUID userId, UUID companyId, String firstNames, String lastName, String email) {
        User user = new User();
        user.setUserId(userId);
        user.setCompanyId(companyId);
        user.setFirstNames(firstNames);
        user.setLastName(lastName);
        user.setEmail(email);
        return user;
    }

    private static MessageConversation conversation(User user, UUID companyId) {
        MessageConversation conversation = new MessageConversation();
        conversation.setConversationId(UUID.randomUUID());
        conversation.setUser(user);
        conversation.setCompanyId(companyId);
        return conversation;
    }
}
