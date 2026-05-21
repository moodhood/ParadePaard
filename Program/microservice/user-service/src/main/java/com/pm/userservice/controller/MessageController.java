package com.pm.userservice.controller;

import com.pm.userservice.dto.MessageConversationDTO;
import com.pm.userservice.dto.MessageSendRequestDTO;
import com.pm.userservice.service.MessageService;
import com.pm.userservice.service.MessageSseService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.http.MediaType;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/messages")
@Tag(name = "Messages", description = "Shared user-to-company messaging")
public class MessageController {
    private final MessageService messageService;
    private final MessageSseService messageSseService;

    public MessageController(MessageService messageService, MessageSseService messageSseService) {
        this.messageService = messageService;
        this.messageSseService = messageSseService;
    }

    @GetMapping("/me")
    @Operation(summary = "Get the signed-in user's one company conversation")
    public ResponseEntity<MessageConversationDTO> getMyConversation(Authentication authentication) {
        return ResponseEntity.ok(messageService.getMyConversation(requireUserId(authentication)));
    }

    @PostMapping("/me")
    @Operation(summary = "Send a message to the company account")
    public ResponseEntity<MessageConversationDTO> sendMyMessage(
            Authentication authentication,
            @Valid @RequestBody MessageSendRequestDTO request
    ) {
        return ResponseEntity.ok(messageService.sendUserMessage(requireUserId(authentication), request));
    }

    @GetMapping(value = "/me/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    @Operation(summary = "Realtime stream for the signed-in user's conversation")
    public SseEmitter streamMyConversation(Authentication authentication) {
        UUID userId = requireUserId(authentication);
        UUID conversationId = messageService.getOrCreateConversationIdForUser(userId);
        return messageSseService.subscribeConversation(conversationId);
    }

    @GetMapping("/admin/conversations")
    @Operation(summary = "List shared inbox conversations for the admin's company")
    @PreAuthorize("hasAuthority('CAN_MANAGE_MESSAGES')")
    public ResponseEntity<List<MessageConversationDTO>> listAdminConversations(Authentication authentication) {
        return ResponseEntity.ok(messageService.listAdminConversations(requireUserId(authentication)));
    }

    @GetMapping(value = "/admin/conversations/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    @Operation(summary = "Realtime stream for the admin's shared inbox list")
    @PreAuthorize("hasAuthority('CAN_MANAGE_MESSAGES')")
    public SseEmitter streamAdminInbox(Authentication authentication) {
        UUID adminUserId = requireUserId(authentication);
        UUID companyId = messageService.requireCompanyIdForUser(adminUserId);
        return messageSseService.subscribeCompanyInbox(companyId);
    }

    @GetMapping("/admin/conversations/{conversationId}")
    @Operation(summary = "Get one shared inbox conversation")
    @PreAuthorize("hasAuthority('CAN_MANAGE_MESSAGES')")
    public ResponseEntity<MessageConversationDTO> getAdminConversation(
            Authentication authentication,
            @PathVariable UUID conversationId
    ) {
        return ResponseEntity.ok(messageService.getAdminConversation(requireUserId(authentication), conversationId));
    }

    @GetMapping(value = "/admin/conversations/{conversationId}/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    @Operation(summary = "Realtime stream for one shared inbox conversation")
    @PreAuthorize("hasAuthority('CAN_MANAGE_MESSAGES')")
    public SseEmitter streamAdminConversation(
            Authentication authentication,
            @PathVariable UUID conversationId
    ) {
        UUID adminUserId = requireUserId(authentication);
        messageService.requireAdminConversationAccess(adminUserId, conversationId);
        return messageSseService.subscribeConversation(conversationId);
    }

    @PostMapping("/admin/conversations/{conversationId}/messages")
    @Operation(summary = "Reply to a shared inbox conversation as the company account")
    @PreAuthorize("hasAuthority('CAN_MANAGE_MESSAGES')")
    public ResponseEntity<MessageConversationDTO> sendAdminMessage(
            Authentication authentication,
            @PathVariable UUID conversationId,
            @Valid @RequestBody MessageSendRequestDTO request
    ) {
        return ResponseEntity.ok(messageService.sendAdminMessage(requireUserId(authentication), conversationId, request));
    }

    private UUID requireUserId(Authentication authentication) {
        if (authentication == null) {
            throw new IllegalArgumentException("Missing authentication");
        }
        String raw = authentication.getName();
        if (authentication instanceof JwtAuthenticationToken jwtAuth) {
            String claim = jwtAuth.getToken().getClaimAsString("userId");
            if (claim != null && !claim.isBlank()) {
                raw = claim;
            }
        }
        if (raw == null || raw.isBlank()) {
            throw new IllegalArgumentException("Missing userId");
        }
        return UUID.fromString(raw);
    }
}
