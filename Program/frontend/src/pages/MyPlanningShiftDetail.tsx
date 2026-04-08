import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import PrimaryNav from "../components/PrimaryNav";
import Card from "../components/common/Card";
import Spinner from "../components/Spinner";
import { UserServices, type EmployeePlanningAssignmentDTO } from "../services/user-service/UserServices";
import { formatDate } from "../utils/dateFormat";

function money(value: number | null | undefined): string {
    return new Intl.NumberFormat("nl-NL", { style: "currency", currency: "EUR" }).format(Number(value ?? 0));
}

export default function MyPlanningShiftDetail() {
    const { scheduleEntryId } = useParams<{ scheduleEntryId: string }>();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const personalView = searchParams.get("view") === "personal";
    const [item, setItem] = useState<EmployeePlanningAssignmentDTO | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [kilometers, setKilometers] = useState("");
    const [file, setFile] = useState<File | null>(null);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (!scheduleEntryId) return;
        let cancelled = false;
        const load = async () => {
            try {
                setLoading(true);
                setError(null);
                const data = await UserServices.getMyPlanningAssignment(scheduleEntryId);
                if (!cancelled) {
                    setItem(data);
                    setKilometers(data.travelClaim?.kilometers != null ? String(data.travelClaim.kilometers) : "");
                }
            } catch (err: unknown) {
                if (!cancelled) setError(err instanceof Error ? err.message : "Failed to load shift");
            } finally {
                if (!cancelled) setLoading(false);
            }
        };
        void load();
        return () => {
            cancelled = true;
        };
    }, [scheduleEntryId]);

    const isPast = Boolean(item?.isPast);
    const canSubmitClaim = Boolean(item && isPast);
    const proofLabel = useMemo(() => {
        if (!item?.travelClaim?.hasProof) return "No proof uploaded";
        return "Proof uploaded";
    }, [item?.travelClaim?.hasProof]);

    const withPersonalView = (target: string) =>
        personalView ? `${target}${target.includes("?") ? "&" : "?"}view=personal` : target;

    const openProof = async () => {
        if (!scheduleEntryId) return;
        try {
            const blob = await UserServices.getTravelClaimProof(scheduleEntryId);
            const url = URL.createObjectURL(blob);
            window.open(url, "_blank", "noopener,noreferrer");
            setTimeout(() => URL.revokeObjectURL(url), 5000);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Failed to open proof");
        }
    };

    const submitClaim = async () => {
        if (!scheduleEntryId) return;
        const km = Number(kilometers);
        if (!Number.isFinite(km) || km < 0) {
            setError("Please enter a valid kilometer amount.");
            return;
        }
        try {
            setSubmitting(true);
            setError(null);
            const updated = await UserServices.submitTravelClaim(scheduleEntryId, { kilometers: km, file });
            setItem(updated);
            setFile(null);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Failed to submit travel claim");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <>
            <Navbar />
            <div className="pageShell">
                <PrimaryNav />
                <div className="pageShellContent">
                    <header className="pageHeader">
                        <button
                            type="button"
                            className="button"
                            onClick={() => navigate(withPersonalView(`/my-planning${searchParams.get("tab") === "past" ? "?tab=past" : ""}`))}
                        >
                            Back
                        </button>
                        <h1 className="pageTitle">Shift Detail</h1>
                    </header>
                    {loading ? (
                        <Spinner text="Loading shift detail" />
                    ) : error && !item ? (
                        <p className="errorText">{error}</p>
                    ) : item ? (
                        <div style={{ display: "grid", gap: 20 }}>
                            {error ? <p className="errorText">{error}</p> : null}
                            <Card title={item.eventName}>
                                <div className="generalInfoRows">
                                    <div className="generalInfoRow"><div className="generalInfoLabel">Date</div><div className="generalInfoValue">{formatDate(item.shiftDate)}</div></div>
                                    <div className="generalInfoRow"><div className="generalInfoLabel">Time</div><div className="generalInfoValue">{item.startTime.slice(11, 16)} - {item.endTime.slice(11, 16)}</div></div>
                                    <div className="generalInfoRow"><div className="generalInfoLabel">Shift</div><div className="generalInfoValue">{item.shiftName ?? item.functionName}</div></div>
                                    <div className="generalInfoRow"><div className="generalInfoLabel">Function</div><div className="generalInfoValue">{item.functionName}</div></div>
                                    <div className="generalInfoRow"><div className="generalInfoLabel">Location</div><div className="generalInfoValue">{item.shiftLocation ?? item.eventLocation ?? "-"}</div></div>
                                    <div className="generalInfoRow"><div className="generalInfoLabel">Break</div><div className="generalInfoValue">{item.breakMinutes ?? 0} min</div></div>
                                    <div className="generalInfoRow"><div className="generalInfoLabel">Timesheet</div><div className="generalInfoValue">{item.timesheetExported ? "Logged" : "Not logged yet"}</div></div>
                                    <div className="generalInfoRow"><div className="generalInfoLabel">Internal notes</div><div className="generalInfoValue">{item.internalDescription || "-"}</div></div>
                                    <div className="generalInfoRow"><div className="generalInfoLabel">External notes</div><div className="generalInfoValue">{item.externalDescription || "-"}</div></div>
                                </div>
                            </Card>

                            <Card title="Travel claim">
                                {!canSubmitClaim ? (
                                    <p className="helperText">Travel claims become available after the shift has ended.</p>
                                ) : (
                                    <div style={{ display: "grid", gap: 12 }}>
                                        <label className="settingsField">
                                            <div className="settingsLabelRow">
                                                <span className="settingsLabel">Kilometers traveled</span>
                                                <span className="settingsMeta">Rate: €0.23/km</span>
                                            </div>
                                            <input
                                                className="settingsInput"
                                                type="number"
                                                min="0"
                                                step="0.1"
                                                value={kilometers}
                                                onChange={(event) => setKilometers(event.target.value)}
                                            />
                                        </label>
                                        <label className="settingsField">
                                            <div className="settingsLabelRow">
                                                <span className="settingsLabel">Proof image</span>
                                                <span className="settingsMeta">{proofLabel}</span>
                                            </div>
                                            <input type="file" accept="image/*" onChange={(event) => setFile(event.target.files?.[0] ?? null)} />
                                        </label>
                                        <div className="generalInfoRow">
                                            <div className="generalInfoLabel">Claim status</div>
                                            <div className="generalInfoValue">{item.travelClaim?.status ?? "Not submitted"}</div>
                                        </div>
                                        <div className="generalInfoRow">
                                            <div className="generalInfoLabel">Calculated amount</div>
                                            <div className="generalInfoValue">{money(item.travelClaim?.totalAmount ?? (Number(kilometers || 0) * 0.23))}</div>
                                        </div>
                                        {item.travelClaim?.rejectionNote ? (
                                            <div className="generalInfoRow">
                                                <div className="generalInfoLabel">Review note</div>
                                                <div className="generalInfoValue">{item.travelClaim.rejectionNote}</div>
                                            </div>
                                        ) : null}
                                        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                                            <button type="button" className="button settingsAction" disabled={submitting} onClick={() => void submitClaim()}>
                                                {submitting ? "Submitting..." : "Submit travel claim"}
                                            </button>
                                            {item.travelClaim?.hasProof ? (
                                                <button type="button" className="button" onClick={() => void openProof()}>
                                                    View proof
                                                </button>
                                            ) : null}
                                        </div>
                                    </div>
                                )}
                            </Card>
                        </div>
                    ) : null}
                </div>
            </div>
        </>
    );
}
