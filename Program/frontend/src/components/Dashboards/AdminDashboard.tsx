import { type JSX, useEffect, useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";

import {
    type AnyRequest,
    type LeaveRequest,
    type PayslipUpdateRequest,
    type NewMemberRequest,
    AdminLeaveRequestModal,
    PayslipUpdateRequestModal,
    NewMemberRequestModal,
} from "../requests/RequestModals";

import { UserServices, type PayslipResponseDTO, type TimesheetRow } from "../../services/user-service/UserServices";
import { mapLeaves, type LeaveRequestDTO } from "../../utils/mapLeaveDtoToUi";
import Card from "../common/Card";
import {
    buildTimeframeOptions,
    filterTimesheetsByTimeframe,
    getIsoWeek,
    sumHours,
    sumHoursByUserForTimeframe,
    timeframeLabel,
    type Timeframe,
} from "../../utils/hoursSummary";

// Updated CSS imports
import "../../stylesheets/AdminDashboard.css";
import "../../stylesheets/AdminLists.css";

export default function AdminDashboard(): JSX.Element {
    const navigate = useNavigate();
    const [items, setItems] = useState<AnyRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState<string | null>(null);
    const [reviewPayslips, setReviewPayslips] = useState<PayslipResponseDTO[]>([]);
    const [reviewLoading, setReviewLoading] = useState(true);
    const [reviewErr, setReviewErr] = useState<string | null>(null);
    const [timesheets, setTimesheets] = useState<TimesheetRow[]>([]);
    const [timesheetLoading, setTimesheetLoading] = useState(true);
    const [timesheetErr, setTimesheetErr] = useState<string | null>(null);
    const timeframeOptions = useMemo(() => buildTimeframeOptions(timesheets), [timesheets]);
    const [timeframe, setTimeframe] = useState<Timeframe>({ kind: "all" });
    const [timeframeInitialized, setTimeframeInitialized] = useState(false);
    const yearOptions = useMemo(() => {
        const nowYear = new Date().getFullYear();
        const years = new Set<number>(timeframeOptions.years);
        years.add(nowYear);
        for (let i = 1; i <= 5; i++) years.add(nowYear - i);
        return [...years].sort((a, b) => b - a);
    }, [timeframeOptions.years]);
    const [hoursView, setHoursView] = useState<"summary" | "history">("summary");
    const [open, setOpen] = useState<AnyRequest | null>(null);
    const [acting, setActing] = useState(false);
    const [version, setVersion] = useState(0);

    const reload = useCallback(async () => {
        try {
            setLoading(true);
            setErr(null);
            setReviewLoading(true);
            setReviewErr(null);
            setTimesheetLoading(true);
            setTimesheetErr(null);

            const [leaveRes, reviewRes, timesheetRes] = await Promise.allSettled([
                UserServices.leaveRequests.list("PENDING"),
                UserServices.getPayslipsForReview(),
                UserServices.getTimesheets(),
            ]);

            if (leaveRes.status === "fulfilled") {
                const mapped = mapLeaves(leaveRes.value as LeaveRequestDTO[]) as unknown as AnyRequest[];
                setItems(mapped);
            } else {
                setErr((leaveRes.reason as any)?.message || "Failed to load requests");
            }

            if (reviewRes.status === "fulfilled") {
                setReviewPayslips(reviewRes.value);
            } else {
                setReviewErr((reviewRes.reason as any)?.message || "Failed to load payslips for review");
            }

            if (timesheetRes.status === "fulfilled") {
                setTimesheets(timesheetRes.value);
            } else {
                setTimesheetErr((timesheetRes.reason as any)?.message || "Failed to load timesheets");
            }
        } catch (e: any) {
            setErr(e?.message || "Failed to load requests");
        } finally {
            setLoading(false);
            setReviewLoading(false);
            setTimesheetLoading(false);
        }
    }, []);

    useEffect(() => {
        void reload();
    }, [version, reload]);

    const handleApprove = async (id: string) => {
        try {
            setActing(true);
            await UserServices.leaveRequests.approve(id);
            setOpen(null);
            setVersion((v) => v + 1);
        } catch (e: any) {
            alert(e?.message || "Approve failed");
        } finally {
            setActing(false);
        }
    };

    const handleReject = async (id: string, reason?: string) => {
        try {
            setActing(true);
            await UserServices.leaveRequests.reject(id, reason);
            setOpen(null);
            setVersion((v) => v + 1);
        } catch (e: any) {
            alert(e?.message || "Reject failed");
        } finally {
            setActing(false);
        }
    };

    useEffect(() => {
        if (timeframeInitialized) return;
        if (timesheets.length === 0) return;
        if (timeframeOptions.weeks.length > 0) {
            const latest = timeframeOptions.weeks[0];
            setTimeframe({ kind: "week", ...latest });
            setTimeframeInitialized(true);
        } else if (timeframeOptions.months.length > 0) {
            const latest = timeframeOptions.months[0];
            setTimeframe({ kind: "month", ...latest });
            setTimeframeInitialized(true);
        } else if (timeframeOptions.years.length > 0) {
            setTimeframe({ kind: "year", year: timeframeOptions.years[0] });
            setTimeframeInitialized(true);
        }
    }, [timeframeInitialized, timeframeOptions.months, timeframeOptions.weeks, timeframeOptions.years, timesheets.length]);

    const filteredTimesheets = useMemo(() => {
        const filtered = filterTimesheetsByTimeframe(timesheets, timeframe);
        return [...filtered].sort((a, b) => (b.dateOfIssue ?? "").localeCompare(a.dateOfIssue ?? ""));
    }, [timesheets, timeframe]);
    const totalHours = useMemo(() => sumHours(filteredTimesheets), [filteredTimesheets]);
    const perUser = useMemo(() => sumHoursByUserForTimeframe(timesheets, timeframe), [timesheets, timeframe]);

    return (
        <div className="adminDashboardPage">
            
            <div className="adminDashboardCard">
                <header className="pageHeader">
                    <h1 className="pageTitle">Admin Dashboard</h1>
                    <p className="pageSubtitle">Payroll overview and request management</p>
                </header>

                <main className="adminDashboardGrid">
                    
                    {/* 1. General Info */}
                    <Card title="General Info" className="dashboardCardHeight">
                        <div className="statRows">
                            <div className="statRow">
                                <div className="statLabel">Total users</div>
                                <div className="statValue">1,284</div>
                            </div>
                            <div className="statRow">
                                <div className="statLabel">Sick today</div>
                                <div className="statValue">42</div>
                            </div>
                            <div className="statRow">
                                <div className="statLabel">Pending requests</div>
                                <div className="statValue">{items.length}</div>
                            </div>
                            <div className="statRow">
                                <div className="statLabel">Payslips pending review</div>
                                <div className="statValue">
                                    {reviewLoading ? "…" : reviewErr ? "-" : reviewPayslips.length}
                                </div>
                            </div>
                        </div>
                        <div className="cardFooter">
                            <button className="button" onClick={() => navigate("/admin/onboarding")}>
                                Onboard employee
                            </button>
                        </div>
                    </Card>

                    {/* 2. Hours worked */}
                    <Card
                        title={`Hours Worked (${timeframeLabel(timeframe)})`}
                        className="dashboardCardHeight"
                        right={
                            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
                                <select
                                    className="uiSelect"
                                    value={hoursView}
                                    onChange={(e) => setHoursView(e.target.value as "summary" | "history")}
                                    aria-label="Select hours view"
                                >
                                    <option value="summary">Per user</option>
                                    <option value="history">Timesheets</option>
                                </select>

                                <select
                                    className="uiSelect"
                                    value={timeframe.kind}
                                    onChange={(e) => {
                                        const kind = e.target.value as Timeframe["kind"];
                                        if (kind === "all") setTimeframe({ kind });
                                        if (kind === "week") {
                                            const latest = timeframeOptions.weeks[0];
                                            const fallback = getIsoWeek(new Date());
                                            setTimeframe(latest ? { kind, ...latest } : { kind, ...fallback });
                                        }
                                        if (kind === "month") {
                                            const latest = timeframeOptions.months[0];
                                            const now = new Date();
                                            setTimeframe(
                                                latest ? { kind, ...latest } : { kind, year: now.getFullYear(), month: now.getMonth() + 1 }
                                            );
                                        }
                                        if (kind === "year") {
                                            const latest = timeframeOptions.years[0];
                                            const nowYear = new Date().getFullYear();
                                            setTimeframe(typeof latest === "number" ? { kind, year: latest } : { kind, year: nowYear });
                                        }
                                    }}
                                    disabled={timesheetLoading || timesheets.length === 0}
                                    aria-label="Select timeframe type"
                                >
                                    <option value="week">Week</option>
                                    <option value="month">Month</option>
                                    <option value="year">Year</option>
                                    <option value="all">All</option>
                                </select>

                                {timeframe.kind === "week" ? (
                                    <>
                                        <select
                                            className="uiSelect"
                                            value={String(timeframe.weekBasedYear)}
                                            onChange={(e) =>
                                                setTimeframe({
                                                    kind: "week",
                                                    weekBasedYear: Number(e.target.value),
                                                    weekNumber: timeframe.weekNumber,
                                                })
                                            }
                                            disabled={timesheetLoading}
                                            aria-label="Select week-based year"
                                        >
                                            {yearOptions.map((y) => (
                                                <option key={y} value={String(y)}>
                                                    {y}
                                                </option>
                                            ))}
                                        </select>
                                        <select
                                            className="uiSelect"
                                            value={String(timeframe.weekNumber)}
                                            onChange={(e) =>
                                                setTimeframe({
                                                    kind: "week",
                                                    weekBasedYear: timeframe.weekBasedYear,
                                                    weekNumber: Number(e.target.value),
                                                })
                                            }
                                            disabled={timesheetLoading}
                                            aria-label="Select week number"
                                        >
                                            {Array.from({ length: 53 }, (_, i) => i + 1).map((w) => (
                                                <option key={w} value={String(w)}>
                                                    Week {w}
                                                </option>
                                            ))}
                                        </select>
                                    </>
                                ) : null}

                                {timeframe.kind === "month" ? (
                                    <>
                                        <select
                                            className="uiSelect"
                                            value={String(timeframe.year)}
                                            onChange={(e) =>
                                                setTimeframe({ kind: "month", year: Number(e.target.value), month: timeframe.month })
                                            }
                                            disabled={timesheetLoading}
                                            aria-label="Select year"
                                        >
                                            {yearOptions.map((y) => (
                                                <option key={y} value={String(y)}>
                                                    {y}
                                                </option>
                                            ))}
                                        </select>
                                        <select
                                            className="uiSelect"
                                            value={String(timeframe.month)}
                                            onChange={(e) =>
                                                setTimeframe({ kind: "month", year: timeframe.year, month: Number(e.target.value) })
                                            }
                                            disabled={timesheetLoading}
                                            aria-label="Select month"
                                        >
                                            {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                                                <option key={m} value={String(m)}>
                                                    Month {String(m).padStart(2, "0")}
                                                </option>
                                            ))}
                                        </select>
                                    </>
                                ) : null}

                                {timeframe.kind === "year" ? (
                                    <select
                                        className="uiSelect"
                                        value={String(timeframe.year)}
                                        onChange={(e) => setTimeframe({ kind: "year", year: Number(e.target.value) })}
                                        disabled={timesheetLoading}
                                        aria-label="Select year"
                                    >
                                        {yearOptions.map((y) => (
                                            <option key={y} value={String(y)}>
                                                Year {y}
                                            </option>
                                        ))}
                                    </select>
                                ) : null}
                            </div>
                        }
                    >
                        <div className="listContainer">
                            {hoursView === "summary" ? (
                                <>
                                    <div className="listHeaderGrid gridUserHours">
                                        <div>Name</div>
                                        <div className="cellDate">Hours</div>
                                    </div>
                                    <div className="listScrollArea" style={{ maxHeight: 320 }}>
                                        {timesheetLoading ? <div className="listEmpty">Loading...</div> : null}
                                        {timesheetErr ? <div className="listEmpty errorText">{timesheetErr}</div> : null}
                                        {!timesheetLoading && !timesheetErr && perUser.users.length === 0 ? (
                                            <div className="listEmpty">No timesheets found</div>
                                        ) : null}

                                        {!timesheetLoading && !timesheetErr
                                            ? perUser.users.map((u) => (
                                                  <div key={u.userId} className="listRowGrid gridUserHours">
                                                      <div className="cellMain">{u.name}</div>
                                                      <div className="cellDate">{u.totalHours.toFixed(1)} h</div>
                                                  </div>
                                              ))
                                            : null}
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="listHeaderGrid gridTimesheetHistory">
                                        <div>Date</div>
                                        <div>Name</div>
                                        <div>Function</div>
                                        <div className="cellDate">Hours</div>
                                    </div>
                                    <div className="listScrollArea" style={{ maxHeight: 320 }}>
                                        {timesheetLoading ? <div className="listEmpty">Loading...</div> : null}
                                        {timesheetErr ? <div className="listEmpty errorText">{timesheetErr}</div> : null}
                                        {!timesheetLoading && !timesheetErr && filteredTimesheets.length === 0 ? (
                                            <div className="listEmpty">No timesheets found</div>
                                        ) : null}

                                        {!timesheetLoading && !timesheetErr
                                            ? filteredTimesheets.map((t) => (
                                                  <div key={t.timesheetId} className="listRowGrid gridTimesheetHistory">
                                                      <div className="cellSub">{t.dateOfIssue}</div>
                                                      <div className="cellMain">{t.name}</div>
                                                      <div className="cellSub">{t.function}</div>
                                                      <div className="cellDate">{Number(t.hoursWorked ?? 0).toFixed(1)} h</div>
                                                  </div>
                                              ))
                                            : null}
                                    </div>
                                </>
                            )}

                            <div className="cardFooter">
                                <div style={{ marginRight: "auto", fontSize: 12, color: "#666" }}>
                                    Total: {totalHours.toFixed(1)} h
                                </div>
                                <button
                                    className="button buttonSecondary"
                                    onClick={() => setVersion((v) => v + 1)}
                                    disabled={timesheetLoading}
                                >
                                    Refresh
                                </button>
                            </div>
                        </div>
                    </Card>

                    {/* 2. Requests (Main Action List) */}
                    <Card 
                        title="Pending Requests" 
                        className="dashboardCardHeight"
                        right={
                            <button className="button" onClick={() => setVersion(v => v+1)} disabled={loading}>
                                Refresh
                            </button>
                        }
                    >
                        <div className="listContainer">
                            {/* Fixed Header */}
                            <div className="listHeaderGrid gridRequests">
                                <div>Name</div>
                                <div>Type</div>
                                <div>Date</div>
                            </div>
                            
                            {/* Scrollable Body */}
                            <div className="listScrollArea">
                                {loading && <div className="listEmpty">Loading...</div>}
                                {err && <div className="listEmpty errorText">{err}</div>}
                                {!loading && !err && items.length === 0 && (
                                    <div className="listEmpty">No pending requests</div>
                                )}
                                
                                {items.map((req) => (
                                    <div 
                                        key={req.id} 
                                        className="listRowGrid gridRequests clickableRow"
                                        onClick={() => setOpen(req)}
                                    >
                                        <div className="cellMain">{(req as LeaveRequest).by}</div>
                                        <div className="cellSub">
                                            {req.type === "PayslipUpdate" ? "Payslip Fix" : 
                                             req.type === "NewMember" ? "New Member" : "Leave"}
                                        </div>
                                        <div className="cellDate">{(req as LeaveRequest).createdAt}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </Card>

                    {/* 3. Payslip Errors */}
                    <Card title="Payslip Errors" className="dashboardCardHeight">
                        <div className="listContainer">
                            <div className="listHeaderGrid gridErrors">
                                <div>Name</div>
                                <div>Issue</div>
                                <div>Time</div>
                            </div>
                            <div className="listScrollArea">
                                <div className="listRowGrid gridErrors">
                                    <div className="cellMain">J. Smith</div>
                                    <div className="cellBad">Missing bank info</div>
                                    <div className="cellDate">08:15</div>
                                </div>
                                <div className="listRowGrid gridErrors">
                                    <div className="cellMain">A. Garcia</div>
                                    <div className="cellBad">Tax ID mismatch</div>
                                    <div className="cellDate">08:12</div>
                                </div>
                                <div className="listRowGrid gridErrors">
                                    <div className="cellMain">K. Tanaka</div>
                                    <div className="cellBad">Overtime flag</div>
                                    <div className="cellDate">Yesterday</div>
                                </div>
                            </div>
                            <div className="cardFooter">
                                <button className="button buttonSecondary">Review errors</button>
                            </div>
                        </div>
                    </Card>

                    {/* 4. Contract Endings */}
                    <Card title="Contract End" className="dashboardCardHeight">
                        <div className="listContainer">
                            <div className="listHeaderGrid gridContracts">
                                <div>Name</div>
                                <div>End Date</div>
                                <div>Left</div>
                            </div>
                            <div className="listScrollArea">
                                <div className="listRowGrid gridContracts">
                                    <div className="cellMain">J. Smith</div>
                                    <div className="cellSub">Oct 29</div>
                                    <div className="cellWarn">1 day</div>
                                </div>
                                <div className="listRowGrid gridContracts">
                                    <div className="cellMain">A. Garcia</div>
                                    <div className="cellSub">Nov 2</div>
                                    <div className="cellSub">5 days</div>
                                </div>
                                <div className="listRowGrid gridContracts">
                                    <div className="cellMain">K. Tanaka</div>
                                    <div className="cellSub">Nov 10</div>
                                    <div className="cellSub">13 days</div>
                                </div>
                            </div>
                            <div className="cardFooter">
                                <button className="button buttonSecondary">View details</button>
                            </div>
                        </div>
                    </Card>

                    {/* 5. Calendar */}
                    <Card title="Calendar" className="dashboardCardHeight">
                        <div className="calendarWrapper">
                            <div className="calendarHeader">October 2025</div>
                            <div className="calendarGrid">
                                {["M","T","W","T","F","S","S"].map(d => <div key={d} className="calDayHead">{d}</div>)}
                                <div /> <div /> 
                                {[...Array(31)].map((_, i) => (
                                    <div key={i} className={`calDay ${i === 14 || i === 29 ? "calDayActive" : ""}`}>
                                        {i + 1}
                                    </div>
                                ))}
                            </div>
                            <div className="calendarLegend">
                                <span className="calDot" /> Run day
                            </div>
                        </div>
                    </Card>

                    {/* 6. Payslip Review */}
                    <Card title="Payslip Review" className="dashboardCardHeight">
                         <div className="listContainer">
                            <div className="listHeaderGrid gridPayouts">
                                <div>Name</div>
                                <div>Payout</div>
                                <div>Status</div>
                            </div>
                            <div className="listScrollArea">
                                {reviewLoading ? <div className="listEmpty">Loading...</div> : null}
                                {reviewErr ? <div className="listEmpty errorText">{reviewErr}</div> : null}
                                {!reviewLoading && !reviewErr && reviewPayslips.length === 0 ? (
                                    <div className="listEmpty">No payslips pending review</div>
                                ) : null}

                                {!reviewLoading && !reviewErr
                                    ? [...reviewPayslips]
                                          .sort((a, b) => (a.availableToUserAt ?? "").localeCompare(b.availableToUserAt ?? ""))
                                          .slice(0, 6)
                                          .map((p) => (
                                              <div
                                                  key={p.payslipId}
                                                  className="listRowGrid gridPayouts clickableRow"
                                                  onClick={() => navigate("/admin/payslip-review")}
                                              >
                                                  <div className="cellMain">{p.name}</div>
                                                  <div className="cellSub">{p.availableToUserAt ?? "-"}</div>
                                                  <div className="cellWarn">Pending</div>
                                              </div>
                                          ))
                                    : null}
                            </div>
                            <div className="cardFooter">
                                <button className="button" onClick={() => navigate("/admin/payslip-review")}>
                                    Review payslips
                                </button>
                            </div>
                        </div>
                    </Card>

                </main>
            </div>

            {/* Modals */}
            {open?.type === "Leave" && (
                <AdminLeaveRequestModal
                    open={true}
                    onClose={() => setOpen(null)}
                    data={open as LeaveRequest}
                    onApprove={handleApprove}
                    onReject={handleReject}
                />
            )}
            {open?.type === "PayslipUpdate" && (
                <PayslipUpdateRequestModal
                    open={true}
                    onClose={() => setOpen(null)}
                    data={open as PayslipUpdateRequest}
                    onMarkFixed={() => alert("Marked fixed")}
                    onAskInfo={() => alert("Asked for more info")}
                />
            )}
            {open?.type === "NewMember" && (
                <NewMemberRequestModal
                    open={true}
                    onClose={() => setOpen(null)}
                    data={open as NewMemberRequest}
                    onApprove={() => alert("Approved")}
                    onReject={() => alert("Rejected")}
                />
            )}
            {acting && <div style={{position:'fixed', inset:0, background:'rgba(0,0,0,0.2)', zIndex:2000}} />}
        </div>
    );
}
