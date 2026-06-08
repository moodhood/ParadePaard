import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import PageBack from "../components/PageBack";
import PrimaryNav from "../components/PrimaryNav";
import Card from "../components/common/Card";
import { UserServices, type AuditLogEntryDTO } from "../services/user-service/UserServices";
import type { AuditLogMessagePartDTO, AuditLogQuery } from "../services/user-service/Types";
import { formatDateTime } from "../utils/dateFormat";
import "../stylesheets/AdminAuditLog.css";
import "../stylesheets/LeaveRequests.css";

const CATEGORY_OPTIONS = [
    { value: "", label: "All categories" },
    { value: "PEOPLE", label: "People" },
    { value: "APPLICATIONS", label: "Applications" },
    { value: "ONBOARDING", label: "Onboarding" },
    { value: "RULES", label: "Rules" },
    { value: "CONTRACTS", label: "Contracts" },
    { value: "CLIENTS", label: "Clients" },
    { value: "PLANNING", label: "Planning" },
    { value: "TRAVEL_CLAIMS", label: "Travel claims" },
    { value: "PAYROLL", label: "Payroll" },
];

type AuditFilterField = "search" | "category" | "action" | "entityType" | "occurredFrom" | "occurredTo";

type AuditFilterRow = {
    id: string;
    field: AuditFilterField;
    value: string;
};

const FILTER_FIELD_OPTIONS: Array<{ value: AuditFilterField; label: string }> = [
    { value: "search", label: "Search" },
    { value: "category", label: "Category" },
    { value: "action", label: "Action" },
    { value: "entityType", label: "Entity type" },
    { value: "occurredFrom", label: "Occurred from" },
    { value: "occurredTo", label: "Occurred to" },
];

const FILTER_LABELS: Record<AuditFilterField, string> = {
    search: "Search",
    category: "Category",
    action: "Action",
    entityType: "Entity type",
    occurredFrom: "Occurred from",
    occurredTo: "Occurred to",
};

function createFilterRow(field: AuditFilterField = "search"): AuditFilterRow {
    return {
        id: crypto.randomUUID(),
        field,
        value: "",
    };
}

function buildAuditQuery(filters: AuditFilterRow[]): AuditLogQuery {
    const next: AuditLogQuery = {};

    filters.forEach((filter) => {
        const value = filter.value.trim();
        if (!value) {
            return;
        }

        if (filter.field === "search") {
            next.query = value;
            return;
        }
        if (filter.field === "category") {
            next.category = value;
            return;
        }
        if (filter.field === "action") {
            next.action = value;
            return;
        }
        if (filter.field === "entityType") {
            next.entityType = value;
            return;
        }
        if (filter.field === "occurredFrom") {
            next.occurredFrom = value;
            return;
        }
        next.occurredTo = value;
    });

    return next;
}

function isFilterActive(filter: AuditFilterRow) {
    return filter.value.trim().length > 0;
}

function prettifyAuditValue(value: string) {
    return value.replaceAll("_", " ").toLowerCase().replace(/\b\w/g, (match) => match.toUpperCase());
}

function sortAuditValues(values: string[]) {
    return [...values].sort((left, right) => prettifyAuditValue(left).localeCompare(prettifyAuditValue(right)));
}

function renderMessagePart(part: AuditLogMessagePartDTO, index: number) {
    if (part.type === "LINK" && part.route && part.label) {
        return (
            <Link key={`${part.entityId ?? part.label ?? "part"}-${index}`} className="auditLogLink" to={part.route}>
                {part.label}
            </Link>
        );
    }
    if (part.type === "LINK" && part.label) {
        return (
            <span key={`${part.entityId ?? part.label ?? "part"}-${index}`} className="auditLogLinkLabel">
                {part.label}
            </span>
        );
    }
    return <span key={`text-${index}`}>{part.text ?? ""}</span>;
}

function renderMessage(entry: AuditLogEntryDTO) {
    const parts = entry.messageParts ?? [];
    if (parts.length === 0) {
        return entry.summary;
    }
    return parts.map(renderMessagePart);
}

export default function AdminAuditLog() {
    const [entries, setEntries] = useState<AuditLogEntryDTO[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filters, setFilters] = useState<AuditFilterRow[]>(() => [createFilterRow()]);
    const [appliedQuery, setAppliedQuery] = useState<AuditLogQuery>({});
    const [page, setPage] = useState(0);
    const [total, setTotal] = useState(0);
    const [hasNext, setHasNext] = useState(false);
    const [hasPrevious, setHasPrevious] = useState(false);
    const activeFilterCount = useMemo(() => filters.filter(isFilterActive).length, [filters]);
    const actionOptions = useMemo(() => {
        const selectedActions = filters
            .filter((filter) => filter.field === "action" && filter.value.trim())
            .map((filter) => filter.value.trim());
        return sortAuditValues(
            Array.from(new Set([...entries.map((entry) => entry.action).filter(Boolean), ...selectedActions]))
        );
    }, [entries, filters]);
    const entityTypeOptions = useMemo(() => {
        const selectedEntityTypes = filters
            .filter((filter) => filter.field === "entityType" && filter.value.trim())
            .map((filter) => filter.value.trim());
        return sortAuditValues(
            Array.from(new Set([...entries.map((entry) => entry.entityType).filter(Boolean), ...selectedEntityTypes]))
        );
    }, [entries, filters]);

    useEffect(() => {
        let cancelled = false;

        const load = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await UserServices.getAuditLog({
                    ...appliedQuery,
                    page,
                    size: 50,
                });
                if (cancelled) return;
                setEntries(response.items);
                setTotal(response.totalElements);
                setHasNext(response.hasNext);
                setHasPrevious(response.hasPrevious);
            } catch (err: unknown) {
                if (!cancelled) {
                    setError(err instanceof Error ? err.message : "Failed to load audit log");
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        };

        void load();
        return () => {
            cancelled = true;
        };
    }, [appliedQuery, page]);

    const updateFilter = (id: string, patch: Partial<AuditFilterRow>) => {
        setFilters((current) =>
            current.map((filter) => {
                if (filter.id !== id) {
                    return filter;
                }
                const nextField = patch.field ?? filter.field;
                return {
                    ...filter,
                    ...patch,
                    field: nextField,
                    value: patch.field && patch.field !== filter.field ? "" : (patch.value ?? filter.value),
                };
            })
        );
    };

    const removeFilter = (id: string) => {
        setFilters((current) => {
            const next = current.filter((filter) => filter.id !== id);
            return next.length > 0 ? next : [createFilterRow()];
        });
    };

    const addFilter = () => {
        setFilters((current) => {
            const usedFields = new Set(current.map((filter) => filter.field));
            const nextField = FILTER_FIELD_OPTIONS.find((option) => !usedFields.has(option.value))?.value ?? "search";
            return [...current, createFilterRow(nextField)];
        });
    };

    const resetFilters = () => {
        setFilters([createFilterRow()]);
        setAppliedQuery({});
        setPage(0);
    };

    const fieldChoicesFor = (rowId: string) => {
        const usedByOtherRows = new Set(
            filters
                .filter((filter) => filter.id !== rowId)
                .map((filter) => filter.field)
        );
        return FILTER_FIELD_OPTIONS.filter((option) => !usedByOtherRows.has(option.value));
    };

    return (
        <>
            <Navbar />
            <div className="auditLogPage">
                <div className="pageShell">
                    <PrimaryNav />
                    <div className="pageShellContent">
                        <header className="auditLogHeader">
                            <div>
                                <PageBack to="/management" />
                                <h1 className="auditLogTitle">Audit Log</h1>
                                <p className="auditLogSubtitle">
                                    Review rule changes, approvals, assignments, and other major admin actions.
                                </p>
                            </div>
                        </header>

                        <div className="auditLogShell">
                            <Card
                                title="Activity"
                                right={<span className="auditLogCount">{total} entries</span>}
                                className="auditLogCard"
                            >
                                <form
                                    className="auditLogFilterPanel"
                                    onSubmit={(event) => {
                                        event.preventDefault();
                                        setPage(0);
                                        setAppliedQuery(buildAuditQuery(filters));
                                    }}
                                >
                                    <div className="auditLogDynamicFilters">
                                        {filters.map((filter) => (
                                            <div className="auditLogFilterRow" key={filter.id}>
                                                <label className="auditLogField auditLogField--field">
                                                    <span>Filter on</span>
                                                    <select
                                                        value={filter.field}
                                                        onChange={(event) =>
                                                            updateFilter(filter.id, {
                                                                field: event.target.value as AuditFilterField,
                                                            })
                                                        }
                                                    >
                                                        {fieldChoicesFor(filter.id).map((option) => (
                                                            <option key={option.value} value={option.value}>
                                                                {option.label}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </label>
                                                <label className="auditLogField">
                                                    <span>{FILTER_LABELS[filter.field]}</span>
                                                    {filter.field === "category" ? (
                                                        <select
                                                            value={filter.value}
                                                            onChange={(event) => updateFilter(filter.id, { value: event.target.value })}
                                                        >
                                                            {CATEGORY_OPTIONS.map((option) => (
                                                                <option key={option.value || "all"} value={option.value}>
                                                                    {option.label}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    ) : filter.field === "action" ? (
                                                        <select
                                                            value={filter.value}
                                                            onChange={(event) => updateFilter(filter.id, { value: event.target.value })}
                                                        >
                                                            <option value="">All actions</option>
                                                            {actionOptions.map((option) => (
                                                                <option key={option} value={option}>
                                                                    {prettifyAuditValue(option)}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    ) : filter.field === "entityType" ? (
                                                        <select
                                                            value={filter.value}
                                                            onChange={(event) => updateFilter(filter.id, { value: event.target.value })}
                                                        >
                                                            <option value="">All entity types</option>
                                                            {entityTypeOptions.map((option) => (
                                                                <option key={option} value={option}>
                                                                    {prettifyAuditValue(option)}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    ) : filter.field === "occurredFrom" || filter.field === "occurredTo" ? (
                                                        <input
                                                            type="date"
                                                            value={filter.value}
                                                            onChange={(event) => updateFilter(filter.id, { value: event.target.value })}
                                                        />
                                                    ) : (
                                                        <input
                                                            type="search"
                                                            value={filter.value}
                                                            onChange={(event) => updateFilter(filter.id, { value: event.target.value })}
                                                            placeholder="Search people, shifts, projects, or actions"
                                                        />
                                                    )}
                                                </label>
                                                <button
                                                    type="button"
                                                    className="auditLogIconButton"
                                                    onClick={() => removeFilter(filter.id)}
                                                    aria-label="Remove filter"
                                                    title="Remove filter"
                                                >
                                                    -
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="auditLogFilterActions">
                                        <div className="auditLogFilterMeta">
                                            {entries.length} shown on this page | {total} total entries
                                            {activeFilterCount > 0 ? ` | ${activeFilterCount} filters set` : ""}
                                        </div>
                                        <div className="auditLogActionButtons">
                                            <button className="button buttonSecondary" type="button" onClick={addFilter}>
                                                Add filter
                                            </button>
                                            <button className="button buttonSecondary" type="button" onClick={resetFilters}>
                                                Reset filters
                                            </button>
                                            <button className="button" type="submit" disabled={loading}>
                                                Apply filters
                                            </button>
                                        </div>
                                    </div>
                                </form>

                                {error ? <div className="auditLogError">{error}</div> : null}
                                {loading ? <div className="auditLogEmpty">Loading audit log...</div> : null}
                                {!loading && !error && entries.length === 0 ? (
                                    <p className="requestListEmpty auditLogListEmpty">No matching activity found.</p>
                                ) : null}

                                {!loading && !error && entries.length > 0 ? (
                                    <>
                                        <div className="auditLogList">
                                            {entries.map((entry) => (
                                                <article key={entry.entryId} className="auditLogRow">
                                                    <div className="auditLogMetaRow">
                                                        <span className="auditLogTime">{formatDateTime(entry.occurredAt)}</span>
                                                        <span className="auditLogCategory">{prettifyAuditValue(entry.category)}</span>
                                                    </div>
                                                    <div className="auditLogSummary">{renderMessage(entry)}</div>
                                                </article>
                                            ))}
                                        </div>
                                        <div className="auditLogPagination">
                                            <button
                                                className="button buttonSecondary"
                                                type="button"
                                                disabled={!hasPrevious || loading}
                                                onClick={() => setPage((current) => Math.max(current - 1, 0))}
                                            >
                                                Previous
                                            </button>
                                            <span>Page {page + 1}</span>
                                            <button
                                                className="button buttonSecondary"
                                                type="button"
                                                disabled={!hasNext || loading}
                                                onClick={() => setPage((current) => current + 1)}
                                            >
                                                Next
                                            </button>
                                        </div>
                                    </>
                                ) : null}
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
