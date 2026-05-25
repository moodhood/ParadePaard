import { useCallback, useEffect, useMemo, useState } from "react";
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
import { PAYROLL_FINANCE_PERMISSIONS, hasAnyPermission } from "../utils/permissionPolicy";
import {
    getDefaultVisibleWorkHistoryColumns,
    getWorkHistoryColumns,
    getWorkHistoryFinanceStatus,
    type WorkHistoryColumnKey,
} from "../utils/workHistoryColumns";

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
const currencyFormatter = new Intl.NumberFormat("nl-NL", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
});

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
    projectName?: string | null;
    shiftName?: string | null;
    shiftDate?: string | null;
    travelKilometers?: number | null;
    travelRate?: number | null;
    clientBillingRatePerHour?: number | null;
    billingRateSource?: string | null;
    billingRateOverrideReason?: string | null;
    financeReviewNeeded?: boolean | null;
    financeLocked?: boolean | null;
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
    const canViewFinanceColumns = hasAnyPermission(permissions, PAYROLL_FINANCE_PERMISSIONS);
    const showAllTimesheets = canViewAllTimesheets;
    const availableColumns = useMemo(
        () => getWorkHistoryColumns({ showAllTimesheets, canViewFinanceColumns }),
        [canViewFinanceColumns, showAllTimesheets]
    );
    const [visibleColumns, setVisibleColumns] = useState<WorkHistoryColumnKey[]>(() =>
        getDefaultVisibleWorkHistoryColumns({ showAllTimesheets: false, canViewFinanceColumns: false })
    );
    const getEmployeeName = useCallback((timesheet: Timesheet) => {
        if (!timesheet.userId) {
            return timesheet.name ?? "-";
        }
        return displayNames[timesheet.userId] ?? timesheet.name ?? timesheet.userId;
    }, [displayNames]);

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
    }, [getEmployeeName, showAllTimesheets, timesheets]);

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
                    .concat([t.projectName ?? "", t.shiftName ?? ""])
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
    }, [filters, getEmployeeName, showAllTimesheets, timesheets]);

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
        const availableKeys = availableColumns.map((column) => column.key);
        const defaultKeys = getDefaultVisibleWorkHistoryColumns({ showAllTimesheets, canViewFinanceColumns });
        setVisibleColumns((current) => {
            const cleaned = current.filter((key) => availableKeys.includes(key));
            return cleaned.length > 0 ? cleaned : defaultKeys;
        });
    }, [availableColumns, canViewFinanceColumns, showAllTimesheets]);

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

    const toggleColumn = (columnKey: WorkHistoryColumnKey) => {
        setVisibleColumns((current) => {
            if (current.includes(columnKey)) {
                return current.filter((key) => key !== columnKey);
            }
            return [...current, columnKey];
        });
    };

    const renderCell = (timesheet: Timesheet, columnKey: WorkHistoryColumnKey) => {
        switch (columnKey) {
            case "date":
                return formatDate(timesheet.dateOfIssue);
            case "employee":
                return getEmployeeName(timesheet);
            case "shift":
                return (
                    <>
                        <div className="workHistoryCellMain workHistoryCellMain--link">
                            {timesheet.shiftName ?? timesheet.function}
                        </div>
                        <div className="workHistoryCellSub">{timesheet.projectName ?? timesheet.function}</div>
                    </>
                );
            case "hours":
                return Number(timesheet.hoursWorked ?? 0).toFixed(1);
            case "travel":
                return Number(timesheet.travelExpenses ?? 0).toFixed(2);
            case "financeReadiness":
                return <span className="workHistoryStatusPill">{getWorkHistoryFinanceStatus(timesheet)}</span>;
            case "billingRateSource":
                return timesheet.billingRateSource ?? "Not set";
            case "clientBillingRatePerHour":
                return timesheet.clientBillingRatePerHour == null
                    ? "Missing"
                    : currencyFormatter.format(timesheet.clientBillingRatePerHour);
            case "billingOverrideReason":
                return timesheet.billingRateOverrideReason?.trim() || "No override";
            case "financeLockStatus":
                return timesheet.financeLocked ? "Locked after payroll approval" : "Open for finance review";
            default:
                return "";
        }
    };

    const columnCount = Math.max(visibleColumns.length, 1);

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
                                                                ? "Name, function, project, shift, or employee ID"
                                                                : "Function, project, shift, or date"
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
                                        <div className="workHistoryColumnChooser" aria-label="Choose work history columns">
                                            <div>
                                                <strong>Columns</strong>
                                                <span>
                                                    Finance columns are only available to users with payroll finance permission.
                                                </span>
                                            </div>
                                            <div className="workHistoryColumnOptions">
                                                {availableColumns.map((column) => (
                                                    <label
                                                        key={column.key}
                                                        className={column.financeOnly ? "workHistoryColumnOption--finance" : ""}
                                                    >
                                                        <input
                                                            type="checkbox"
                                                            checked={visibleColumns.includes(column.key)}
                                                            onChange={() => toggleColumn(column.key)}
                                                        />
                                                        <span>{column.label}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="workHistoryTableWrap">
                                            <table className="workHistoryTable">
                                                <thead>
                                                    <tr>
                                                        {visibleColumns.map((columnKey) => {
                                                            const column = availableColumns.find((item) => item.key === columnKey);
                                                            return column ? (
                                                                <th
                                                                    key={column.key}
                                                                    className={
                                                                        column.key === "hours" ||
                                                                        column.key === "travel" ||
                                                                        column.key === "clientBillingRatePerHour"
                                                                            ? "workHistoryHoursCol"
                                                                            : undefined
                                                                    }
                                                                >
                                                                    {column.label}
                                                                </th>
                                                            ) : null;
                                                        })}
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
                                                                {visibleColumns.map((columnKey) => (
                                                                    <td
                                                                        key={columnKey}
                                                                        className={
                                                                            columnKey === "hours" ||
                                                                            columnKey === "travel" ||
                                                                            columnKey === "clientBillingRatePerHour"
                                                                                ? "workHistoryHoursCol"
                                                                                : undefined
                                                                        }
                                                                    >
                                                                        {renderCell(t, columnKey)}
                                                                    </td>
                                                                ))}
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
