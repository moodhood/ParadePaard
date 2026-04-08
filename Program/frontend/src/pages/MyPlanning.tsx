import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import PrimaryNav from "../components/PrimaryNav";
import Card from "../components/common/Card";
import Spinner from "../components/Spinner";
import { UserServices, type EmployeePlanningAssignmentDTO } from "../services/user-service/UserServices";
import { formatDate } from "../utils/dateFormat";

type PlanningTab = "upcoming" | "past";

function timeLabel(startTime: string, endTime: string): string {
    return `${startTime.slice(11, 16)} - ${endTime.slice(11, 16)}`;
}

export default function MyPlanning() {
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();
    const personalView = searchParams.get("view") === "personal";
    const initialTab = searchParams.get("tab") === "past" ? "past" : "upcoming";
    const [activeTab, setActiveTab] = useState<PlanningTab>(initialTab);
    const [items, setItems] = useState<EmployeePlanningAssignmentDTO[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [pendingActionId, setPendingActionId] = useState<string | null>(null);

    const loadPlanning = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await UserServices.getMyPlanning("all");
            setItems(data);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Failed to load planning");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        void loadPlanning();
    }, [loadPlanning]);

    useEffect(() => {
        const nextParams = new URLSearchParams();
        nextParams.set("tab", activeTab);
        if (personalView) {
            nextParams.set("view", "personal");
        }
        setSearchParams(nextParams, { replace: true });
    }, [activeTab, personalView, setSearchParams]);

    const withPersonalView = useCallback((target: string) => {
        return personalView ? `${target}${target.includes("?") ? "&" : "?"}view=personal` : target;
    }, [personalView]);

    const pendingRequests = useMemo(
        () => items.filter((item) => item.status === "ASSIGNED" && !item.isPast),
        [items]
    );
    const visibleItems = useMemo(
        () => items.filter((item) => item.status === "CONFIRMED" && (activeTab === "past" ? item.isPast : !item.isPast)),
        [activeTab, items]
    );

    const respond = async (scheduleEntryId: string, status: "CONFIRMED" | "CANCELLED") => {
        try {
            setPendingActionId(`${scheduleEntryId}:${status}`);
            await UserServices.respondToMyPlanningAssignment(scheduleEntryId, status);
            await loadPlanning();
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Failed to update shift");
        } finally {
            setPendingActionId(null);
        }
    };

    return (
        <>
            <Navbar />
            <div className="pageShell">
                <PrimaryNav />
                <div className="pageShellContent">
                    <header className="pageHeader">
                        <h1 className="pageTitle">My Planning</h1>
                    </header>
                    {loading ? (
                        <Spinner text="Loading your planning" />
                    ) : (
                        <div style={{ display: "grid", gap: 20 }}>
                            <Card title="Shift requests">
                                {error ? <p className="errorText">{error}</p> : null}
                                {pendingRequests.length === 0 ? (
                                    <p className="helperText">No pending shift requests.</p>
                                ) : (
                                    <div style={{ display: "grid", gap: 12 }}>
                                        {pendingRequests.map((item) => (
                                            <article key={item.scheduleEntryId} className="userPlanningRequestCard userPlanningRequestCard--pending">
                                                <div className="userPlanningRequestMain">
                                                    <div className="userPlanningRequestTitle">{item.eventName}</div>
                                                    <div className="userPlanningRequestMeta">
                                                        {formatDate(item.shiftDate)} · {timeLabel(item.startTime, item.endTime)}
                                                    </div>
                                                    <div className="userPlanningRequestMeta">
                                                        {item.functionName} · {item.shiftLocation ?? item.eventLocation ?? "Location follows after acceptance"}
                                                    </div>
                                                </div>
                                                <div className="userPlanningRequestActions">
                                                    <button
                                                        type="button"
                                                        className="button userPlanningDeclineButton"
                                                        disabled={Boolean(pendingActionId)}
                                                        onClick={() => void respond(item.scheduleEntryId, "CANCELLED")}
                                                    >
                                                        {pendingActionId === `${item.scheduleEntryId}:CANCELLED` ? "Declining..." : "Decline"}
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className="button userPlanningAcceptButton"
                                                        disabled={Boolean(pendingActionId)}
                                                        onClick={() => void respond(item.scheduleEntryId, "CONFIRMED")}
                                                    >
                                                        {pendingActionId === `${item.scheduleEntryId}:CONFIRMED` ? "Accepting..." : "Accept"}
                                                    </button>
                                                </div>
                                            </article>
                                        ))}
                                    </div>
                                )}
                            </Card>

                            <Card
                                title="Accepted shifts"
                                right={
                                    <div className="planningModeToggle userPlanningStatusToggle">
                                        {([
                                            { value: "upcoming", label: "Upcoming" },
                                            { value: "past", label: "Past" },
                                        ] as const).map((option) => (
                                            <button
                                                key={option.value}
                                                type="button"
                                                className={[
                                                    "planningModeButton",
                                                    activeTab === option.value ? "planningModeButton--active" : "",
                                                ].filter(Boolean).join(" ")}
                                                onClick={() => setActiveTab(option.value)}
                                            >
                                                {option.label}
                                            </button>
                                        ))}
                                    </div>
                                }
                            >
                                {visibleItems.length === 0 ? (
                                    <p className="helperText">
                                        {activeTab === "past" ? "No past accepted shifts yet." : "No upcoming accepted shifts."}
                                    </p>
                                ) : (
                                    <div style={{ display: "grid", gap: 12 }}>
                                        {visibleItems.map((item) => (
                                            <button
                                                key={item.scheduleEntryId}
                                                type="button"
                                                className="listRowGrid userPlanningGrid"
                                                style={{
                                                    display: "grid",
                                                    gridTemplateColumns: "2fr 1fr 1fr 1fr auto",
                                                    gap: 12,
                                                    textAlign: "left",
                                                    padding: 14,
                                                    border: "1px solid #e5e7eb",
                                                    borderRadius: 12,
                                                    background: "#fff",
                                                    cursor: "pointer",
                                                }}
                                                onClick={() => navigate(withPersonalView(`/my-planning/${item.scheduleEntryId}${activeTab === "past" ? "?tab=past" : ""}`))}
                                            >
                                                <div>
                                                    <div className="cellMain">{item.eventName}</div>
                                                    <div className="cellSub">{item.shiftName ?? item.functionName}</div>
                                                </div>
                                                <div className="cellSub">{formatDate(item.shiftDate)}</div>
                                                <div className="cellSub">{timeLabel(item.startTime, item.endTime)}</div>
                                                <div className="cellSub">{item.shiftLocation ?? item.eventLocation ?? "-"}</div>
                                                <div className="cellSub">{item.timesheetExported ? "Logged" : activeTab === "past" ? "Pending log" : "Scheduled"}</div>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </Card>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
