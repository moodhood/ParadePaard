import axios from "axios";

export type MessageEntryDTO = {
    messageId?: string | null;
    senderType?: "USER" | "ADMIN" | string | null;
    senderLabel?: string | null;
    body?: string | null;
    createdAt?: string | null;
};

export type MessageConversationDTO = {
    conversationId?: string | null;
    userId?: string | null;
    userDisplayName?: string | null;
    userEmail?: string | null;
    lastMessagePreview?: string | null;
    lastMessageAt?: string | null;
    unreadByAdminCount?: number | null;
    unreadByUserCount?: number | null;
    messages: MessageEntryDTO[];
};

export type MessageSendRequestDTO = {
    body: string;
};

export type MessageUnreadCountDTO = {
    unreadByUserCount?: number | null;
};

export type MessageRealtimeEventDTO = {
    conversationId?: string | null;
    userDisplayName?: string | null;
    userEmail?: string | null;
    message?: MessageEntryDTO | null;
    lastMessageAt?: string | null;
    lastMessagePreview?: string | null;
    unreadByAdminCount?: number | null;
    unreadByUserCount?: number | null;
};

const messageError = (error: unknown, fallback: string) => {
    if (axios.isAxiosError(error)) {
        return new Error(error.response?.data?.message || fallback);
    }
    return error;
};

export async function GetMyMessageConversation(API_BASE_URL: string): Promise<MessageConversationDTO> {
    try {
        const response = await axios.get<MessageConversationDTO>(`${API_BASE_URL}/api/messages/me`, {
            withCredentials: true,
        });
        return response.data;
    } catch (error) {
        throw messageError(error, "Could not load your messages");
    }
}

export async function GetMyMessageUnreadCount(API_BASE_URL: string): Promise<MessageUnreadCountDTO> {
    try {
        const response = await axios.get<MessageUnreadCountDTO>(`${API_BASE_URL}/api/messages/me/unread-count`, {
            withCredentials: true,
        });
        return response.data;
    } catch (error) {
        throw messageError(error, "Could not load your unread messages");
    }
}

export async function SendMyMessage(
    API_BASE_URL: string,
    payload: MessageSendRequestDTO
): Promise<MessageConversationDTO> {
    try {
        const response = await axios.post<MessageConversationDTO>(`${API_BASE_URL}/api/messages/me`, payload, {
            headers: { "Content-Type": "application/json" },
            withCredentials: true,
        });
        return response.data;
    } catch (error) {
        throw messageError(error, "Could not send your message");
    }
}

export async function GetAdminMessageConversations(API_BASE_URL: string): Promise<MessageConversationDTO[]> {
    try {
        const response = await axios.get<MessageConversationDTO[]>(`${API_BASE_URL}/api/messages/admin/conversations`, {
            withCredentials: true,
        });
        return response.data;
    } catch (error) {
        throw messageError(error, "Could not load the shared inbox");
    }
}

export async function GetAdminMessageConversation(
    API_BASE_URL: string,
    conversationId: string
): Promise<MessageConversationDTO> {
    try {
        const response = await axios.get<MessageConversationDTO>(
            `${API_BASE_URL}/api/messages/admin/conversations/${conversationId}`,
            { withCredentials: true }
        );
        return response.data;
    } catch (error) {
        throw messageError(error, "Could not load this conversation");
    }
}

export async function SendAdminMessage(
    API_BASE_URL: string,
    conversationId: string,
    payload: MessageSendRequestDTO
): Promise<MessageConversationDTO> {
    try {
        const response = await axios.post<MessageConversationDTO>(
            `${API_BASE_URL}/api/messages/admin/conversations/${conversationId}/messages`,
            payload,
            {
                headers: { "Content-Type": "application/json" },
                withCredentials: true,
            }
        );
        return response.data;
    } catch (error) {
        throw messageError(error, "Could not send this reply");
    }
}
