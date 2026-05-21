package com.pm.userservice.dto;

public class MessageRealtimeEventDTO {
    private String conversationId;
    private String userDisplayName;
    private String userEmail;
    private MessageEntryDTO message;
    private String lastMessageAt;
    private String lastMessagePreview;
    private Integer unreadByAdminCount;
    private Integer unreadByUserCount;

    public String getConversationId() { return conversationId; }
    public void setConversationId(String conversationId) { this.conversationId = conversationId; }
    public String getUserDisplayName() { return userDisplayName; }
    public void setUserDisplayName(String userDisplayName) { this.userDisplayName = userDisplayName; }
    public String getUserEmail() { return userEmail; }
    public void setUserEmail(String userEmail) { this.userEmail = userEmail; }
    public MessageEntryDTO getMessage() { return message; }
    public void setMessage(MessageEntryDTO message) { this.message = message; }
    public String getLastMessageAt() { return lastMessageAt; }
    public void setLastMessageAt(String lastMessageAt) { this.lastMessageAt = lastMessageAt; }
    public String getLastMessagePreview() { return lastMessagePreview; }
    public void setLastMessagePreview(String lastMessagePreview) { this.lastMessagePreview = lastMessagePreview; }
    public Integer getUnreadByAdminCount() { return unreadByAdminCount; }
    public void setUnreadByAdminCount(Integer unreadByAdminCount) { this.unreadByAdminCount = unreadByAdminCount; }
    public Integer getUnreadByUserCount() { return unreadByUserCount; }
    public void setUnreadByUserCount(Integer unreadByUserCount) { this.unreadByUserCount = unreadByUserCount; }
}
