import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import PageBack from "../components/PageBack";
import PrimaryNav from "../components/PrimaryNav";
import PaginationControls from "../components/common/PaginationControls";
import { useAuth } from "../context/AuthContext";
import { UserServices, type PayslipResponseDTO } from "../services/user-service/UserServices";
import { formatDate } from "../utils/dateFormat";
import { normalizeDateInput, parseDisplayDate } from "../utils/dateInput";
import "../stylesheets/PayslipsPage.css";

type PayslipScope = "mine" | "all";

type FilterState = {
    search: string;
    status: string;
    dateFrom: string;
    dateTo: string;
    weekYear: string;
    weekNumber: string;
    minHours: string;
    maxHours: string;
    minNet: string;
    maxNet: string;
};

const DEFAULT_PAGE_SIZE = 50;

const createFilters = (): FilterState => ({
    search: "",
    status: "ALL",
    dateFrom: "",
    dateTo: "",
    weekYear: "",
    weekNumber: "",
    minHours: "",
    maxHours: "",
    minNet: "",
    maxNet: "",
});

const normalizeStatus = (status?: string) => (status ?? "RELEASED").toUpperCase();

const formatStatus = (status?: string) => {
    const value = normalizeStatus(status);
    if (value === "NOT_ACCEPTED") return "Not accepted";
    return value
        .split("_")
        .map((part) => part[0] + part.slice(1).toLowerCase())
        .join(" ");
};

const formatWeek = (weekYear: number, weekNumber: number) => {
    const padded = String(weekNumber ?? "").padStart(2, "0");
    return `${weekYear}-W${padded}`;
};

const parseNumber = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) return null;
    const num = Number(trimmed);
    return Number.isFinite(num) ? num : null;
};

const formatHours = (value?: number | null) => {
    const num = Number(value ?? 0);
    if (!Number.isFinite(num)) return "-";
    return num.toFixed(2);
};

const formatCurrency = (value?: number | null) => {
    const num = Number(value ?? 0);
    if (!Number.isFinite(num)) return "-";
    return new Intl.NumberFormat("nl-NL", {
        style: "currency",
        currency: "EUR",
        minimumFractionDigits: 2,
    }).format(num);
};

const filterPayslips = (payslips: PayslipResponseDTO[], filters: FilterState) => {
    const term = filters.search.trim().toLowerCase();
    const minHours = parseNumber(filters.minHours);
    const maxHours = parseNumber(filters.maxHours);
    const minNet = parseNumber(filters.minNet);
    const maxNet = parseNumber(filters.maxNet);
    const weekYear = parseNumber(filters.weekYear);
    const weekNumber = parseNumber(filters.weekNumber);
    const dateFrom = parseDisplayDate(filters.dateFrom);
    const dateTo = parseDisplayDate(filters.dateTo);

    return payslips.filter((payslip) => {
        const status = normalizeStatus(payslip.status);
        if (filters.status === "NOT_ACCEPTED") {
            if (status === "RELEASED" || status === "APPROVED") return false;
        } else if (filters.status !== "ALL" && status !== filters.status) {
            return false;
        }

        if (term) {
            const haystack = [
                payslip.name,
                payslip.functionName,
                payslip.userId,
                payslip.payslipId,
            ]
                .filter(Boolean)
                .join(" ")
                .toLowerCase();
            if (!haystack.includes(term)) return false;
        }

        if (dateFrom && payslip.dateOfIssue < dateFrom) return false;
        if (dateTo && payslip.dateOfIssue > dateTo) return false;

        if (weekYear !== null && payslip.weekBasedYear !== weekYear) return false;
        if (weekNumber !== null && payslip.weekNumber !== weekNumber) return false;

        const hours = Number(payslip.totalHoursWorked ?? 0);
        const net = Number(payslip.totalNetAmount ?? 0);

        if (minHours !== null && hours < minHours) return false;
        if (maxHours !== null && hours > maxHours) return false;
        if (minNet !== null && net < minNet) return false;
        if (maxNet !== null && net > maxNet) return false;

        return true;
    });
};

export default function Payslips() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { permissions, permissionsLoading, permissionsError } = useAuth();

    const [activeScope, setActiveScope] = useState<PayslipScope>("mine");
    const [filters, setFilters] = useState<Record<PayslipScope, FilterState>>(() => ({
        mine: createFilters(),
        all: createFilters(),
    }));

    const [myPayslips, setMyPayslips] = useState<PayslipResponseDTO[]>([]);
    const [allPayslips, setAllPayslips] = useState<PayslipResponseDTO[]>([]);
    const [loading, setLoading] = useState({ mine: false, all: false });
    const [errors, setErrors] = useState<{ mine: string | null; all: string | null }>({
        mine: null,
        all: null,
    });
    const [loaded, setLoaded] = useState({ mine: false, all: false });
    const [pages, setPages] = useState<Record<PayslipScope, number>>({ mine: 0, all: 0 });
    const [pageSizes, setPageSizes] = useState<Record<PayslipScope, number>>({ mine: DEFAULT_PAGE_SIZE, all: DEFAULT_PAGE_SIZE });
    const [totals, setTotals] = useState<Record<PayslipScope, number>>({ mine: 0, all: 0 });
    const [totalPagesByScope, setTotalPagesByScope] = useState<Record<PayslipScope, number>>({ mine: 0, all: 0 });
    const [downloadError, setDownloadError] = useState<string | null>(null);
    const [downloadId, setDownloadId] = useState<string | null>(null);

    const canViewOwn =
        permissions.includes("CAN_VIEW_PAYSLIPS") || permissions.includes("CAN_VIEW_ALL_PAYSLIPS");
    const canViewAll = permissions.includes("CAN_VIEW_ALL_PAYSLIPS");

    useEffect(() => {
        if (permissionsLoading) return;
        if (activeScope === "mine" && !canViewOwn && canViewAll) {
            setActiveScope("all");
            return;
        }
        if (activeScope === "all" && !canViewAll && canViewOwn) {
            setActiveScope("mine");
            return;
        }
        if (!canViewOwn && canViewAll && activeScope !== "all") {
            setActiveScope("all");
            return;
        }
        if (!canViewAll && canViewOwn && activeScope !== "mine") {
            setActiveScope("mine");
        }
    }, [permissionsLoading, canViewOwn, canViewAll, activeScope]);

    useEffect(() => {
        if (permissionsLoading) return;
        const scopeParam = (searchParams.get("scope") ?? "").toLowerCase();
        const statusParam = searchParams.get("status");
        const normalizedStatus = statusParam ? statusParam.toUpperCase() : null;

        let targetScope: PayslipScope | null = null;
        if (scopeParam === "all" && canViewAll) {
            targetScope = "all";
            setActiveScope("all");
        } else if (scopeParam === "mine" && canViewOwn) {
            targetScope = "mine";
            setActiveScope("mine");
        }

        if (normalizedStatus) {
            const statusValue = normalizedStatus === "NOT_ACCEPTED" ? "NOT_ACCEPTED" : normalizedStatus;
            const scopeForFilter = targetScope ?? activeScope;
            setFilters((prev) => ({
                ...prev,
                [scopeForFilter]: {
                    ...prev[scopeForFilter],
                    status: statusValue,
                },
            }));
        }
    }, [activeScope, canViewAll, canViewOwn, permissionsLoading, searchParams]);

    const loadPayslips = useCallback(async (
        scope: PayslipScope,
        targetPage = pages[scope],
        targetPageSize = pageSizes[scope]
    ) => {
        setLoading((prev) => ({ ...prev, [scope]: true }));
        setErrors((prev) => ({ ...prev, [scope]: null }));
        try {
            const data =
                scope === "mine"
                    ? await UserServices.getMyPayslipsPage(targetPage, targetPageSize)
                    : await UserServices.getAllPayslipsPage(targetPage, targetPageSize);
            if (scope === "mine") {
                setMyPayslips(data.items ?? []);
            } else {
                setAllPayslips(data.items ?? []);
            }
            setPages((prev) => ({ ...prev, [scope]: data.page }));
            setTotals((prev) => ({ ...prev, [scope]: data.totalElements }));
            setTotalPagesByScope((prev) => ({ ...prev, [scope]: data.totalPages }));
            setLoaded((prev) => ({ ...prev, [scope]: true }));
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "Failed to load payslips";
            setErrors((prev) => ({ ...prev, [scope]: message }));
        } finally {
            setLoading((prev) => ({ ...prev, [scope]: false }));
        }
    }, [pageSizes, pages]);

    useEffect(() => {
        if (activeScope === "mine" && canViewOwn && !loaded.mine) {
            void loadPayslips("mine");
        }
        if (activeScope === "all" && canViewAll && !loaded.all) {
            void loadPayslips("all");
        }
    }, [activeScope, canViewOwn, canViewAll, loaded, loadPayslips]);

    const activePayslips = activeScope === "mine" ? myPayslips : allPayslips;
    const activeFilters = filters[activeScope];

    const statusOptions = useMemo(() => {
        const statuses = new Set(activePayslips.map((p) => normalizeStatus(p.status)));
        statuses.delete("NOT_ACCEPTED");
        return ["ALL", "NOT_ACCEPTED", ...Array.from(statuses).sort()];
    }, [activePayslips]);
    const searchPlaceholder =
        activeScope === "all"
            ? "Name, function, user ID, payslip ID"
            : "Function or date";

    const filteredPayslips = useMemo(() => {
        return filterPayslips(activePayslips, activeFilters).sort((a, b) =>
            b.dateOfIssue.localeCompare(a.dateOfIssue)
        );
    }, [activePayslips, activeFilters]);

    const updateFilter = (field: keyof FilterState, value: string) => {
        setFilters((prev) => ({
            ...prev,
            [activeScope]: {
                ...prev[activeScope],
                [field]: value,
            },
        }));
    };

    const resetFilters = () => {
        setFilters((prev) => ({
            ...prev,
            [activeScope]: createFilters(),
        }));
    };

    const downloadPayslipPdf = async (payslip: PayslipResponseDTO) => {
        try {
            setDownloadError(null);
            setDownloadId(payslip.payslipId);
            const blob = await UserServices.getPayslipPdf(payslip.payslipId);
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = `payslip_${payslip.dateOfIssue || payslip.payslipId}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "Failed to download payslip";
            setDownloadError(message);
        } finally {
            setDownloadId(null);
        }
    };

    const headerLabel = activeScope === "mine" ? "My payslips" : "All payslips";
    const canSeeAnyPayslips = canViewOwn || canViewAll;
    const scopeUnavailable =
        (activeScope === "mine" && !canViewOwn) || (activeScope === "all" && !canViewAll);
    const canSwitchScope = canViewOwn && canViewAll;
    const openPayslip = (payslipId: string) => {
        navigate(`/payslips/${payslipId}`);
    };

    return (
        <>
            <Navbar />
            <div className="payslipsPage">
                <div className="pageShell">
                    <PrimaryNav />
                    <div className="pageShellContent">
                        <div className="pageHeader">
                            {activeScope === "all" ? (
                                <PageBack to="/management" />
                            ) : null}
                            <h1 className="pageTitle">Payslips</h1>
                        </div>
                        <div className="payslipsCard">
                            {permissionsLoading ? (
                                <div className="payslipsNotice">Loading permissions...</div>
                            ) : null}
                            {permissionsError ? (
                                <div className="payslipsError">{permissionsError}</div>
                            ) : null}

                            {!scopeUnavailable && canSeeAnyPayslips ? (
                                <>
                                    {canSwitchScope ? (
                                        <div className="payslipsTabs" role="tablist" aria-label="Payslip scope">
                                            <button
                                                type="button"
                                                className={`payslipsTab${
                                                    activeScope === "mine" ? " payslipsTab--active" : ""
                                                }`}
                                                onClick={() => setActiveScope("mine")}
                                                role="tab"
                                                aria-selected={activeScope === "mine"}
                                            >
                                                My payslips
                                            </button>
                                            <button
                                                type="button"
                                                className={`payslipsTab${
                                                    activeScope === "all" ? " payslipsTab--active" : ""
                                                }`}
                                                onClick={() => setActiveScope("all")}
                                                role="tab"
                                                aria-selected={activeScope === "all"}
                                            >
                                                All payslips
                                            </button>
                                            <div className="payslipsTabMeta">
                                                {activeScope === "mine"
                                                    ? "Showing payslips assigned to your account."
                                                    : "Showing every company payslip you can access."}
                                            </div>
                                        </div>
                                    ) : null}

                                    <div className="payslipsFilterPanel">
                                        <div className="payslipsFilterGrid">
                                            <label className="payslipsFilterField">
                                                <span>Search</span>
                                                <input
                                                    type="search"
                                                    value={activeFilters.search}
                                                    onChange={(e) => updateFilter("search", e.target.value)}
                                                    placeholder={searchPlaceholder}
                                                />
                                            </label>

                                            <label className="payslipsFilterField">
                                                <span>Status</span>
                                                <select
                                                    value={activeFilters.status}
                                                    onChange={(e) => updateFilter("status", e.target.value)}
                                                >
                                                    {statusOptions.map((status) => (
                                                        <option key={status} value={status}>
                                                            {status === "ALL" ? "All statuses" : formatStatus(status)}
                                                        </option>
                                                    ))}
                                                </select>
                                            </label>

                                            <label className="payslipsFilterField">
                                                <span>Date from</span>
                                                <input
                                                    type="text"
                                                    value={activeFilters.dateFrom}
                                                    onChange={(e) => updateFilter("dateFrom", normalizeDateInput(e.target.value))}
                                                    inputMode="numeric"
                                                    placeholder="dd/mm/yyyy"
                                                    maxLength={10}
                                                />
                                            </label>

                                            <label className="payslipsFilterField">
                                                <span>Date to</span>
                                                <input
                                                    type="text"
                                                    value={activeFilters.dateTo}
                                                    onChange={(e) => updateFilter("dateTo", normalizeDateInput(e.target.value))}
                                                    inputMode="numeric"
                                                    placeholder="dd/mm/yyyy"
                                                    maxLength={10}
                                                />
                                            </label>

                                            <label className="payslipsFilterField">
                                                <span>Week year</span>
                                                <input
                                                    type="number"
                                                    inputMode="numeric"
                                                    value={activeFilters.weekYear}
                                                    onChange={(e) => updateFilter("weekYear", e.target.value)}
                                                    placeholder="2026"
                                                />
                                            </label>

                                            <label className="payslipsFilterField">
                                                <span>Week number</span>
                                                <input
                                                    type="number"
                                                    inputMode="numeric"
                                                    value={activeFilters.weekNumber}
                                                    onChange={(e) => updateFilter("weekNumber", e.target.value)}
                                                    placeholder="1-53"
                                                />
                                            </label>

                                            <label className="payslipsFilterField">
                                                <span>Min hours</span>
                                                <input
                                                    type="number"
                                                    inputMode="decimal"
                                                    value={activeFilters.minHours}
                                                    onChange={(e) => updateFilter("minHours", e.target.value)}
                                                    placeholder="0"
                                                />
                                            </label>

                                            <label className="payslipsFilterField">
                                                <span>Max hours</span>
                                                <input
                                                    type="number"
                                                    inputMode="decimal"
                                                    value={activeFilters.maxHours}
                                                    onChange={(e) => updateFilter("maxHours", e.target.value)}
                                                    placeholder="60"
                                                />
                                            </label>

                                            <label className="payslipsFilterField">
                                                <span>Min net pay</span>
                                                <input
                                                    type="number"
                                                    inputMode="decimal"
                                                    value={activeFilters.minNet}
                                                    onChange={(e) => updateFilter("minNet", e.target.value)}
                                                    placeholder="0"
                                                />
                                            </label>

                                            <label className="payslipsFilterField">
                                                <span>Max net pay</span>
                                                <input
                                                    type="number"
                                                    inputMode="decimal"
                                                    value={activeFilters.maxNet}
                                                    onChange={(e) => updateFilter("maxNet", e.target.value)}
                                                    placeholder="5000"
                                                />
                                            </label>
                                        </div>
                                        <div className="payslipsFilterActions">
                                            <div className="payslipsFilterMeta">
                                                {filteredPayslips.length} shown
                                                {activePayslips.length !== filteredPayslips.length
                                                    ? ` of ${activePayslips.length}`
                                                    : ""}
                                                {` on this page | ${totals[activeScope]} total`}
                                            </div>
                                            <button type="button" className="buttonSecondary" onClick={resetFilters}>
                                                Reset filters
                                            </button>
                                        </div>
                                    </div>

                                    {downloadError ? (
                                        <div className="payslipsError">{downloadError}</div>
                                    ) : null}

                                    {loading[activeScope] ? (
                                        <div className="payslipsNotice">Loading {headerLabel.toLowerCase()}...</div>
                                    ) : errors[activeScope] ? (
                                        <div className="payslipsError">{errors[activeScope]}</div>
                                    ) : (
                                        <>
                                            <div className="payslipsListCard">
                                                <div className="payslipsListWrap">
                                                    <div
                                                        className={`payslipsListHeader payslipsGrid ${
                                                            activeScope === "all"
                                                                ? "payslipsGrid--all"
                                                                : "payslipsGrid--mine"
                                                        }`}
                                                    >
                                                        <div>Date</div>
                                                        {activeScope === "all" ? <div>User</div> : null}
                                                        <div>Week</div>
                                                        <div>Function</div>
                                                        <div>Hours</div>
                                                        <div>Net</div>
                                                        <div>Status</div>
                                                        <div>Action</div>
                                                    </div>
                                                    <div className="payslipsListBody">
                                                        {filteredPayslips.length === 0 ? (
                                                            <div
                                                                className={`payslipsListRow payslipsListRow--empty payslipsGrid ${
                                                                    activeScope === "all"
                                                                        ? "payslipsGrid--all"
                                                                        : "payslipsGrid--mine"
                                                                }`}
                                                            >
                                                                <div className="payslipsEmptyCell">
                                                                    No payslips match these filters.
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            filteredPayslips.map((payslip) => (
                                                                <div
                                                                    key={payslip.payslipId}
                                                                    className={`payslipsListRow payslipsGrid ${
                                                                        activeScope === "all"
                                                                            ? "payslipsGrid--all"
                                                                            : "payslipsGrid--mine"
                                                                    }`}
                                                                    role="button"
                                                                    tabIndex={0}
                                                                    onClick={() => openPayslip(payslip.payslipId)}
                                                                    onKeyDown={(event) => {
                                                                        if (event.key === "Enter" || event.key === " ") {
                                                                            event.preventDefault();
                                                                            openPayslip(payslip.payslipId);
                                                                        }
                                                                    }}
                                                                >
                                                                    <div className="payslipsCellMain">
                                                                        {formatDate(payslip.dateOfIssue)}
                                                                    </div>
                                                                    {activeScope === "all" ? (
                                                                        <div>
                                                                            <div className="payslipsCellMain">{payslip.name}</div>
                                                                            <div className="payslipsCellSub">{payslip.userId}</div>
                                                                        </div>
                                                                    ) : null}
                                                                    <div className="payslipsCellSub">
                                                                        {formatWeek(payslip.weekBasedYear, payslip.weekNumber)}
                                                                    </div>
                                                                    <div className="payslipsCellSub">{payslip.functionName}</div>
                                                                    <div className="payslipsCellSub">
                                                                        {formatHours(payslip.totalHoursWorked)}
                                                                    </div>
                                                                    <div className="payslipsCellSub">
                                                                        {formatCurrency(payslip.totalNetAmount)}
                                                                    </div>
                                                                    <div
                                                                        className={`payslipStatus payslipStatus--${normalizeStatus(
                                                                            payslip.status
                                                                        )}`}
                                                                    >
                                                                        {formatStatus(payslip.status)}
                                                                    </div>
                                                                    <div>
                                                                        <button
                                                                            type="button"
                                                                            className="linkButton"
                                                                            disabled={downloadId === payslip.payslipId}
                                                                            onClick={(event) => {
                                                                                event.stopPropagation();
                                                                                void downloadPayslipPdf(payslip);
                                                                            }}
                                                                        >
                                                                            {downloadId === payslip.payslipId
                                                                                ? "Downloading..."
                                                                                : "Download PDF"}
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            ))
                                                        )}
                                                    </div>
                                                </div>
                                                <PaginationControls
                                                    page={pages[activeScope]}
                                                    totalPages={totalPagesByScope[activeScope]}
                                                    pageSize={pageSizes[activeScope]}
                                                    loading={loading[activeScope]}
                                                    onPageChange={(nextPage) => void loadPayslips(activeScope, nextPage)}
                                                    onPageSizeChange={(nextPageSize) => {
                                                        setPageSizes((prev) => ({ ...prev, [activeScope]: nextPageSize }));
                                                        setPages((prev) => ({ ...prev, [activeScope]: 0 }));
                                                        void loadPayslips(activeScope, 0, nextPageSize);
                                                    }}
                                                />
                                            </div>
                                        </>
                                    )}
                                </>
                            ) : (
                                <div className="payslipsNotice">
                                    {canSeeAnyPayslips
                                        ? "This payslip view is not available for your account."
                                        : "You do not have permission to view payslips."}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
