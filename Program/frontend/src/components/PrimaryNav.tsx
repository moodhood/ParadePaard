import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { UserServices, type MessageRealtimeEventDTO } from "../services/user-service/UserServices";
import { canAccessManagement, canViewPayslips } from "../utils/permissionPolicy";
import "../stylesheets/PrimaryNav.css";

type PrimaryNavProps = {
    messageUnreadCount?: number | null;
};

function normalizeUnreadCount(value?: number | null) {
    if (typeof value !== "number" || !Number.isFinite(value)) return 0;
    return Math.max(0, Math.floor(value));
}

function formatUnreadCount(value: number) {
    return value > 99 ? "99+" : String(value);
}

export default function PrimaryNav({ messageUnreadCount: providedMessageUnreadCount }: PrimaryNavProps = {}) {
    const location = useLocation();
    const path = location.pathname;
    const currentPath = `${location.pathname}${location.search}`;
    const accountReturnTo =
        path.startsWith("/account") &&
        location.state &&
        typeof location.state === "object" &&
        typeof (location.state as { accountReturnTo?: unknown }).accountReturnTo === "string"
            ? ((location.state as { accountReturnTo: string }).accountReturnTo)
            : path.startsWith("/account")
              ? "/dashboard"
              : currentPath;
    const { permissions } = useAuth();
    const showManagement = canAccessManagement(permissions);
    const showPayslips = canViewPayslips(permissions);
    const [loadedMessageUnreadCount, setLoadedMessageUnreadCount] = useState(0);
    const sseBaseUrl = useMemo(() => {
        return (import.meta.env.VITE_API_BASE_URL ?? "http://localhost:4004").replace(/\/$/, "");
    }, []);

    useEffect(() => {
        if (providedMessageUnreadCount !== undefined) return;
        let cancelled = false;

        const loadUnreadCount = async () => {
            try {
                const unreadCount = await UserServices.getMyMessageUnreadCount();
                if (!cancelled) setLoadedMessageUnreadCount(normalizeUnreadCount(unreadCount));
            } catch {
                if (!cancelled) setLoadedMessageUnreadCount(0);
            }
        };

        void loadUnreadCount();

        if (typeof EventSource === "undefined") {
            const interval = window.setInterval(() => void loadUnreadCount(), 4000);
            return () => {
                cancelled = true;
                window.clearInterval(interval);
            };
        }

        const source = new EventSource(`${sseBaseUrl}/api/messages/me/stream`, { withCredentials: true });
        source.onmessage = (evt: MessageEvent<string>) => {
            let data: MessageRealtimeEventDTO | null = null;
            try {
                data = JSON.parse(evt.data) as MessageRealtimeEventDTO;
            } catch {
                return;
            }

            if (data?.unreadByUserCount !== undefined) {
                setLoadedMessageUnreadCount(normalizeUnreadCount(data.unreadByUserCount));
            }
        };

        source.addEventListener("error", () => {
            // EventSource reconnects automatically; keep the last known count.
        });

        return () => {
            cancelled = true;
            source.close();
        };
    }, [providedMessageUnreadCount, sseBaseUrl]);

    const messageUnreadCount = normalizeUnreadCount(providedMessageUnreadCount ?? loadedMessageUnreadCount);
    const messageUnreadLabel = messageUnreadCount > 0 ? formatUnreadCount(messageUnreadCount) : "";
    const messagesAriaLabel = messageUnreadCount > 0 ? `Messages, ${messageUnreadLabel} unread` : "Messages";

    const isDashboardActive = path === "/dashboard";
    const isManagementActive = path.startsWith("/management");
    const isPayslipsActive = path.startsWith("/payslips");
    const isMyPlanningActive = path.startsWith("/my-planning");
    const isWorkHistoryActive = path.startsWith("/work-history");
    const isMessagesActive = path.startsWith("/messages");
    const isAccountActive = path.startsWith("/account");

    const linkClass = (active: boolean) =>
        `nav_quick_link primaryNavLink${active ? " primaryNavLink--active" : ""}`;

    return (
        <nav className="primaryNav" aria-label="Primary navigation">
            <div className="primaryNavLinks">
                <Link
                    className={linkClass(isDashboardActive)}
                    to="/dashboard"
                    aria-current={isDashboardActive ? "page" : undefined}
                    aria-label="Dashboard"
                    title="Dashboard"
                >
                    <svg
                        className="nav_quick_icon"
                        viewBox="0 0 24 24"
                        width="18"
                        height="18"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                    >
                        <path d="M3 11l9-8 9 8" />
                        <path d="M5 10v10h14V10" />
                    </svg>
                    <span className="nav_quick_text">Dashboard</span>
                </Link>

                {showManagement ? (
                    <Link
                        className={linkClass(isManagementActive)}
                        to="/management"
                        aria-current={isManagementActive ? "page" : undefined}
                        aria-label="Management"
                        title="Management"
                    >
                        <svg
                            className="nav_quick_icon"
                            viewBox="0 0 24 24"
                            width="18"
                            height="18"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            aria-hidden="true"
                        >
                            <path d="M4 6h16" />
                            <path d="M4 12h16" />
                            <path d="M4 18h16" />
                        </svg>
                        <span className="nav_quick_text">Management</span>
                    </Link>
                ) : null}

                {showPayslips ? (
                    <Link
                        className={linkClass(isPayslipsActive)}
                        to="/payslips"
                        aria-current={isPayslipsActive ? "page" : undefined}
                        aria-label="Payslips"
                        title="Payslips"
                    >
                        <svg
                            className="nav_quick_icon"
                            viewBox="0 0 24 24"
                            width="18"
                            height="18"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            aria-hidden="true"
                        >
                            <path d="M7 3h7l5 5v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z" />
                            <path d="M14 3v5h5" />
                            <path d="M9 13h6" />
                            <path d="M9 17h6" />
                        </svg>
                        <span className="nav_quick_text">Payslips</span>
                    </Link>
                ) : null}

                <Link
                    className={linkClass(isMyPlanningActive)}
                    to="/my-planning"
                    aria-current={isMyPlanningActive ? "page" : undefined}
                    aria-label="My planning"
                    title="My planning"
                >
                    <svg
                        className="nav_quick_icon"
                        viewBox="0 0 24 24"
                        width="18"
                        height="18"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                    >
                        <rect x="3" y="4" width="18" height="18" rx="2" />
                        <path d="M8 2v4" />
                        <path d="M16 2v4" />
                        <path d="M3 10h18" />
                    </svg>
                    <span className="nav_quick_text">My planning</span>
                </Link>

                <Link
                    className={linkClass(isWorkHistoryActive)}
                    to="/work-history"
                    aria-current={isWorkHistoryActive ? "page" : undefined}
                    aria-label="Work history"
                    title="Work history"
                >
                    <svg
                        className="nav_quick_icon"
                        viewBox="0 0 24 24"
                        width="18"
                        height="18"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                    >
                        <circle cx="12" cy="12" r="9" />
                        <path d="M12 7v6l4 2" />
                    </svg>
                    <span className="nav_quick_text">Work history</span>
                </Link>

                <Link
                    className={linkClass(isMessagesActive)}
                    to="/messages"
                    aria-current={isMessagesActive ? "page" : undefined}
                    aria-label={messagesAriaLabel}
                    title="Messages"
                >
                    <svg
                        className="nav_quick_icon"
                        viewBox="0 0 24 24"
                        width="18"
                        height="18"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                    >
                        <path d="M21 15a4 4 0 0 1-4 4H7l-4 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z" />
                    </svg>
                    {messageUnreadCount > 0 ? (
                        <span className="primaryNavBadge" aria-hidden="true">
                            {messageUnreadLabel}
                        </span>
                    ) : null}
                    <span className="nav_quick_text">Messages</span>
                </Link>

                <Link
                    className={linkClass(isAccountActive)}
                    to="/account"
                    state={{ accountReturnTo }}
                    aria-current={isAccountActive ? "page" : undefined}
                    aria-label="Account"
                    title="Account"
                >
                    <svg
                        className="nav_quick_icon"
                        viewBox="0 0 24 24"
                        width="18"
                        height="18"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                    >
                        <path d="M20 21a8 8 0 1 0-16 0" />
                        <circle cx="12" cy="7" r="4" />
                    </svg>
                    <span className="nav_quick_text">Account</span>
                </Link>
            </div>
        </nav>
    );
}
