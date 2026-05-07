import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import PrimaryNav from "../components/PrimaryNav";
import Spinner from "../components/Spinner";
import Card from "../components/common/Card";
import PaginationControls from "../components/common/PaginationControls";
import { useAuth } from "../context/AuthContext";
import { UserServices } from "../services/user-service/UserServices";
import "../stylesheets/WorkHistory.css";
import { getIsoWeek, sumHours } from "../utils/hoursSummary";
import { formatDate } from "../utils/dateFormat";
import { normalizeDateInput, parseDisplayDate } from "../utils/dateInput";

type FilterState = {
    search: string;
    userId: string;
    functionName: string;
    dateFrom: string;
    dateTo: string;
    weekYear: string;
    weekNumber: string;
    minHours: string;
    maxHours: string;
    minTravel: string;
    maxTravel: string;
};

const createFilters = (): FilterState => ({
    search: "",
    userId: "all",
    functionName: "all",
    dateFrom: "",
    dateTo: "",
    weekYear: "",
    weekNumber: "",
    minHours: "",
    maxHours: "",
    minTravel: "",
    maxTravel: "",
});

const parseNumber = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) return null;
    const num = Number(trimmed);
    return Number.isFinite(num) ? num : null;
};

const getDatePart = (value: string) => value.split("T")[0].split(" ")[0];
const DEFAULT_PAGE_SIZE = 50;

export interface Timesheet {
    timesheetId: string;
    userId?: string;
    name?: string;
    dateOfIssue: string;
    weekNumber?: number;
    weekBasedYear?: number;
    function: string;
    hoursWorked: number;
    travelExpenses?: number;
    eventName?: string | null;
    shiftName?: string | null;
    shiftDate?: string | null;
    travelKilometers?: number | null;
    travelRate?: number | null;
}

export default function WorkHistory() {
    const navigate = useNavigate();
    const { permissions } = useAuth();
    const [timesheets, setTimesheets] = useState<Timesheet[]>([]);
    const [displayNames, setDisplayNames] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [filters, setFilters] = useState<FilterState>(() => createFilters());
    const [page, setPage] = useState(0);
    const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
    const [totalTimesheets, setTotalTimesheets] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const canViewAllTimesheets = permissions.includes("CAN_VIEW_ALL_TIMESHEETS");
    const canManageTimesheets = permissions.includes("CAN_MANAGE_TIMESHEETS");
    const showAllTimesheets = canViewAllTimesheets;
    const getEmployeeName = (timesheet: Timesheet) => {
        if (!timesheet.userId) {
            return timesheet.name ?? "-";
        }
        return displayNames[timesheet.userId] ?? timesheet.name ?? timesheet.userId;
    };

    const userOptions = useMemo(() => {
        if (!showAllTimesheets) return [];
        const map = new Map<string, string>();
        timesheets.forEach((t) => {
            if (!t.userId) return;
            map.set(t.userId, getEmployeeName(t));
        });
        return [...map.entries()]
            .map(([id, name]) => ({ id, name }))
            .sort((a, b) => a.name.localeCompare(b.name));
    }, [displayNames, showAllTimesheets, timesheets]);

    const functionOptions = useMemo(() => {
        const values = new Set<string>();
        timesheets.forEach((t) => {
            if (t.function) values.add(t.function);
        });
        return [...values].sort((a, b) => a.localeCompare(b));
    }, [timesheets]);

    const filteredTimesheets = useMemo(() => {
        const term = filters.search.trim().toLowerCase();
        const minHours = parseNumber(filters.minHours);
        const maxHours = parseNumber(filters.maxHours);
        const minTravel = parseNumber(filters.minTravel);
        const maxTravel = parseNumber(filters.maxTravel);
        const weekYear = parseNumber(filters.weekYear);
        const weekNumber = parseNumber(filters.weekNumber);
        const dateFrom = parseDisplayDate(filters.dateFrom);
        const dateTo = parseDisplayDate(filters.dateTo);

        const filtered = timesheets.filter((t) => {
            if (showAllTimesheets && filters.userId !== "all" && t.userId !== filters.userId) {
                return false;
            }
            if (filters.functionName !== "all" && t.function !== filters.functionName) {
                return false;
            }

            if (term) {
                const haystack = [getEmployeeName(t), t.function ?? "", t.userId ?? "", t.dateOfIssue ?? ""]
                    .concat([t.eventName ?? "", t.shiftName ?? ""])
                    .join(" ")
                    .toLowerCase();
                if (!haystack.includes(term)) return false;
            }

            const datePart = getDatePart(t.dateOfIssue ?? "");
            if (dateFrom && datePart < dateFrom) return false;
            if (dateTo && datePart > dateTo) return false;

            if (weekYear !== null || weekNumber !== null) {
                const week =
                    t.weekNumber != null && t.weekBasedYear != null
                        ? { weekNumber: t.weekNumber, weekBasedYear: t.weekBasedYear }
                        : getIsoWeek(new Date(`${datePart}T00:00:00Z`));
                if (weekYear !== null && week.weekBasedYear !== weekYear) return false;
                if (weekNumber !== null && week.weekNumber !== weekNumber) return false;
            }

            const hours = Number(t.hoursWorked ?? 0);
            const travel = Number(t.travelExpenses ?? 0);

            if (minHours !== null && hours < minHours) return false;
            if (maxHours !== null && hours > maxHours) return false;
            if (minTravel !== null && travel < minTravel) return false;
            if (maxTravel !== null && travel > maxTravel) return false;

            return true;
        });

        return [...filtered].sort((a, b) => (b.dateOfIssue ?? "").localeCompare(a.dateOfIssue ?? ""));
    }, [displayNames, filters, showAllTimesheets, timesheets]);

    const totalHours = useMemo(() => sumHours(filteredTimesheets), [filteredTimesheets]);

    useEffect(() => {
        let cancelled = false;

        const load = async (targetPage = page, targetPageSize = pageSize) => {
            try {
                setLoading(true);
                setErrorMsg(null);
                const data = showAllTimesheets
                    ? await UserServices.getTimesheetsPage(targetPage, targetPageSize)
                    : await UserServices.getMyTimesheetsPage(targetPage, targetPageSize);
                if (!cancelled) {
                    setTimesheets(data.items);
                    setPage(data.page);
                    setTotalTimesheets(data.totalElements);
                    setTotalPages(data.totalPages);
                }
            } catch (err: unknown) {
                const message = err instanceof Error ? err.message : "Failed to load work history";
                if (!cancelled) setErrorMsg(message);
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        void load();

        return () => {
            cancelled = true;
        };
    }, [page, pageSize, showAllTimesheets]);

    useEffect(() => {
        if (!showAllTimesheets) {
            setFilters((prev) => (prev.userId === "all" ? prev : { ...prev, userId: "all" }));
        }
    }, [showAllTimesheets]);

    useEffect(() => {
        let cancelled = false;
        const userIds = timesheets
            .map((timesheet) => timesheet.userId)
            .filter((value): value is string => Boolean(value));

        if (userIds.length === 0) {
            setDisplayNames({});
            return;
        }

        UserServices.getUserDisplayNames(userIds)
            .then((data) => {
                if (!cancelled) {
                    setDisplayNames(data);
                }
            })
            .catch(() => {
                if (!cancelled) {
                    setDisplayNames({});
                }
            });

        return () => {
            cancelled = true;
        };
    }, [timesheets]);

    const updateFilter = (field: keyof FilterState, value: string) => {
        setFilters((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const resetFilters = () => {
        setFilters(createFilters());
    };

    const openShiftDetail = (timesheetId: string) => {
        navigate(`/work-history/${timesheetId}`);
    };

    const columnCount = showAllTimesheets ? 5 : 4;

    return (
        <>
            <Navbar />
            <div className="workHistoryPage">
                <div className="pageShell">
                    <PrimaryNav />
                    <div className="pageShellContent">
                        <header
                            className="workHistoryHeader"
                            style={{ flexDirection: "row", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}
                        >
                            <h1 className="workHistoryTitle">Work History</h1>
                            {canManageTimesheets ? (
                                <Link className="button" to="/management/travel-claims">
                                    Open travel claims
                                </Link>
                            ) : null}
                        </header>
                        <div className="workHistoryShell">
                            {loading ? (
                                <div className="workHistoryLoading">
                                    <Spinner text="Loading work history" />
                                </div>
                            ) : errorMsg ? (
                                <div className="workHistoryError">{errorMsg}</div>
                            ) : (
                                <div style={{ display: "grid", gap: 20 }}>
                                    <Card title="Timesheets" className="workHistoryCard">
                                        <div className="workHistoryFilterPanel">
                                            <div className="workHistoryFilterGrid">
                                                <label className="workHistoryFilterField">
                                                    <span>Search</span>
                                                    <input
                                                        type="search"
                                                        placeholder={
                                                            showAllTimesheets
                                                                ? "Name, function, event, shift, or employee ID"
                                                                : "Function, event, shift, or date"
                                                        }
                                                        value={filters.search}
                                                        onChange={(e) => updateFilter("search", e.target.value)}
                                                    />
                                                </label>

                                                {showAllTimesheets ? (
                                                    <label className="workHistoryFilterField">
                                                        <span>Employee</span>
                                                        <select
                                                            value={filters.userId}
                                                            onChange={(e) => updateFilter("userId", e.target.value)}
                                                        >
                                                            <option value="all">All employees</option>
                                                            {userOptions.map((user) => (
                                                                <option key={user.id} value={user.id}>
                                                                    {user.name}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </label>
                                                ) : null}

                                                <label className="workHistoryFilterField">
                                                    <span>Function</span>
                                                    <select
                                                        value={filters.functionName}
                                                        onChange={(e) => updateFilter("functionName", e.target.value)}
                                                    >
                                                        <option value="all">All functions</option>
                                                        {functionOptions.map((value) => (
                                                            <option key={value} value={value}>
                                                                {value}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </label>

                                                <label className="workHistoryFilterField">
                                                    <span>Date from</span>
                                                    <input
                                                        type="text"
                                                        value={filters.dateFrom}
                                                        onChange={(e) => updateFilter("dateFrom", normalizeDateInput(e.target.value))}
                                                        inputMode="numeric"
                                                        placeholder="dd/mm/yyyy"
                                                        maxLength={10}
                                                    />
                                                </label>

                                                <label className="workHistoryFilterField">
                                                    <span>Date to</span>
                                                    <input
                                                        type="text"
                                                        value={filters.dateTo}
                                                        onChange={(e) => updateFilter("dateTo", normalizeDateInput(e.target.value))}
                                                        inputMode="numeric"
                                                        placeholder="dd/mm/yyyy"
                                                        maxLength={10}
                                                    />
                                                </label>

                                                <label className="workHistoryFilterField">
                                                    <span>Week year</span>
                                                    <input
                                                        type="number"
                                                        inputMode="numeric"
                                                        value={filters.weekYear}
                                                        onChange={(e) => updateFilter("weekYear", e.target.value)}
                                                        placeholder="2026"
                                                    />
                                                </label>

                                                <label className="workHistoryFilterField">
                                                    <span>Week number</span>
                                                    <input
                                                        type="number"
                                                        inputMode="numeric"
                                                        value={filters.weekNumber}
                                                        onChange={(e) => updateFilter("weekNumber", e.target.value)}
                                                        placeholder="1-53"
                                                    />
                                                </label>

                                                <label className="workHistoryFilterField">
                                                    <span>Min hours</span>
                                                    <input
                                                        type="number"
                                                        inputMode="decimal"
                                                        value={filters.minHours}
                                                        onChange={(e) => updateFilter("minHours", e.target.value)}
                                                        placeholder="0"
                                                    />
                                                </label>

                                                <label className="workHistoryFilterField">
                                                    <span>Max hours</span>
                                                    <input
                                                        type="number"
                                                        inputMode="decimal"
                                                        value={filters.maxHours}
                                                        onChange={(e) => updateFilter("maxHours", e.target.value)}
                                                        placeholder="60"
                                                    />
                                                </label>

                                                <label className="workHistoryFilterField">
                                                    <span>Min travel</span>
                                                    <input
                                                        type="number"
                                                        inputMode="decimal"
                                                        value={filters.minTravel}
                                                        onChange={(e) => updateFilter("minTravel", e.target.value)}
                                                        placeholder="0"
                                                    />
                                                </label>

                                                <label className="workHistoryFilterField">
                                                    <span>Max travel</span>
                                                    <input
                                                        type="number"
                                                        inputMode="decimal"
                                                        value={filters.maxTravel}
                                                        onChange={(e) => updateFilter("maxTravel", e.target.value)}
                                                        placeholder="100"
                                                    />
                                                </label>
                                            </div>
                                            <div className="workHistoryFilterActions">
                                                <div className="workHistoryFilterMeta">
                                                    {filteredTimesheets.length} shown
                                                    {timesheets.length !== filteredTimesheets.length
                                                        ? ` of ${timesheets.length}`
                                                        : ""}
                                                    {` on this page | ${totalTimesheets} total`}
                                                </div>
                                                <button
                                                    type="button"
                                                    className="workHistoryButtonSecondary"
                                                    onClick={resetFilters}
                                                >
                                                    Reset filters
                                                </button>
                                            </div>
                                        </div>
                                        <div className="workHistoryTableWrap">
                                            <table className="workHistoryTable">
                                                <thead>
                                                    <tr>
                                                        <th>Date</th>
                                                        {showAllTimesheets ? <th>Employee</th> : null}
                                                        <th>Shift</th>
                                                        <th className="workHistoryHoursCol">Hours Worked</th>
                                                        <th className="workHistoryHoursCol">Travel</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {filteredTimesheets.length === 0 ? (
                                                        <tr>
                                                            <td colSpan={columnCount} className="workHistoryEmpty">
                                                                No timesheets match these filters.
                                                            </td>
                                                        </tr>
                                                    ) : (
                                                        filteredTimesheets.map((t) => (
                                                            <tr
                                                                key={t.timesheetId}
                                                                className="workHistoryRowInteractive"
                                                                role="button"
                                                                tabIndex={0}
                                                                onClick={() => openShiftDetail(t.timesheetId)}
                                                                onKeyDown={(event) => {
                                                                    if (event.key === "Enter" || event.key === " ") {
                                                                        event.preventDefault();
                                                                        openShiftDetail(t.timesheetId);
                                                                    }
                                                                }}
                                                            >
                                                                <td>{formatDate(t.dateOfIssue)}</td>
                                                                {showAllTimesheets ? <td>{getEmployeeName(t)}</td> : null}
                                                                <td>
                                                                    <div className="workHistoryCellMain workHistoryCellMain--link">
                                                                        {t.shiftName ?? t.function}
                                                                    </div>
                                                                    <div style={{ fontSize: 12, color: "#6b7280" }}>
                                                                        {t.eventName ?? t.function}
                                                                    </div>
                                                                </td>
                                                                <td className="workHistoryHoursCol">{t.hoursWorked.toFixed(1)}</td>
                                                                <td className="workHistoryHoursCol">
                                                                    {Number(t.travelExpenses ?? 0).toFixed(2)}
                                                                </td>
                                                            </tr>
                                                        ))
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                        <PaginationControls
                                            page={page}
                                            totalPages={totalPages}
                                            pageSize={pageSize}
                                            loading={loading}
                                            onPageChange={(nextPage) => setPage(Math.max(0, nextPage))}
                                            onPageSizeChange={(nextPageSize) => {
                                                setPageSize(nextPageSize);
                                                setPage(0);
                                            }}
                                        />
                                        <div
                                            className={`workHistoryTotalBar${
                                                showAllTimesheets ? " workHistoryTotalBar--admin" : ""
                                            }`}
                                        >
                                            <div className="workHistoryTotalLabel">Total</div>
                                            <div className="workHistoryTotalValue">{totalHours.toFixed(1)}</div>
                                        </div>
                                    </Card>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
