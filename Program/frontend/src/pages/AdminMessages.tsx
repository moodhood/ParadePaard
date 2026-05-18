import { useCallback, useEffect, useState } from "react";
import PrimaryNav from "../components/PrimaryNav";
import { UserServices, type MessageConversationDTO, type MessageEntryDTO } from "../services/user-service/UserServices";
import "../stylesheets/Messages.css";

type AdminMessagesViewProps = {
    conversations: MessageConversationDTO[];
    selectedConversation: MessageConversationDTO | null;
    loading: boolean;
    detailLoading: boolean;
    error: string | null;
    detailError: string | null;
    draft: string;
    sending: boolean;
    sendError: string | null;
    onSelectConversation: (conversationId: string) => void;
    onDraftChange: (value: string) => void;
    onSend: () => void;
    onRefresh: () => void;
};

function formatMessageTime(value?: string | null) {
    if (!value) return "";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    return date.toLocaleString("nl-NL", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

function AdminThreadMessage({ message }: { message: MessageEntryDTO }) {
    const isAdmin = (message.senderType ?? "").toUpperCase() === "ADMIN";
    return (
        <article className={`messageBubble ${isAdmin ? "messageBubble--admin" : "messageBubble--user"}`}>
            <div className="messageBubbleHeader">
                <span>{isAdmin ? "Company" : "User"}</span>
                <span>{formatMessageTime(message.createdAt)}</span>
            </div>
            <p className="messageBubbleBody">{message.body}</p>
        </article>
    );
}

export function AdminMessagesView({
    conversations,
    selectedConversation,
    loading,
    detailLoading,
    error,
    detailError,
    draft,
    sending,
    sendError,
    onSelectConversation,
    onDraftChange,
    onSend,
    onRefresh,
}: AdminMessagesViewProps) {
    return (
        <div className="messagesPage">
            <div className="pageShell">
                <PrimaryNav />
                <main className="pageShellContent">
                    <header className="pageHeader">
                        <h1 className="pageTitle">Shared Inbox</h1>
                    </header>
                    <div className="messagesLayout">
                        <section className="messagePanel">
                            <div className="messagePanelHeader">
                                <div>
                                    <h2 className="messagePanelTitle">Conversations</h2>
                                    <p className="messagePanelMeta">Visible to all admins with message access.</p>
                                </div>
                                <button type="button" className="buttonSecondary" onClick={onRefresh} disabled={loading}>
                                    Refresh
                                </button>
                            </div>
                            {loading ? <p className="messageEmpty">Loading inbox...</p> : null}
                            {error ? <p className="messageError">{error}</p> : null}
                            {!loading && !error && conversations.length === 0 ? (
                                <p className="messageEmpty">No conversations yet</p>
                            ) : null}
                            <div className="messageInboxList">
                                {conversations.map((conversation) => {
                                    const selected = selectedConversation?.conversationId === conversation.conversationId;
                                    const unread = conversation.unreadByAdminCount ?? 0;
                                    return (
                                        <button
                                            type="button"
                                            key={conversation.conversationId}
                                            className={`messageInboxRow${selected ? " messageInboxRow--selected" : ""}`}
                                            onClick={() => conversation.conversationId && onSelectConversation(conversation.conversationId)}
                                        >
                                            <div className="messageInboxName">
                                                <span>{conversation.userDisplayName ?? conversation.userEmail ?? "Unknown user"}</span>
                                                {unread > 0 ? (
                                                    <span className="messageBadge">{unread} unread</span>
                                                ) : null}
                                            </div>
                                            <div className="messagePanelMeta">{conversation.userEmail}</div>
                                            <div className="messageInboxPreview">
                                                {conversation.lastMessagePreview ?? "No messages yet"}
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </section>

                        <section className="messagePanel">
                            <div className="messagePanelHeader">
                                <div>
                                    <h2 className="messagePanelTitle">
                                        {selectedConversation?.userDisplayName ?? "Select a conversation"}
                                    </h2>
                                    <p className="messagePanelMeta">{selectedConversation?.userEmail ?? "Open a user thread to reply."}</p>
                                </div>
                            </div>
                            {detailLoading ? <p className="messageEmpty">Loading conversation...</p> : null}
                            {detailError ? <p className="messageError">{detailError}</p> : null}
                            {!selectedConversation && !detailLoading ? (
                                <p className="messageEmpty">Select a conversation from the shared inbox.</p>
                            ) : null}
                            {selectedConversation ? (
                                <>
                                    <div className="messageList">
                                        {(selectedConversation.messages ?? []).map((message) => (
                                            <AdminThreadMessage key={message.messageId ?? `${message.createdAt}-${message.body}`} message={message} />
                                        ))}
                                    </div>
                                    <div className="messageComposer">
                                        <label className="messagePanelTitle" htmlFor="admin-message-body">Reply as company</label>
                                        <textarea
                                            id="admin-message-body"
                                            value={draft}
                                            onChange={(event) => onDraftChange(event.target.value)}
                                            placeholder="Write a shared company reply."
                                            disabled={sending}
                                        />
                                        {sendError ? <p className="messageError">{sendError}</p> : null}
                                        <div className="messageComposerActions">
                                            <button type="button" className="button" onClick={onSend} disabled={sending || !draft.trim()}>
                                                {sending ? "Sending..." : "Send reply"}
                                            </button>
                                        </div>
                                    </div>
                                </>
                            ) : null}
                        </section>
                    </div>
                </main>
            </div>
        </div>
    );
}

export default function AdminMessages() {
    const [conversations, setConversations] = useState<MessageConversationDTO[]>([]);
    const [selectedConversation, setSelectedConversation] = useState<MessageConversationDTO | null>(null);
    const [loading, setLoading] = useState(true);
    const [detailLoading, setDetailLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [detailError, setDetailError] = useState<string | null>(null);
    const [draft, setDraft] = useState("");
    const [sending, setSending] = useState(false);
    const [sendError, setSendError] = useState<string | null>(null);

    const loadConversations = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await UserServices.getAdminMessageConversations();
            setConversations(data);
            if (!selectedConversation && data[0]?.conversationId) {
                await loadConversation(data[0].conversationId);
            }
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Could not load the shared inbox");
        } finally {
            setLoading(false);
        }
    }, [selectedConversation]);

    const loadConversation = async (conversationId: string) => {
        try {
            setDetailLoading(true);
            setDetailError(null);
            setSelectedConversation(await UserServices.getAdminMessageConversation(conversationId));
        } catch (err: unknown) {
            setDetailError(err instanceof Error ? err.message : "Could not load this conversation");
        } finally {
            setDetailLoading(false);
        }
    };

    useEffect(() => {
        void loadConversations();
    }, [loadConversations]);

    const sendReply = async () => {
        const conversationId = selectedConversation?.conversationId;
        const body = draft.trim();
        if (!conversationId || !body) return;
        try {
            setSending(true);
            setSendError(null);
            setSelectedConversation(await UserServices.sendAdminMessage(conversationId, { body }));
            setDraft("");
            setConversations(await UserServices.getAdminMessageConversations());
        } catch (err: unknown) {
            setSendError(err instanceof Error ? err.message : "Could not send this reply");
        } finally {
            setSending(false);
        }
    };

    return (
        <AdminMessagesView
            conversations={conversations}
            selectedConversation={selectedConversation}
            loading={loading}
            detailLoading={detailLoading}
            error={error}
            detailError={detailError}
            draft={draft}
            sending={sending}
            sendError={sendError}
            onSelectConversation={(conversationId) => void loadConversation(conversationId)}
            onDraftChange={setDraft}
            onSend={() => void sendReply()}
            onRefresh={() => void loadConversations()}
        />
    );
}
