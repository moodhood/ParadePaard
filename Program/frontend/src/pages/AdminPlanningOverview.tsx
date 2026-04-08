import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import PrimaryNav from "../components/PrimaryNav";
import Card from "../components/common/Card";
import Modal from "../components/common/Modal";
import {
    UserServices,
    type PlanningClientCompanyDTO,
    type PlanningEventDTO,
    type PlanningEventSaveDTO,
} from "../services/user-service/UserServices";
import { formatDate } from "../utils/dateFormat";
import { formatDateInput, normalizeDateInput, parseDisplayDate } from "../utils/dateInput";
import {
    getEventCheckedInCount,
    getEventClientName,
    getEventRequiredCount,
    getEventScheduledCount,
    getEventShiftRecords,
    getEventStaffingTone,
    getEventTimeLabel,
    getShiftCheckedInCount,
    getShiftDisplayName,
    getShiftRequiredCount,
    getShiftScheduledCount,
    getShiftStaffingTone,
    getShiftTimeLabel,
    type PlanningStaffingTone,
} from "../utils/planningSummary";
import "../stylesheets/AdminDashboard.css";
import "../stylesheets/AdminPlanningOverview.css";
import "../stylesheets/Settings.css";

type PlannerMode = "events" | "shifts";
type PlanningView = "week" | "month";
type EventCreateStep = "details" | "client" | "notes";

function parseDutchTimeInput(value: string): string | null {
    const trimmed = value.trim();
    if (!trimmed) return null;
    const match = trimmed.match(/^([01]\d|2[0-3]):([0-5]\d)$/);
    if (!match) return null;
    return trimmed;
}

type PlannerEntry = {
    id: string;
    title: string;
    subtitle?: string;
    timeLabel: string;
    clientLabel: string;
    ratioLabel: string;
    completionLabel: string;
    staffingTone: PlanningStaffingTone;
    tone: PlannerMode;
    href?: string;
};

function getStaffingTooltipLabel(): string {
    return "Required / Scheduled / Checked in";
}

function getCompletionLabel(required: number, scheduled: number): string {
    if (required <= 0) return "0%";
    return `${Math.min(100, Math.round((scheduled / required) * 100))}%`;
}

function toIsoDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

function parseIsoDate(value: string): Date {
    return new Date(`${value}T00:00:00`);
}

function addDays(value: string, amount: number): string {
    const next = parseIsoDate(value);
    next.setDate(next.getDate() + amount);
    return toIsoDate(next);
}

function startOfWeek(value: string): string {
    const date = parseIsoDate(value);
    const day = date.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    date.setDate(date.getDate() + diff);
    return toIsoDate(date);
}

function buildWeek(value: string): string[] {
    const weekStart = startOfWeek(value);
    return Array.from({ length: 7 }, (_, index) => addDays(weekStart, index));
}

function startOfMonth(value: string): string {
    const date = parseIsoDate(value);
    date.setDate(1);
    return toIsoDate(date);
}

function endOfWeek(value: string): string {
    const weekStart = startOfWeek(value);
    return addDays(weekStart, 6);
}

function endOfMonth(value: string): string {
    const date = parseIsoDate(value);
    date.setMonth(date.getMonth() + 1, 0);
    return toIsoDate(date);
}

function addMonths(value: string, amount: number): string {
    const current = parseIsoDate(value);
    const targetDay = current.getDate();
    const next = new Date(current.getFullYear(), current.getMonth() + amount, 1);
    const lastDay = new Date(next.getFullYear(), next.getMonth() + 1, 0).getDate();
    next.setDate(Math.min(targetDay, lastDay));
    return toIsoDate(next);
}

function buildMonth(value: string): string[] {
    const monthStart = startOfMonth(value);
    const monthEnd = endOfMonth(value);
    const gridStart = startOfWeek(monthStart);
    const gridEnd = endOfWeek(monthEnd);
    const totalDays = Math.round((parseIsoDate(gridEnd).getTime() - parseIsoDate(gridStart).getTime()) / 86400000) + 1;
    return Array.from({ length: totalDays }, (_, index) => addDays(gridStart, index));
}

function buildDayRange(startDate: string, endDate: string): string[] {
    const start = parseIsoDate(startDate);
    const end = parseIsoDate(endDate);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end < start) {
        return [];
    }

    const days: string[] = [];
    const cursor = new Date(start);
    while (cursor <= end) {
        days.push(toIsoDate(cursor));
        cursor.setDate(cursor.getDate() + 1);
    }
    return days;
}

function formatMonthHeader(value: string): string {
    const parsed = parseIsoDate(value);
    if (Number.isNaN(parsed.getTime())) return value;
    return new Intl.DateTimeFormat("en-US", {
        month: "short",
        year: "numeric",
    }).format(parsed);
}

function formatWeekday(value: string): string {
    const parsed = parseIsoDate(value);
    if (Number.isNaN(parsed.getTime())) return value;
    return new Intl.DateTimeFormat("en-US", {
        weekday: "short",
    }).format(parsed);
}

function formatDayNumber(value: string): string {
    const parsed = parseIsoDate(value);
    if (Number.isNaN(parsed.getTime())) return value;
    return new Intl.DateTimeFormat("en-US", {
        day: "numeric",
    }).format(parsed);
}

function getMajorityMonthLabel(days: string[], fallback: string): string {
    if (days.length === 0) {
        return formatMonthHeader(fallback);
    }

    const monthCounts = new Map<string, number>();
    for (const day of days) {
        const monthKey = day.slice(0, 7);
        monthCounts.set(monthKey, (monthCounts.get(monthKey) ?? 0) + 1);
    }

    const dominantMonth = [...monthCounts.entries()].sort((left, right) => {
        if (right[1] !== left[1]) return right[1] - left[1];
        if (left[0] === fallback.slice(0, 7)) return -1;
        if (right[0] === fallback.slice(0, 7)) return 1;
        return left[0].localeCompare(right[0]);
    })[0]?.[0];

    return formatMonthHeader(`${dominantMonth ?? fallback.slice(0, 7)}-01`);
}

function getEventEntriesByDay(events: PlanningEventDTO[]): Map<string, PlannerEntry[]> {
    const entriesByDay = new Map<string, PlannerEntry[]>();

    for (const event of events) {
        const totalShiftCount = getEventShiftRecords(event).length;

        for (const day of buildDayRange(event.startDate, event.endDate)) {
            const entries = entriesByDay.get(day) ?? [];
            const dateLabel = event.startDate === event.endDate
                ? formatDate(event.startDate)
                : `${formatDate(event.startDate)} to ${formatDate(event.endDate)}`;
            const requiredCount = getEventRequiredCount(event);
            const scheduledCount = getEventScheduledCount(event);
            const checkedInCount = getEventCheckedInCount(event);

            entries.push({
                id: `${event.eventId}-${day}`,
                title: event.eventName,
                subtitle: totalShiftCount === 0
                    ? "No shifts planned"
                    : `${totalShiftCount} shift${totalShiftCount === 1 ? "" : "s"} planned`,
                timeLabel: `${dateLabel}${getEventTimeLabel(event) === "No time set" ? "" : ` - ${getEventTimeLabel(event)}`}`,
                clientLabel: getEventClientName(event),
                ratioLabel: `(${requiredCount}/${scheduledCount}/${checkedInCount})`,
                completionLabel: getCompletionLabel(requiredCount, scheduledCount),
                staffingTone: getEventStaffingTone(event),
                tone: "events",
                href: `/admin/planning/events/${event.eventId}`,
            });

            entriesByDay.set(day, entries);
        }
    }

    for (const [day, entries] of entriesByDay.entries()) {
        entriesByDay.set(day, [...entries].sort((left, right) => left.title.localeCompare(right.title)));
    }

    return entriesByDay;
}

function getShiftEntriesByDay(events: PlanningEventDTO[]): Map<string, PlannerEntry[]> {
    const entriesByDay = new Map<string, PlannerEntry[]>();

    for (const event of events) {
        for (const day of event.days) {
            const entries = entriesByDay.get(day.day) ?? [];
            const sortedShifts = [...day.shifts].sort((left, right) => left.startTime.localeCompare(right.startTime));

            for (const shift of sortedShifts) {
                const shiftName = getShiftDisplayName(shift);
                const requiredCount = getShiftRequiredCount(shift);
                const scheduledCount = getShiftScheduledCount(shift);
                const checkedInCount = getShiftCheckedInCount(shift);

                entries.push({
                    id: `${day.day}-${shift.shiftId}`,
                    title: shiftName,
                    subtitle: event.eventName,
                    timeLabel: getShiftTimeLabel(shift),
                    clientLabel: getEventClientName(event),
                    ratioLabel: `(${requiredCount}/${scheduledCount}/${checkedInCount})`,
                    completionLabel: getCompletionLabel(requiredCount, scheduledCount),
                    staffingTone: getShiftStaffingTone(shift),
                    tone: "shifts",
                    href: `/admin/planning/events/${event.eventId}?shift=${shift.shiftId}`,
                });
            }

            entriesByDay.set(day.day, entries);
        }
    }

    for (const [day, entries] of entriesByDay.entries()) {
        entriesByDay.set(day, [...entries].sort((left, right) => left.title.localeCompare(right.title)));
    }

    return entriesByDay;
}

function ChevronLeftIcon() {
    return (
        <svg viewBox="0 0 20 20" aria-hidden="true" focusable="false">
            <path d="M11.75 4.75L6.5 10l5.25 5.25" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
        </svg>
    );
}

function ChevronRightIcon() {
    return (
        <svg viewBox="0 0 20 20" aria-hidden="true" focusable="false">
            <path d="M8.25 4.75L13.5 10l-5.25 5.25" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
        </svg>
    );
}

function SuccessCheckIcon() {
    return (
        <svg viewBox="0 0 20 20" aria-hidden="true" focusable="false">
            <circle cx="10" cy="10" r="8" fill="currentColor" opacity="0.16" />
            <path d="M6.4 10.3l2.2 2.2 5-5" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.9" />
        </svg>
    );
}

export default function AdminPlanningOverview() {
    const navigate = useNavigate();
    const today = useMemo(() => toIsoDate(new Date()), []);
    const [loading, setLoading] = useState(true);
    const [loadingClients, setLoadingClients] = useState(true);
    const [savingEvent, setSavingEvent] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [clientError, setClientError] = useState<string | null>(null);
    const [eventSaveError, setEventSaveError] = useState<string | null>(null);
    const [eventSaveSuccess, setEventSaveSuccess] = useState<string | null>(null);
    const [events, setEvents] = useState<PlanningEventDTO[]>([]);
    const [clients, setClients] = useState<PlanningClientCompanyDTO[]>([]);
    const [selectedDate, setSelectedDate] = useState<string>(today);
    const [expandedDay, setExpandedDay] = useState<string>(today);
    const [planningView, setPlanningView] = useState<PlanningView>("week");
    const [plannerMode, setPlannerMode] = useState<PlannerMode>("events");
    const [isCreateEventOpen, setIsCreateEventOpen] = useState(false);
    const [createEventStep, setCreateEventStep] = useState<EventCreateStep>("details");
    const [eventDraft, setEventDraft] = useState<PlanningEventSaveDTO>({
        name: "",
        startDate: formatDateInput(today),
        endDate: formatDateInput(today),
        clientCompanyId: "",
        location: "",
        internalDescription: "",
    });

    const loadPlanningOverview = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const company = await UserServices.getMyCompany();
            const data = await UserServices.getPlanningOverview(company.companyId);
            setEvents(data);
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "Failed to load planning overview";
            setError(message);
        } finally {
            setLoading(false);
        }
    }, []);

    const loadPlanningClients = useCallback(async () => {
        try {
            setLoadingClients(true);
            setClientError(null);
            const data = await UserServices.getPlanningClients();
            setClients(data);
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "Failed to load planning clients";
            setClientError(message);
        } finally {
            setLoadingClients(false);
        }
    }, []);

    useEffect(() => {
        void loadPlanningOverview();
    }, [loadPlanningOverview]);

    useEffect(() => {
        void loadPlanningClients();
    }, [loadPlanningClients]);

    useEffect(() => {
        if (!eventSaveSuccess) return;
        const timeoutId = window.setTimeout(() => setEventSaveSuccess(null), 3200);
        return () => window.clearTimeout(timeoutId);
    }, [eventSaveSuccess]);

    const eventEntriesByDay = useMemo(() => getEventEntriesByDay(events), [events]);
    const shiftEntriesByDay = useMemo(() => getShiftEntriesByDay(events), [events]);
    const weekDays = useMemo(() => buildWeek(selectedDate), [selectedDate]);
    const monthDays = useMemo(() => buildMonth(selectedDate), [selectedDate]);
    const activeMonthKey = selectedDate.slice(0, 7);
    const visibleMonthLabel = useMemo(
        () => (planningView === "week" ? getMajorityMonthLabel(weekDays, selectedDate) : formatMonthHeader(startOfMonth(selectedDate))),
        [planningView, selectedDate, weekDays]
    );

    const shiftVisibleRange = (direction: -1 | 1) => {
        if (planningView === "week") {
            setSelectedDate((current) => addDays(current, direction * 7));
            setExpandedDay((current) => current ? addDays(current, direction * 7) : current);
            return;
        }

        setSelectedDate((current) => addMonths(current, direction));
        setExpandedDay((current) => current ? addMonths(current, direction) : current);
    };

    const resetCreateEventForm = useCallback(() => {
        setCreateEventStep("details");
        setEventSaveError(null);
        setEventSaveSuccess(null);
        setEventDraft({
            name: "",
            startDate: formatDateInput(selectedDate),
            endDate: formatDateInput(selectedDate),
            clientCompanyId: "",
            location: "",
            internalDescription: "",
            defaultStartTime: "",
            defaultEndTime: "",
        });
    }, [selectedDate]);

    const parsedEventStartDate = parseDisplayDate(eventDraft.startDate);
    const parsedEventEndDate = parseDisplayDate(eventDraft.endDate);

    const openCreateEventModal = () => {
        resetCreateEventForm();
        setIsCreateEventOpen(true);
    };

    const closeCreateEventModal = () => {
        if (savingEvent) return;
        setIsCreateEventOpen(false);
        resetCreateEventForm();
    };

    const handleCreateEvent = async (event: FormEvent) => {
        event.preventDefault();

        const defaultStartTime = parseDutchTimeInput(eventDraft.defaultStartTime?.toString() ?? "");
        const defaultEndTime = parseDutchTimeInput(eventDraft.defaultEndTime?.toString() ?? "");
        const startDate = parseDisplayDate(eventDraft.startDate);
        const endDate = parseDisplayDate(eventDraft.endDate);

        const payload: PlanningEventSaveDTO = {
            name: eventDraft.name.trim(),
            startDate: startDate ?? "",
            endDate: endDate ?? "",
            clientCompanyId: eventDraft.clientCompanyId?.trim() ? eventDraft.clientCompanyId : null,
            location: eventDraft.location?.trim() || null,
            internalDescription: eventDraft.internalDescription?.trim() || null,
            defaultStartTime,
            defaultEndTime,
        };

        if (!payload.name) {
            setEventSaveError("Event name is required.");
            return;
        }

        if (!payload.startDate || !payload.endDate) {
            setEventSaveError("Start and end date must use dd/mm/yyyy.");
            return;
        }

        if (payload.endDate < payload.startDate) {
            setEventSaveError("End date cannot be before start date.");
            return;
        }

        if (eventDraft.defaultStartTime?.toString().trim() && !defaultStartTime) {
            setEventSaveError("Default start time must use 24-hour format: HH:mm.");
            return;
        }

        if (eventDraft.defaultEndTime?.toString().trim() && !defaultEndTime) {
            setEventSaveError("Default end time must use 24-hour format: HH:mm.");
            return;
        }

        try {
            setSavingEvent(true);
            setEventSaveError(null);
            setEventSaveSuccess(null);
            await UserServices.createPlanningEvent(payload);
            await loadPlanningOverview();
            setSelectedDate(payload.startDate);
            setExpandedDay(payload.startDate);
            setPlannerMode("events");
            setIsCreateEventOpen(false);
            resetCreateEventForm();
            setEventSaveSuccess("Event created.");
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "Failed to create event";
            setEventSaveError(message);
        } finally {
            setSavingEvent(false);
        }
    };

    const canSubmitCreateEvent = Boolean(eventDraft.name.trim())
        && Boolean(parsedEventStartDate)
        && Boolean(parsedEventEndDate)
        && (parsedEventEndDate ?? "") >= (parsedEventStartDate ?? "");

    const renderPlannerEntry = (day: string, entry: PlannerEntry) => (
        <button
            type="button"
            key={`${day}-${entry.id}`}
            className={`planningEntryCard planningEntryCard--compact planningEntryCard--${entry.tone} planningEntryCard--${entry.staffingTone}${entry.href ? " planningEntryCard--interactive" : ""}`}
            onClick={() => {
                if (entry.href) navigate(entry.href);
            }}
        >
            <div className="planningEntryHeaderBand">
                <div className="planningEntryHeaderText">
                    <div className="planningEntryTitle">{entry.title}</div>
                    {entry.subtitle ? (
                        <div className="planningEntrySubtitle">{entry.subtitle}</div>
                    ) : null}
                </div>
                <span
                    className="planningEntryRatio"
                    data-tooltip={getStaffingTooltipLabel()}
                    aria-label={getStaffingTooltipLabel()}
                    tabIndex={0}
                >
                    {entry.ratioLabel}
                </span>
            </div>
            <div className="planningEntryBodyRow">
                <span className="planningEntryMeta">{entry.timeLabel}</span>
                <span className="planningEntryCompletion">{entry.completionLabel}</span>
            </div>
            <div className="planningEntryFooter">
                <span className="planningEntryClientTag">{entry.clientLabel}</span>
            </div>
        </button>
    );

    return (
        <>
            <Navbar />
            <div className="adminDashboardPage">
                <div className="pageShell">
                    <PrimaryNav />
                    <div className="pageShellContent">
                        <header className="pageHeader">
                            <h1 className="pageTitle">Planning Overview</h1>
                            <p className="pageSubtitle">Weekly or monthly view for events and shifts.</p>
                        </header>

                        <div className="adminDashboardCard">
                            <Card
                                title={(
                                    <div className="planningTitleNavigation" aria-label={`${planningView === "week" ? "Week" : "Month"} navigation`}>
                                        <button
                                            type="button"
                                            className="planningIconButton"
                                            onClick={() => shiftVisibleRange(-1)}
                                            aria-label={planningView === "week" ? "Previous week" : "Previous month"}
                                            disabled={loading}
                                        >
                                            <ChevronLeftIcon />
                                        </button>
                                        <span className="planningTitleLabel">{visibleMonthLabel}</span>
                                        <button
                                            type="button"
                                            className="planningIconButton"
                                            onClick={() => shiftVisibleRange(1)}
                                            aria-label={planningView === "week" ? "Next week" : "Next month"}
                                            disabled={loading}
                                        >
                                            <ChevronRightIcon />
                                        </button>
                                    </div>
                                )}
                                className="dashboardCardHeight planningOverviewCard"
                                right={(
                                    <div className="planningHeaderRow">
                                        <div className="planningHeaderDateActions">
                                            <select
                                                className="planningViewSelect"
                                                value={planningView}
                                                onChange={(event) => setPlanningView(event.target.value as PlanningView)}
                                                aria-label="Planning view"
                                                disabled={loading}
                                            >
                                                <option value="week">Weekly view</option>
                                                <option value="month">Monthly view</option>
                                            </select>
                                            <button
                                                type="button"
                                                className="buttonSecondary planningTodayButton"
                                                onClick={() => {
                                                    setSelectedDate(today);
                                                    setExpandedDay(today);
                                                }}
                                                disabled={loading}
                                            >
                                                Today
                                            </button>
                                        </div>

                                        <div className="planningCardHeaderActions">
                                            <div className="planningModeToggle" role="tablist" aria-label="Planning content">
                                                {(["events", "shifts"] as PlannerMode[]).map((mode) => (
                                                    <button
                                                        key={mode}
                                                        type="button"
                                                        role="tab"
                                                        aria-selected={plannerMode === mode}
                                                        className={`planningModeButton${plannerMode === mode ? " planningModeButton--active" : ""}`}
                                                        onClick={() => setPlannerMode(mode)}
                                                    >
                                                        {mode === "events" ? "Events" : "Shifts"}
                                                    </button>
                                                ))}
                                            </div>

                                            <button
                                                type="button"
                                                className="button"
                                                onClick={openCreateEventModal}
                                                disabled={loading || savingEvent}
                                            >
                                                Create event
                                            </button>
                                        </div>
                                    </div>
                                )}
                            >
                                {loading ? <div className="listEmpty">Loading planning...</div> : null}
                                {!loading && error ? <div className="listEmpty errorText">{error}</div> : null}

                                {!loading && !error && events.length === 0 ? (
                                    <div className="planningEmptyState">
                                        <div className="listEmpty">No events found for this company.</div>
                                    </div>
                                ) : null}

                                {!loading && !error && events.length > 0 ? (
                                    planningView === "week" ? (
                                        <div className="planningWeekLayout">
                                            <div className="planningWeekGrid">
                                                {weekDays.map((day) => {
                                                    const dayEntries = plannerMode === "events"
                                                        ? eventEntriesByDay.get(day) ?? []
                                                        : shiftEntriesByDay.get(day) ?? [];
                                                    const isSelected = day === expandedDay;
                                                    const isToday = day === today;
                                                    const visibleEntries = isSelected ? dayEntries : dayEntries.slice(0, 4);

                                                    return (
                                                        <section
                                                            key={day}
                                                            className={`planningDayColumn${isSelected ? " planningDayColumn--selected" : ""}${isToday ? " planningDayColumn--today" : ""}`}
                                                        >
                                                            <button
                                                                type="button"
                                                                className="planningDayHeader"
                                                                onClick={() => setExpandedDay(day)}
                                                            >
                                                                <div className="planningDayHeaderMain">
                                                                    <span className="planningDayName">{formatWeekday(day)}</span>
                                                                    <span className="planningDayNumber">{formatDayNumber(day)}</span>
                                                                </div>
                                                                <span className="planningDayCount">
                                                                    {dayEntries.length} {plannerMode === "events" ? "events" : "shifts"}
                                                                </span>
                                                            </button>

                                                            <div className="planningDayItems">
                                                                {visibleEntries.length === 0 ? (
                                                                    <div className="planningDayEmpty">
                                                                        {plannerMode === "events" ? "No events" : "No shifts"}
                                                                    </div>
                                                                ) : (
                                                                    visibleEntries.map((entry) => renderPlannerEntry(day, entry))
                                                                )}

                                                                {dayEntries.length > visibleEntries.length ? (
                                                                    <button
                                                                        type="button"
                                                                        className="planningMoreButton"
                                                                        onClick={() => setExpandedDay(day)}
                                                                    >
                                                                        +{dayEntries.length - visibleEntries.length} more
                                                                    </button>
                                                                ) : null}

                                                                {isSelected && dayEntries.length > 4 ? (
                                                                    <button
                                                                        type="button"
                                                                        className="planningMoreButton"
                                                                        onClick={() => setExpandedDay("")}
                                                                    >
                                                                        Collapse
                                                                    </button>
                                                                ) : null}
                                                            </div>
                                                        </section>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="planningMonthLayout">
                                            <div className="planningMonthGrid">
                                                {monthDays.map((day) => {
                                                    const dayEntries = plannerMode === "events"
                                                        ? eventEntriesByDay.get(day) ?? []
                                                        : shiftEntriesByDay.get(day) ?? [];
                                                    const isToday = day === today;
                                                    const isSelected = day === selectedDate;
                                                    const isOutsideMonth = !day.startsWith(activeMonthKey);

                                                    return (
                                                        <section
                                                            key={day}
                                                            className={[
                                                                "planningMonthDay",
                                                                isToday ? "planningMonthDay--today" : "",
                                                                isSelected ? "planningMonthDay--selected" : "",
                                                                isOutsideMonth ? "planningMonthDay--outside" : "",
                                                            ].filter(Boolean).join(" ")}
                                                        >
                                                            <button
                                                                type="button"
                                                                className="planningMonthDayHeader"
                                                                onClick={() => {
                                                                    setSelectedDate(day);
                                                                    setExpandedDay(day);
                                                                }}
                                                            >
                                                                <div className="planningDayHeaderMain">
                                                                    <span className="planningDayName">{formatWeekday(day)}</span>
                                                                    <span className="planningDayNumber">{formatDayNumber(day)}</span>
                                                                </div>
                                                                <span className="planningDayCount">
                                                                    {dayEntries.length} {plannerMode === "events" ? "events" : "shifts"}
                                                                </span>
                                                            </button>

                                                            <div className="planningMonthDayItems">
                                                                {dayEntries.length === 0 ? (
                                                                    <div className="planningDayEmpty">
                                                                        {plannerMode === "events" ? "No events" : "No shifts"}
                                                                    </div>
                                                                ) : (
                                                                    dayEntries.map((entry) => renderPlannerEntry(day, entry))
                                                                )}
                                                            </div>
                                                        </section>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )
                                ) : null}
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
            {eventSaveSuccess ? (
                <div className="planningCreateEventToast" role="status" aria-live="polite">
                    <span className="planningCreateEventToastIcon">
                        <SuccessCheckIcon />
                    </span>
                    <div className="planningCreateEventToastBody">
                        <span className="planningCreateEventToastTitle">Event created</span>
                        <span className="planningCreateEventToastMessage">{eventSaveSuccess}</span>
                    </div>
                </div>
            ) : null}
            <Modal
                open={isCreateEventOpen}
                onClose={closeCreateEventModal}
                title="Create event"
                maxHeight={560}
                height={560}
                hideDefaultFooter
                closeOnEscape={false}
                closeOnOverlayClick={false}
            >
                <form className="roleWizard" onSubmit={(event) => void handleCreateEvent(event)}>
                    <div className="roleWizardTabs" role="tablist" aria-label="Event setup steps">
                        <button
                            type="button"
                            className={`roleWizardTab ${createEventStep === "details" ? "roleWizardTab--active" : ""}`}
                            onClick={() => setCreateEventStep("details")}
                            role="tab"
                            aria-selected={createEventStep === "details"}
                            disabled={savingEvent}
                        >
                            Details
                        </button>
                        <button
                            type="button"
                            className={`roleWizardTab ${createEventStep === "client" ? "roleWizardTab--active" : ""}`}
                            onClick={() => setCreateEventStep("client")}
                            role="tab"
                            aria-selected={createEventStep === "client"}
                            disabled={savingEvent}
                        >
                            Client
                        </button>
                        <button
                            type="button"
                            className={`roleWizardTab ${createEventStep === "notes" ? "roleWizardTab--active" : ""}`}
                            onClick={() => setCreateEventStep("notes")}
                            role="tab"
                            aria-selected={createEventStep === "notes"}
                            disabled={savingEvent}
                        >
                            Notes
                        </button>
                    </div>

                    {createEventStep === "details" ? (
                        <div className="roleWizardPanel">
                            <label className="roleWizardField">
                                <span className="roleWizardLabel">Event name</span>
                                <input
                                    className="modal_input"
                                    value={eventDraft.name}
                                    onChange={(event) => {
                                        setEventDraft((current) => ({ ...current, name: event.target.value }));
                                        if (eventSaveError) setEventSaveError(null);
                                        if (eventSaveSuccess) setEventSaveSuccess(null);
                                    }}
                                    placeholder="Example: Breda city run"
                                    disabled={savingEvent}
                                />
                            </label>

                            <label className="roleWizardField">
                                <span className="roleWizardLabel">Start date</span>
                                <input
                                    className="modal_input"
                                    type="text"
                                    value={eventDraft.startDate}
                                    onChange={(event) => {
                                        const startDate = normalizeDateInput(event.target.value);
                                        setEventDraft((current) => ({
                                            ...current,
                                            startDate,
                                            endDate: (() => {
                                                const currentEndDate = parseDisplayDate(current.endDate);
                                                const nextStartDate = parseDisplayDate(startDate);
                                                if (currentEndDate && nextStartDate && currentEndDate < nextStartDate) {
                                                    return startDate;
                                                }
                                                return current.endDate;
                                            })(),
                                        }));
                                        if (eventSaveError) setEventSaveError(null);
                                    }}
                                    inputMode="numeric"
                                    placeholder="dd/mm/yyyy"
                                    maxLength={10}
                                    disabled={savingEvent}
                                />
                            </label>

                            <label className="roleWizardField">
                                <span className="roleWizardLabel">End date</span>
                                <input
                                    className="modal_input"
                                    type="text"
                                    value={eventDraft.endDate}
                                    onChange={(event) => {
                                        setEventDraft((current) => ({
                                            ...current,
                                            endDate: normalizeDateInput(event.target.value),
                                        }));
                                        if (eventSaveError) setEventSaveError(null);
                                    }}
                                    inputMode="numeric"
                                    placeholder="dd/mm/yyyy"
                                    maxLength={10}
                                    disabled={savingEvent}
                                />
                            </label>

                            <label className="roleWizardField">
                                <span className="roleWizardLabel">Default start time</span>
                                <input
                                    className="modal_input"
                                    type="text"
                                    inputMode="numeric"
                                    placeholder="HH:mm"
                                    value={eventDraft.defaultStartTime ?? ""}
                                    onChange={(event) => {
                                        setEventDraft((current) => ({ ...current, defaultStartTime: event.target.value }));
                                        if (eventSaveError) setEventSaveError(null);
                                    }}
                                    disabled={savingEvent}
                                />
                            </label>

                            <label className="roleWizardField">
                                <span className="roleWizardLabel">Default end time</span>
                                <input
                                    className="modal_input"
                                    type="text"
                                    inputMode="numeric"
                                    placeholder="HH:mm"
                                    value={eventDraft.defaultEndTime ?? ""}
                                    onChange={(event) => {
                                        setEventDraft((current) => ({ ...current, defaultEndTime: event.target.value }));
                                        if (eventSaveError) setEventSaveError(null);
                                    }}
                                    disabled={savingEvent}
                                />
                            </label>

                            <div className="planningWizardSummary">
                                <span className="planningWizardSummaryLabel">Event window</span>
                                <span className="planningWizardSummaryValue">
                                    {eventDraft.startDate || "dd/mm/yyyy"} to {eventDraft.endDate || "dd/mm/yyyy"}
                                </span>
                            </div>
                        </div>
                    ) : null}

                    {createEventStep === "client" ? (
                        <div className="roleWizardPanel">
                            <label className="roleWizardField">
                                <span className="roleWizardLabel">Client/company</span>
                                <select
                                    className="modal_input"
                                    value={eventDraft.clientCompanyId ?? ""}
                                    onChange={(event) => {
                                        setEventDraft((current) => ({ ...current, clientCompanyId: event.target.value }));
                                        if (eventSaveError) setEventSaveError(null);
                                    }}
                                    disabled={savingEvent || loadingClients}
                                >
                                    <option value="">No client/company</option>
                                    {clients.map((client) => (
                                        <option key={client.clientCompanyId} value={client.clientCompanyId}>
                                            {client.name}
                                        </option>
                                    ))}
                                </select>
                            </label>

                            <label className="roleWizardField">
                                <span className="roleWizardLabel">Location</span>
                                <input
                                    className="modal_input"
                                    value={eventDraft.location ?? ""}
                                    onChange={(event) => {
                                        setEventDraft((current) => ({ ...current, location: event.target.value }));
                                        if (eventSaveError) setEventSaveError(null);
                                    }}
                                    placeholder="Optional"
                                    disabled={savingEvent}
                                />
                            </label>

                            {loadingClients ? (
                                <div className="roleWizardMeta">Loading client companies...</div>
                            ) : null}
                            {!loadingClients && !clientError && clients.length === 0 ? (
                                <div className="roleWizardMeta">No saved client companies yet. You can still create the event without one.</div>
                            ) : null}
                        </div>
                    ) : null}

                    {createEventStep === "notes" ? (
                        <div className="roleWizardPanel">
                            <label className="roleWizardField">
                                <span className="roleWizardLabel">Internal description</span>
                                <textarea
                                    className="modal_input planningWizardTextarea"
                                    value={eventDraft.internalDescription ?? ""}
                                    onChange={(event) => {
                                        setEventDraft((current) => ({ ...current, internalDescription: event.target.value }));
                                        if (eventSaveError) setEventSaveError(null);
                                    }}
                                    placeholder="Optional notes for planning"
                                    disabled={savingEvent}
                                />
                            </label>

                            <div className="planningWizardSummary planningWizardSummary--stacked">
                                <span className="planningWizardSummaryLabel">Ready to create</span>
                                <span className="planningWizardSummaryValue">{eventDraft.name.trim() || "Unnamed event"}</span>
                                <span className="roleWizardMeta">
                                    {eventDraft.clientCompanyId
                                        ? clients.find((client) => client.clientCompanyId === eventDraft.clientCompanyId)?.name ?? "Assigned client"
                                        : "No client/company selected"}
                                </span>
                            </div>
                        </div>
                    ) : null}

                    {clientError ? (
                        <div className="roleWizardAlert roleWizardAlert--error">{clientError}</div>
                    ) : null}
                    {eventSaveError ? (
                        <div className="roleWizardAlert roleWizardAlert--error">{eventSaveError}</div>
                    ) : null}

                    <div className="roleWizardActions planningWizardActions">
                        <button
                            type="button"
                            className="buttonSecondary planningWizardCancel"
                            onClick={closeCreateEventModal}
                            disabled={savingEvent}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="roleWizardPrimary"
                            disabled={!canSubmitCreateEvent || savingEvent}
                        >
                            {savingEvent ? "Creating..." : "Create event"}
                        </button>
                    </div>
                </form>
            </Modal>
        </>
    );
}
