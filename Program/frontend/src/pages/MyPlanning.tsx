import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import PrimaryNav from "../components/PrimaryNav";
import Card from "../components/common/Card";
import Spinner from "../components/Spinner";
import { UserServices, type EmployeePlanningAssignmentDTO } from "../services/user-service/UserServices";
import { formatDate } from "../utils/dateFormat";
import "../stylesheets/UserDashboard.css";
import "../stylesheets/AdminPlanningOverview.css";

type PlanningTab = "upcoming" | "past";

function timeLabel(startTime: string, endTime: string): string {
    return `${startTime.slice(11, 16)} - ${endTime.slice(11, 16)}`;
}

function sortAssignments(items: EmployeePlanningAssignmentDTO[]): EmployeePlanningAssignmentDTO[] {
    return [...items].sort((left, right) => {
        const dateCompare = left.shiftDate.localeCompare(right.shiftDate);
        if (dateCompare !== 0) return dateCompare;
        return left.startTime.localeCompare(right.startTime);
    });
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

    const scheduledItems = useMemo(
        () => sortAssignments(
            items.filter((item) => item.status === "ASSIGNED" && (activeTab === "past" ? item.isPast : !item.isPast))
        ),
        [activeTab, items]
    );

    const acceptedItems = useMemo(
        () => sortAssignments(
            items.filter((item) => item.status === "CONFIRMED" && (activeTab === "past" ? item.isPast : !item.isPast))
        ),
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
                        <Card
                            title="Accepted shifts"
                            className="userPlanningCard userPlanningAcceptedCard"
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
                                            aria-pressed={activeTab === option.value}
                                        >
                                            {option.label}
                                        </button>
                                    ))}
                                </div>
                            }
                        >
                            {error ? <p className="errorText userPlanningSectionMessage">{error}</p> : null}
                            <div className="userPlanningAcceptedLayout">
                                <section className="userPlanningSection">
                                    <div className="userPlanningSectionHeader">
                                        <div>
                                            <div className="userPlanningSectionTitle">Scheduled shifts</div>
                                            <div className="userPlanningSectionText">
                                                Accept a scheduled shift and it moves into your accepted list.
                                            </div>
                                        </div>
                                        <span className="userPlanningSectionBadge">{scheduledItems.length}</span>
                                    </div>
                                    {scheduledItems.length === 0 ? (
                                        <p className="helperText userPlanningSectionMessage">
                                            {activeTab === "past"
                                                ? "No past scheduled shifts waiting for a response."
                                                : "No scheduled shifts waiting for a response."}
                                        </p>
                                    ) : (
                                        <div className="userPlanningSectionCardList">
                                            {scheduledItems.map((item) => {
                                                const isExpiredRequest = Boolean(item.isPast);
                                                return (
                                                    <article key={item.scheduleEntryId} className="userPlanningRequestCard userPlanningPanelCard">
                                                        <div className="userPlanningRequestMain">
                                                            <div className="userPlanningRequestTitle">{item.eventName}</div>
                                                            <div className="userPlanningRequestMeta">
                                                                {formatDate(item.shiftDate)} - {timeLabel(item.startTime, item.endTime)}
                                                            </div>
                                                            <div className="userPlanningRequestMeta">
                                                                {item.functionName} - {item.shiftLocation ?? item.eventLocation ?? "Location follows after acceptance"}
                                                            </div>
                                                            {isExpiredRequest ? (
                                                                <div className="userPlanningRequestMeta">
                                                                    This request is visible for history, but the shift has already ended.
                                                                </div>
                                                            ) : null}
                                                        </div>
                                                        <div className="userPlanningRequestActions">
                                                            <button
                                                                type="button"
                                                                className="button userPlanningDeclineButton"
                                                                disabled={Boolean(pendingActionId) || isExpiredRequest}
                                                                onClick={() => void respond(item.scheduleEntryId, "CANCELLED")}
                                                            >
                                                                {pendingActionId === `${item.scheduleEntryId}:CANCELLED` ? "Declining..." : "Decline"}
                                                            </button>
                                                            <button
                                                                type="button"
                                                                className="button userPlanningAcceptButton"
                                                                disabled={Boolean(pendingActionId) || isExpiredRequest}
                                                                onClick={() => void respond(item.scheduleEntryId, "CONFIRMED")}
                                                            >
                                                                {pendingActionId === `${item.scheduleEntryId}:CONFIRMED` ? "Accepting..." : "Accept"}
                                                            </button>
                                                        </div>
                                                    </article>
                                                );
                                            })}
                                        </div>
                                    )}
                                </section>

                                <section className="userPlanningSection">
                                    <div className="userPlanningSectionHeader">
                                        <div>
                                            <div className="userPlanningSectionTitle">Accepted shifts</div>
                                            <div className="userPlanningSectionText">
                                                {activeTab === "past" ? "Review completed accepted shifts." : "Your confirmed shifts for the coming period."}
                                            </div>
                                        </div>
                                        <span className="userPlanningSectionBadge">{acceptedItems.length}</span>
                                    </div>
                                    {acceptedItems.length === 0 ? (
                                        <p className="helperText userPlanningSectionMessage">
                                            {activeTab === "past" ? "No past accepted shifts yet." : "No upcoming accepted shifts."}
                                        </p>
                                    ) : (
                                        <div className="userPlanningAcceptedList">
                                            {acceptedItems.map((item) => (
                                                <button
                                                    key={item.scheduleEntryId}
                                                    type="button"
                                                    className="userPlanningAcceptedItem"
                                                    onClick={() => navigate(withPersonalView(`/my-planning/${item.scheduleEntryId}${activeTab === "past" ? "?tab=past" : ""}`))}
                                                >
                                                    <div className="userPlanningAcceptedItemMain">
                                                        <div className="userPlanningAcceptedItemTitle">{item.eventName}</div>
                                                        <div className="userPlanningAcceptedItemMeta">{item.shiftName ?? item.functionName}</div>
                                                    </div>
                                                    <div className="userPlanningAcceptedItemMeta">{formatDate(item.shiftDate)}</div>
                                                    <div className="userPlanningAcceptedItemMeta">{timeLabel(item.startTime, item.endTime)}</div>
                                                    <div className="userPlanningAcceptedItemMeta">{item.shiftLocation ?? item.eventLocation ?? "-"}</div>
                                                    <div className="userPlanningAcceptedItemStatus">
                                                        {item.timesheetExported ? "Logged" : activeTab === "past" ? "Pending log" : "Scheduled"}
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </section>
                            </div>
                        </Card>
                    )}
                </div>
            </div>
        </>
    );
}
