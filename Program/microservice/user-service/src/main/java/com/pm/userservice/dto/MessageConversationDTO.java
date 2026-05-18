package com.pm.userservice.dto;

import java.util.ArrayList;
import java.util.List;

public class MessageConversationDTO {
    private String conversationId;
    private String userId;
    private String userDisplayName;
    private String userEmail;
    private String lastMessagePreview;
    private String lastMessageAt;
    private Integer unreadByAdminCount;
    private Integer unreadByUserCount;
    private List<MessageEntryDTO> messages = new ArrayList<>();

    public String getConversationId() { return conversationId; }
    public void setConversationId(String conversationId) { this.conversationId = conversationId; }
    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }
    public String getUserDisplayName() { return userDisplayName; }
    public void setUserDisplayName(String userDisplayName) { this.userDisplayName = userDisplayName; }
    public String getUserEmail() { return userEmail; }
    public void setUserEmail(String userEmail) { this.userEmail = userEmail; }
    public String getLastMessagePreview() { return lastMessagePreview; }
    public void setLastMessagePreview(String lastMessagePreview) { this.lastMessagePreview = lastMessagePreview; }
    public String getLastMessageAt() { return lastMessageAt; }
    public void setLastMessageAt(String lastMessageAt) { this.lastMessageAt = lastMessageAt; }
    public Integer getUnreadByAdminCount() { return unreadByAdminCount; }
    public void setUnreadByAdminCount(Integer unreadByAdminCount) { this.unreadByAdminCount = unreadByAdminCount; }
    public Integer getUnreadByUserCount() { return unreadByUserCount; }
    public void setUnreadByUserCount(Integer unreadByUserCount) { this.unreadByUserCount = unreadByUserCount; }
    public List<MessageEntryDTO> getMessages() { return messages; }
    public void setMessages(List<MessageEntryDTO> messages) { this.messages = messages; }
}
