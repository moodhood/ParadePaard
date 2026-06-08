import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import PrimaryNav from "../components/PrimaryNav";
import Spinner from "../components/Spinner";
import Card from "../components/common/Card";
import PaginationControls from "../components/common/PaginationControls";
import { WorkHistoryColumnPicker } from "../components/work-history/WorkHistoryColumnPicker";
import { useAuth } from "../context/AuthContext";
import { UserServices } from "../services/user-service/UserServices";
import {
    getMyWorkHistoryColumnsPreference,
    updateMyWorkHistoryColumnsPreference,
} from "../services/user-service/WorkHistoryPreferences";
import "../stylesheets/WorkHistory.css";
import { sumHours } from "../utils/hoursSummary";
import { formatDate } from "../utils/dateFormat";
import { normalizeDateInput } from "../utils/dateInput";
import { PAYROLL_FINANCE_PERMISSIONS, hasAnyPermission } from "../utils/permissionPolicy";
import { applyWorkHistoryFilters, type WorkHistoryFilterField, type WorkHistoryFilterRow } from "../utils/workHistoryFilters";
import {
    getDefaultVisibleWorkHistoryColumns,
    getWorkHistoryColumns,
    getWorkHistoryFinanceStatus,
    sanitizeVisibleWorkHistoryColumns,
    type WorkHistoryColumnKey,
} from "../utils/workHistoryColumns";

const DEFAULT_PAGE_SIZE = 50;
type WorkHistoryScope = "mine" | "management";
const createFilterRow = (field: WorkHistoryFilterField = "search"): WorkHistoryFilterRow => ({
    id: crypto.randomUUID(),
    field,
    value: "",
});

const FILTER_LABELS: Record<WorkHistoryFilterField, string> = {
    search: "Search",
    employee: "Employee",
    function: "Function",
    project: "Project",
    shift: "Shift",
    dateFrom: "Date from",
    dateTo: "Date to",
    weekYear: "Week year",
    weekNumber: "Week number",
    minHours: "Min hours",
    maxHours: "Max hours",
    minTravel: "Min travel",
    maxTravel: "Max travel",
    financeReadiness: "Finance readiness",
};

const getFilterInputMode = (field: WorkHistoryFilterField) => {
    if (field === "dateFrom" || field === "dateTo" || field === "weekYear" || field === "weekNumber") return "numeric";
    if (field === "minHours" || field === "maxHours" || field === "minTravel" || field === "maxTravel") return "decimal";
    return "text";
};

const getFilterPlaceholder = (field: WorkHistoryFilterField) => {
    switch (field) {
        case "dateFrom":
        case "dateTo":
            return "dd/mm/yyyy";
        case "weekYear":
            return "2026";
        case "weekNumber":
            return "1-53";
        case "minHours":
        case "maxHours":
            return "Hours";
        case "minTravel":
        case "maxTravel":
            return "Travel amount";
        case "financeReadiness":
            return "Billing rate set";
        default:
            return "Type to filter";
    }
};
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
    return <WorkHistoryPage scope="mine" />;
}

export function ManagementWorkHistory() {
    return <WorkHistoryPage scope="management" />;
}

function WorkHistoryPage({ scope }: { scope: WorkHistoryScope }) {
    const navigate = useNavigate();
    const { permissions } = useAuth();
    const [timesheets, setTimesheets] = useState<Timesheet[]>([]);
    const [displayNames, setDisplayNames] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [filters, setFilters] = useState<WorkHistoryFilterRow[]>(() => [createFilterRow()]);
    const [page, setPage] = useState(0);
    const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
    const [totalTimesheets, setTotalTimesheets] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const isManagementScope = scope === "management";
    const canManageTimesheets = permissions.includes("CAN_MANAGE_TIMESHEETS");
    const canViewFinanceColumns = hasAnyPermission(permissions, PAYROLL_FINANCE_PERMISSIONS);
    const showAllTimesheets = isManagementScope;
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

    const filterOptions = useMemo(() => {
        const fields: WorkHistoryFilterField[] = [
            "search",
            "function",
            "project",
            "shift",
            "dateFrom",
            "dateTo",
            "weekYear",
            "weekNumber",
            "minHours",
            "maxHours",
            "minTravel",
            "maxTravel",
        ];
        if (showAllTimesheets) {
            fields.splice(1, 0, "employee");
        }
        if (canViewFinanceColumns) {
            fields.push("financeReadiness");
        }
        return fields;
    }, [canViewFinanceColumns, showAllTimesheets]);

    const filteredTimesheets = useMemo(() => {
        const filtered = applyWorkHistoryFilters(timesheets, filters, {
            getEmployeeName,
            includeEmployeeFilters: showAllTimesheets,
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
        const defaultKeys = getDefaultVisibleWorkHistoryColumns({ showAllTimesheets, canViewFinanceColumns });
        setVisibleColumns((current) => {
            return sanitizeVisibleWorkHistoryColumns(current, availableColumns, defaultKeys);
        });
    }, [availableColumns, canViewFinanceColumns, showAllTimesheets]);

    useEffect(() => {
        if (!isManagementScope) return;

        let cancelled = false;
        const defaultKeys = getDefaultVisibleWorkHistoryColumns({ showAllTimesheets, canViewFinanceColumns });

        getMyWorkHistoryColumnsPreference()
            .then((preference) => {
                if (cancelled) return;
                setVisibleColumns(
                    sanitizeVisibleWorkHistoryColumns(
                        preference.columns as WorkHistoryColumnKey[],
                        availableColumns,
                        defaultKeys
                    )
                );
            })
            .catch(() => {
                if (!cancelled) {
                    setVisibleColumns(defaultKeys);
                }
            });

        return () => {
            cancelled = true;
        };
    }, [availableColumns, canViewFinanceColumns, isManagementScope, showAllTimesheets]);

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

    const updateFilter = (id: string, patch: Partial<WorkHistoryFilterRow>) => {
        setFilters((prev) =>
            prev.map((filter) => {
                if (filter.id !== id) return filter;
                const nextField = patch.field ?? filter.field;
                let nextValue = patch.value ?? filter.value;
                if (nextField === "dateFrom" || nextField === "dateTo") {
                    nextValue = normalizeDateInput(nextValue);
                }
                return { ...filter, ...patch, field: nextField, value: nextValue };
            })
        );
    };

    const addFilter = () => {
        setFilters((prev) => [...prev, createFilterRow()]);
    };

    const removeFilter = (id: string) => {
        setFilters((prev) => {
            const next = prev.filter((filter) => filter.id !== id);
            return next.length > 0 ? next : [createFilterRow()];
        });
    };

    const resetFilters = () => {
        setFilters([createFilterRow()]);
    };

    const openShiftDetail = (timesheetId: string) => {
        navigate(isManagementScope ? `/management/work-history/${timesheetId}` : `/work-history/${timesheetId}`);
    };

    const toggleColumn = (columnKey: WorkHistoryColumnKey) => {
        setVisibleColumns((current) => {
            const next = current.includes(columnKey)
                ? current.filter((key) => key !== columnKey)
                : [...current, columnKey];
            const defaultKeys = getDefaultVisibleWorkHistoryColumns({ showAllTimesheets, canViewFinanceColumns });
            const cleaned = sanitizeVisibleWorkHistoryColumns(next, availableColumns, defaultKeys);
            if (isManagementScope) {
                void updateMyWorkHistoryColumnsPreference(cleaned);
            }
            return cleaned;
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
                            <h1 className="workHistoryTitle">{isManagementScope ? "Work History" : "My Work History"}</h1>
                            {isManagementScope && canManageTimesheets ? (
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
                                    <Card title={isManagementScope ? "Timesheets" : "My timesheets"} className="workHistoryCard">
                                        <div className="workHistoryFilterPanel">
                                            <div className="workHistoryDynamicFilters">
                                                {filters.map((filter) => (
                                                    <div className="workHistoryFilterRow" key={filter.id}>
                                                        <label className="workHistoryFilterField workHistoryFilterField--field">
                                                            <span>Filter on</span>
                                                            <select
                                                                value={filter.field}
                                                                onChange={(e) =>
                                                                    updateFilter(filter.id, {
                                                                        field: e.target.value as WorkHistoryFilterField,
                                                                        value: "",
                                                                    })
                                                                }
                                                            >
                                                                {filterOptions.map((field) => (
                                                                    <option key={field} value={field}>
                                                                        {FILTER_LABELS[field]}
                                                                    </option>
                                                                ))}
                                                            </select>
                                                        </label>
                                                        <label className="workHistoryFilterField">
                                                            <span>{FILTER_LABELS[filter.field]}</span>
                                                            {filter.field === "employee" ? (
                                                                <select
                                                                    value={filter.value}
                                                                    onChange={(e) => updateFilter(filter.id, { value: e.target.value })}
                                                                >
                                                                    <option value="">Any employee</option>
                                                                    {userOptions.map((user) => (
                                                                        <option key={user.id} value={user.name}>
                                                                            {user.name}
                                                                        </option>
                                                                    ))}
                                                                </select>
                                                            ) : filter.field === "function" ? (
                                                                <select
                                                                    value={filter.value}
                                                                    onChange={(e) => updateFilter(filter.id, { value: e.target.value })}
                                                                >
                                                                    <option value="">Any function</option>
                                                                    {functionOptions.map((value) => (
                                                                        <option key={value} value={value}>
                                                                            {value}
                                                                        </option>
                                                                    ))}
                                                                </select>
                                                            ) : (
                                                                <input
                                                                    type={filter.field === "search" ? "search" : "text"}
                                                                    inputMode={getFilterInputMode(filter.field)}
                                                                    value={filter.value}
                                                                    onChange={(e) => updateFilter(filter.id, { value: e.target.value })}
                                                                    placeholder={getFilterPlaceholder(filter.field)}
                                                                    maxLength={
                                                                        filter.field === "dateFrom" || filter.field === "dateTo"
                                                                            ? 10
                                                                            : undefined
                                                                    }
                                                                />
                                                            )}
                                                        </label>
                                                        <button
                                                            type="button"
                                                            className="workHistoryIconButton"
                                                            onClick={() => removeFilter(filter.id)}
                                                            aria-label="Remove filter"
                                                            title="Remove filter"
                                                        >
                                                            -
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="workHistoryFilterActions">
                                                <div className="workHistoryFilterMeta">
                                                    {filteredTimesheets.length} shown
                                                    {timesheets.length !== filteredTimesheets.length
                                                        ? ` of ${timesheets.length}`
                                                        : ""}
                                                    {` on this page | ${totalTimesheets} total`}
                                                </div>
                                                <div className="workHistoryToolbarActions">
                                                    <button
                                                        type="button"
                                                        className="workHistoryButtonSecondary"
                                                        onClick={addFilter}
                                                    >
                                                        Add filter
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className="workHistoryButtonSecondary"
                                                        onClick={resetFilters}
                                                    >
                                                        Reset filters
                                                    </button>
                                                </div>
                                            </div>
                                            {isManagementScope ? (
                                                <WorkHistoryColumnPicker
                                                    availableColumns={availableColumns}
                                                    visibleColumns={visibleColumns}
                                                    onToggleColumn={toggleColumn}
                                                />
                                            ) : null}
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
