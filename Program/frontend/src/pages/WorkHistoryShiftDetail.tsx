import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import PrimaryNav from "../components/PrimaryNav";
import Card from "../components/common/Card";
import Spinner from "../components/Spinner";
import { AuthServices } from "../services/auth-service/AuthServices";
import { UserServices, type EmployeePlanningAssignmentDTO, type TimesheetRow } from "../services/user-service/UserServices";
import { formatDate, formatDateTime } from "../utils/dateFormat";
import "../stylesheets/WorkHistory.css";

function money(value: number | null | undefined): string {
    return new Intl.NumberFormat("nl-NL", { style: "currency", currency: "EUR" }).format(Number(value ?? 0));
}

function formatHourValue(value: number | null | undefined): string {
    return Number(value ?? 0).toFixed(1);
}

function formatDateValue(value?: string | null): string {
    if (!value) return "-";
    return formatDate(value);
}

function formatTimeRange(start?: string | null, end?: string | null): string {
    const startValue = start?.slice(11, 16);
    const endValue = end?.slice(11, 16);
    if (startValue && endValue) return `${startValue} - ${endValue}`;
    return "-";
}

export default function WorkHistoryShiftDetail() {
    const { timesheetId } = useParams<{ timesheetId: string }>();
    const [searchParams] = useSearchParams();
    const personalView = searchParams.get("view") === "personal";
    const navigate = useNavigate();
    const [timesheet, setTimesheet] = useState<TimesheetRow | null>(null);
    const [assignment, setAssignment] = useState<EmployeePlanningAssignmentDTO | null>(null);
    const [employeeName, setEmployeeName] = useState<string>("-");
    const [useAdminEndpoints, setUseAdminEndpoints] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [proofError, setProofError] = useState<string | null>(null);

    useEffect(() => {
        if (!timesheetId) {
            setLoading(false);
            setError("Missing worked shift id.");
            return;
        }

        let cancelled = false;

        const load = async () => {
            try {
                setLoading(true);
                setError(null);
                const [timesheetData, permissions] = await Promise.all([
                    UserServices.getTimesheetById(timesheetId),
                    AuthServices.getPermissions(),
                ]);

                if (cancelled) return;
                setTimesheet(timesheetData);

                if (timesheetData.userId) {
                    try {
                        const names = await UserServices.getUserDisplayNames([timesheetData.userId]);
                        if (!cancelled) {
                            setEmployeeName(names[timesheetData.userId] ?? timesheetData.name ?? timesheetData.userId);
                        }
                    } catch {
                        if (!cancelled) {
                            setEmployeeName(timesheetData.name ?? timesheetData.userId ?? "-");
                        }
                    }
                } else {
                    setEmployeeName(timesheetData.name ?? "-");
                }

                if (!timesheetData.sourceScheduleEntryId) {
                    setAssignment(null);
                    return;
                }

                const canViewAdminAssignment =
                    !personalView &&
                    ((permissions ?? []).includes("CAN_VIEW_ALL_TIMESHEETS") ||
                        (permissions ?? []).includes("CAN_MANAGE_TIMESHEETS"));
                if (!cancelled) {
                    setUseAdminEndpoints(canViewAdminAssignment);
                }

                const assignmentData = canViewAdminAssignment
                    ? await UserServices.getPlanningAssignmentAdmin(timesheetData.sourceScheduleEntryId)
                    : await UserServices.getMyPlanningAssignment(timesheetData.sourceScheduleEntryId);

                if (!cancelled) {
                    setAssignment(assignmentData);
                    if (assignmentData.userDisplayName?.trim()) {
                        setEmployeeName(assignmentData.userDisplayName.trim());
                    }
                }
            } catch (err: unknown) {
                if (!cancelled) {
                    setError(err instanceof Error ? err.message : "Failed to load worked shift");
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
    }, [personalView, timesheetId]);

    const backTarget = useMemo(() => {
        return personalView ? "/work-history?view=personal" : "/work-history";
    }, [personalView]);

    const openProof = async () => {
        if (!timesheet?.sourceScheduleEntryId) return;
        try {
            setProofError(null);
            const blob = await UserServices.getTravelClaimProof(timesheet.sourceScheduleEntryId, useAdminEndpoints);
            const url = URL.createObjectURL(blob);
            window.open(url, "_blank", "noopener,noreferrer");
            setTimeout(() => URL.revokeObjectURL(url), 5000);
        } catch (err: unknown) {
            setProofError(err instanceof Error ? err.message : "Failed to open travel proof");
        }
    };

    return (
        <>
            <Navbar />
            <div className="workHistoryPage">
                <div className="pageShell">
                    <PrimaryNav />
                    <div className="pageShellContent">
                        <header className="workHistoryHeader workHistoryHeader--detail">
                            <button type="button" className="button" onClick={() => navigate(backTarget)}>
                                Back to work history
                            </button>
                            <h1 className="workHistoryTitle">Worked Shift</h1>
                        </header>
                        <div className="workHistoryShell">
                            {loading ? (
                                <div className="workHistoryLoading">
                                    <Spinner text="Loading worked shift" />
                                </div>
                            ) : error ? (
                                <div className="workHistoryError">{error}</div>
                            ) : timesheet ? (
                                <div className="workHistoryDetailLayout">
                                    <Card title="Shift overview" className="workHistoryCard">
                                        <div className="workHistoryDetailGrid">
                                            <div className="workHistoryDetailItem">
                                                <span className="workHistoryDetailLabel">Employee</span>
                                                <span className="workHistoryDetailValue">{employeeName}</span>
                                            </div>
                                            <div className="workHistoryDetailItem">
                                                <span className="workHistoryDetailLabel">Date</span>
                                                <span className="workHistoryDetailValue">
                                                    {formatDateValue(assignment?.shiftDate ?? timesheet.shiftDate ?? timesheet.dateOfIssue)}
                                                </span>
                                            </div>
                                            <div className="workHistoryDetailItem">
                                                <span className="workHistoryDetailLabel">Time</span>
                                                <span className="workHistoryDetailValue">
                                                    {formatTimeRange(assignment?.startTime ?? timesheet.shiftStartTime, assignment?.endTime ?? timesheet.shiftEndTime)}
                                                </span>
                                            </div>
                                            <div className="workHistoryDetailItem">
                                                <span className="workHistoryDetailLabel">Shift</span>
                                                <span className="workHistoryDetailValue">
                                                    {assignment?.shiftName ?? timesheet.shiftName ?? timesheet.function}
                                                </span>
                                            </div>
                                            <div className="workHistoryDetailItem">
                                                <span className="workHistoryDetailLabel">Event</span>
                                                <span className="workHistoryDetailValue">
                                                    {assignment?.eventName ?? timesheet.eventName ?? "-"}
                                                </span>
                                            </div>
                                            <div className="workHistoryDetailItem">
                                                <span className="workHistoryDetailLabel">Function</span>
                                                <span className="workHistoryDetailValue">
                                                    {assignment?.functionName ?? timesheet.function}
                                                </span>
                                            </div>
                                            <div className="workHistoryDetailItem">
                                                <span className="workHistoryDetailLabel">Hours worked</span>
                                                <span className="workHistoryDetailValue">
                                                    {formatHourValue(timesheet.hoursWorked)} h
                                                </span>
                                            </div>
                                            <div className="workHistoryDetailItem">
                                                <span className="workHistoryDetailLabel">Break</span>
                                                <span className="workHistoryDetailValue">
                                                    {assignment?.breakMinutes ?? timesheet.breakMinutes ?? 0} min
                                                </span>
                                            </div>
                                            <div className="workHistoryDetailItem">
                                                <span className="workHistoryDetailLabel">Timesheet</span>
                                                <span className="workHistoryDetailValue">
                                                    {assignment?.timesheetExported ?? true ? "Logged" : "Not logged"}
                                                </span>
                                            </div>
                                            <div className="workHistoryDetailItem">
                                                <span className="workHistoryDetailLabel">Logged at</span>
                                                <span className="workHistoryDetailValue">
                                                    {formatDateTime(assignment?.timesheetExportedAt ?? null)}
                                                </span>
                                            </div>
                                        </div>
                                    </Card>

                                    <Card title="Travel expenses" className="workHistoryCard">
                                        {proofError ? <div className="workHistoryError">{proofError}</div> : null}
                                        <div className="workHistoryDetailGrid">
                                            <div className="workHistoryDetailItem">
                                                <span className="workHistoryDetailLabel">Timesheet travel amount</span>
                                                <span className="workHistoryDetailValue">
                                                    {money(timesheet.travelExpenses ?? 0)}
                                                </span>
                                            </div>
                                            <div className="workHistoryDetailItem">
                                                <span className="workHistoryDetailLabel">Submission status</span>
                                                <span className="workHistoryDetailValue">
                                                    {assignment?.travelClaim?.status ?? "Not submitted"}
                                                </span>
                                            </div>
                                            <div className="workHistoryDetailItem">
                                                <span className="workHistoryDetailLabel">Kilometers</span>
                                                <span className="workHistoryDetailValue">
                                                    {assignment?.travelClaim?.kilometers ?? timesheet.travelKilometers ?? "-"}
                                                </span>
                                            </div>
                                            <div className="workHistoryDetailItem">
                                                <span className="workHistoryDetailLabel">Rate</span>
                                                <span className="workHistoryDetailValue">
                                                    {assignment?.travelClaim?.ratePerKilometer != null || timesheet.travelRate != null
                                                        ? money(assignment?.travelClaim?.ratePerKilometer ?? timesheet.travelRate)
                                                        : "-"}
                                                </span>
                                            </div>
                                            <div className="workHistoryDetailItem">
                                                <span className="workHistoryDetailLabel">Submitted at</span>
                                                <span className="workHistoryDetailValue">
                                                    {formatDateTime(assignment?.travelClaim?.submittedAt ?? null)}
                                                </span>
                                            </div>
                                            <div className="workHistoryDetailItem">
                                                <span className="workHistoryDetailLabel">Reviewed at</span>
                                                <span className="workHistoryDetailValue">
                                                    {formatDateTime(assignment?.travelClaim?.reviewedAt ?? null)}
                                                </span>
                                            </div>
                                            <div className="workHistoryDetailItem">
                                                <span className="workHistoryDetailLabel">Claim amount</span>
                                                <span className="workHistoryDetailValue">
                                                    {money(assignment?.travelClaim?.totalAmount ?? timesheet.travelExpenses ?? 0)}
                                                </span>
                                            </div>
                                            <div className="workHistoryDetailItem">
                                                <span className="workHistoryDetailLabel">Review note</span>
                                                <span className="workHistoryDetailValue">
                                                    {assignment?.travelClaim?.rejectionNote ?? "-"}
                                                </span>
                                            </div>
                                        </div>
                                        {assignment?.travelClaim?.hasProof && timesheet.sourceScheduleEntryId ? (
                                            <div className="workHistoryDetailActions">
                                                <button type="button" className="button" onClick={() => void openProof()}>
                                                    View proof
                                                </button>
                                            </div>
                                        ) : null}
                                    </Card>
                                </div>
                            ) : null}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
