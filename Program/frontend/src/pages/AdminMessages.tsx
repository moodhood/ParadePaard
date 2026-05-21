import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import Navbar from "../components/Navbar";
import PrimaryNav from "../components/PrimaryNav";
import { UserServices, type MessageConversationDTO, type MessageEntryDTO, type MessageRealtimeEventDTO } from "../services/user-service/UserServices";
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
    onBackToInbox: () => void;
    headerActions?: ReactNode;
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
    onBackToInbox,
    headerActions,
}: AdminMessagesViewProps) {
    return (
        <>
            <Navbar />
            <div className="messagesPage">
                <div className="pageShell">
                    <PrimaryNav />
                    <main className="pageShellContent">
                        <header className="pageHeader">
                            <h1 className="pageTitle">Shared Inbox</h1>
                        </header>
                        <div className="messagesDockLayout">
                            <AdminSharedInboxPanel
                                conversations={conversations}
                                selectedConversation={selectedConversation}
                                loading={loading}
                                detailLoading={detailLoading}
                                error={error}
                                detailError={detailError}
                                draft={draft}
                                sending={sending}
                                sendError={sendError}
                                onSelectConversation={onSelectConversation}
                                onDraftChange={onDraftChange}
                                onSend={onSend}
                                onBackToInbox={onBackToInbox}
                                headerActions={headerActions}
                            />
                        </div>
                    </main>
                </div>
            </div>
        </>
    );
}

export function AdminSharedInboxPanel({
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
    onBackToInbox,
    headerActions,
}: AdminMessagesViewProps) {
    const chatOpen = Boolean(selectedConversation);
    const messageListRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const el = messageListRef.current;
        if (!el) return;
        const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
        const nearBottom = distanceFromBottom < 80;
        if (!nearBottom) return;
        el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
    }, [(selectedConversation?.messages ?? []).length]);

    return (
        <section className={`messagePanel messageAdminBox${chatOpen ? " messageAdminBox--chat" : ""}`}>
            {!selectedConversation ? (
                <>
                    <div className="messagePanelHeader">
                        <div>
                            <h2 className="messagePanelTitle">Conversations</h2>
                            <p className="messagePanelMeta">Visible to all admins with message access.</p>
                        </div>
                        <div className="messagePanelActions">
                            {headerActions}
                        </div>
                    </div>
                    {loading ? <p className="messageEmpty">Loading inbox...</p> : null}
                    {error ? <p className="messageError">{error}</p> : null}
                    {!loading && !error && conversations.length === 0 ? (
                        <p className="messageEmpty">No conversations yet</p>
                    ) : null}
                    <div className="messageInboxList">
                        {conversations.map((conversation) => {
                            const unread = conversation.unreadByAdminCount ?? 0;
                            return (
                                <button
                                    type="button"
                                    key={conversation.conversationId}
                                    className="messageInboxRow"
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
                </>
            ) : (
                <>
                    <div className="messagePanelHeader messagePanelHeader--chat">
                        <button type="button" className="messageBackButton" onClick={onBackToInbox}>
                            <span aria-hidden="true">‹</span>
                            Back to inbox
                        </button>
                        <div className="messageThreadHeading">
                            <h2 className="messagePanelTitle">
                                {selectedConversation.userDisplayName ?? selectedConversation.userEmail ?? "Unknown user"}
                            </h2>
                            <p className="messagePanelMeta">{selectedConversation.userEmail}</p>
                        </div>
                        <div className="messagePanelActions">{headerActions}</div>
                    </div>
                    {detailLoading ? <p className="messageEmpty">Loading conversation...</p> : null}
                    {detailError ? <p className="messageError">{detailError}</p> : null}
                    <div className="messageList" ref={messageListRef}>
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
            )}
        </section>
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

    const sseBaseUrl = useMemo(() => {
        const base = (import.meta.env.VITE_API_BASE_URL ?? "http://localhost:4004").replace(/\/$/, "");
        return base;
    }, []);

    const refreshSelectedConversation = useCallback(async () => {
        const conversationId = selectedConversation?.conversationId;
        if (!conversationId) return;
        try {
            setDetailLoading(true);
            setDetailError(null);
            setSelectedConversation(await UserServices.getAdminMessageConversation(conversationId));
        } catch (err: unknown) {
            setDetailError(err instanceof Error ? err.message : "Could not load this conversation");
        } finally {
            setDetailLoading(false);
        }
    }, [selectedConversation?.conversationId]);

    const loadConversations = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await UserServices.getAdminMessageConversations();
            setConversations(data);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Could not load the shared inbox");
        } finally {
            setLoading(false);
        }
    }, []);

    const loadConversation = async (conversationId: string) => {
        try {
            const conversationPreview = conversations.find((conversation) => conversation.conversationId === conversationId);
            if (conversationPreview) {
                setSelectedConversation(conversationPreview);
            }
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

    useEffect(() => {
        if (typeof EventSource === "undefined") {
            const interval = window.setInterval(() => {
                void loadConversations();
                void refreshSelectedConversation();
            }, 4000);
            return () => window.clearInterval(interval);
        }

        const source = new EventSource(`${sseBaseUrl}/api/messages/admin/conversations/stream`, { withCredentials: true });

        source.onmessage = (evt: MessageEvent<string>) => {
            let data: MessageRealtimeEventDTO | null = null;
            try {
                data = JSON.parse(evt.data) as MessageRealtimeEventDTO;
            } catch {
                return;
            }

            const conversationId = data?.conversationId ?? null;
            const incoming = data?.message ?? null;
            if (!conversationId || !incoming?.messageId) return;

            setConversations((prev) => {
                const next = prev.slice();
                const idx = next.findIndex((c) => c.conversationId === conversationId);
                if (idx === -1) {
                    next.push({
                        conversationId,
                        userId: null,
                        userDisplayName: data?.userDisplayName ?? null,
                        userEmail: data?.userEmail ?? null,
                        lastMessagePreview: data?.lastMessagePreview ?? incoming.body ?? null,
                        lastMessageAt: data?.lastMessageAt ?? null,
                        unreadByAdminCount: data?.unreadByAdminCount ?? 0,
                        unreadByUserCount: data?.unreadByUserCount ?? 0,
                        messages: [],
                    });
                }

                if (idx !== -1) {
                    const existing = next[idx];
                    const updated: MessageConversationDTO = {
                        ...existing,
                        lastMessageAt: data?.lastMessageAt ?? existing.lastMessageAt,
                        lastMessagePreview: data?.lastMessagePreview ?? existing.lastMessagePreview,
                        unreadByAdminCount: data?.unreadByAdminCount ?? existing.unreadByAdminCount,
                        unreadByUserCount: data?.unreadByUserCount ?? existing.unreadByUserCount,
                    };
                    next[idx] = updated;
                }
                next.sort((a, b) => {
                    const ta = a.lastMessageAt ? Date.parse(a.lastMessageAt) : 0;
                    const tb = b.lastMessageAt ? Date.parse(b.lastMessageAt) : 0;
                    return tb - ta;
                });
                return next;
            });

            setSelectedConversation((prev) => {
                if (!prev) return prev;
                if ((prev.conversationId ?? null) !== conversationId) return prev;

                const messages = prev.messages ?? [];
                if (messages.some((m) => m.messageId === incoming.messageId)) {
                    return {
                        ...prev,
                        lastMessageAt: data?.lastMessageAt ?? prev.lastMessageAt,
                        lastMessagePreview: data?.lastMessagePreview ?? prev.lastMessagePreview,
                        unreadByAdminCount: data?.unreadByAdminCount ?? prev.unreadByAdminCount,
                        unreadByUserCount: data?.unreadByUserCount ?? prev.unreadByUserCount,
                    };
                }

                const nextMessages: MessageEntryDTO[] = [...messages, incoming].slice().sort((a, b) => {
                    const ta = a.createdAt ? Date.parse(a.createdAt) : 0;
                    const tb = b.createdAt ? Date.parse(b.createdAt) : 0;
                    if (ta !== tb) return ta - tb;
                    return String(a.messageId ?? "").localeCompare(String(b.messageId ?? ""));
                });

                return {
                    ...prev,
                    lastMessageAt: data?.lastMessageAt ?? prev.lastMessageAt,
                    lastMessagePreview: data?.lastMessagePreview ?? prev.lastMessagePreview,
                    unreadByAdminCount: data?.unreadByAdminCount ?? prev.unreadByAdminCount,
                    unreadByUserCount: data?.unreadByUserCount ?? prev.unreadByUserCount,
                    messages: nextMessages,
                };
            });
        };

        return () => source.close();
    }, [loadConversations, refreshSelectedConversation, sseBaseUrl]);


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
            onBackToInbox={() => {
                setSelectedConversation(null);
                setDraft("");
                setDetailError(null);
            }}
        />
    );
}
