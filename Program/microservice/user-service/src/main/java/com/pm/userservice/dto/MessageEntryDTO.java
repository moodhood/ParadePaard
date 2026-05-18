package com.pm.userservice.dto;

public class MessageEntryDTO {
    private String messageId;
    private String senderType;
    private String senderLabel;
    private String body;
    private String createdAt;

    public String getMessageId() { return messageId; }
    public void setMessageId(String messageId) { this.messageId = messageId; }
    public String getSenderType() { return senderType; }
    public void setSenderType(String senderType) { this.senderType = senderType; }
    public String getSenderLabel() { return senderLabel; }
    public void setSenderLabel(String senderLabel) { this.senderLabel = senderLabel; }
    public String getBody() { return body; }
    public void setBody(String body) { this.body = body; }
    public String getCreatedAt() { return createdAt; }
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }
}
