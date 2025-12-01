import { useEffect, useMemo, useState } from "react";
import axios from "axios";

type LeaveType = "VACATION" | "SICK" | "UNPAID" | "PARENTAL" | "OTHER";
type LeaveStatus = "PENDING" | "APPROVED" | "REJECTED" | "CANCELED";

type LeaveRequestCreateDTO = {
    type: LeaveType;
    startDate: string;
    endDate: string;
    hours: number;
    reason?: string;
};

type LeaveRequestDTO = {
    requestId: string;
    userId: string;
    userName: string;
    type: LeaveType;
    startDate: string;
    endDate: string;
    hours: number;
    reason: string | null;
    status: LeaveStatus;
    createdAt: string;
    updatedAt: string;
};

type Props = {
    onSuccess?: (created: LeaveRequestDTO) => void;
};

export default function CreateLeaveRequestPanel({ onSuccess }: Props) {
    const API_BASE_URL = useMemo(() => {
        // same pattern as your other services
        return (import.meta as any)?.env?.VITE_API_BASE_URL || "http://localhost:4004";
    }, []);

    const [meLoading, setMeLoading] = useState(true);
    const [meError, setMeError] = useState<string | null>(null);
    const [userId, setUserId] = useState<string | null>(null);

    const [type, setType] = useState<LeaveType>("VACATION");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [hours, setHours] = useState<number>(8);
    const [reason, setReason] = useState("");

    const [submitting, setSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [submitOk, setSubmitOk] = useState<string | null>(null);

    useEffect(() => {
        let ignore = false;
        async function fetchMe() {
            setMeLoading(true);
            setMeError(null);
            try {
                const res = await axios.get<{ userId: string }>(`${API_BASE_URL}/api/users/me`, {
                    withCredentials: true,
                    headers: { "Content-Type": "application/json" },
                });
                if (!ignore) setUserId(res.data?.userId || null);
            } catch (e: any) {
                if (!ignore) setMeError(e?.response?.data?.message || "Failed to load current user");
            } finally {
                if (!ignore) setMeLoading(false);
            }
        }
        fetchMe();
        return () => {
            ignore = true;
        };
    }, [API_BASE_URL]);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!userId) {
            setSubmitError("No user id available");
            return;
        }
        if (!startDate || !endDate) {
            setSubmitError("Please fill the dates");
            return;
        }
        if (!hours || hours <= 0) {
            setSubmitError("Hours must be positive");
            return;
        }
        setSubmitting(true);
        setSubmitError(null);
        setSubmitOk(null);
        const payload: LeaveRequestCreateDTO = {
            type,
            startDate,
            endDate,
            hours,
            reason: reason || undefined,
        };
        try {
            const res = await axios.post<LeaveRequestDTO>(
                `${API_BASE_URL}/api/users/${userId}/leave-requests`,
                payload,
                {
                    withCredentials: true,
                    headers: { "Content-Type": "application/json" },
                }
            );
            if (res.status !== 200 && res.status !== 201) {
                throw new Error("Create failed with status " + res.status);
            }
            setSubmitOk("Leave request created");
            setReason("");
            setHours(8);
            // keep dates and type as is so users can submit adjacent dates quickly
            onSuccess?.(res.data);
        } catch (e: any) {
            setSubmitError(e?.response?.data?.message || e?.message || "Create failed");
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <div className="rounded-2xl p-4 shadow">
            <h2 className="text-lg font-semibold mb-3">Create leave request</h2>

            {meLoading && <p>Loading your account…</p>}
            {meError && <p className="text-red-600">{meError}</p>}
            {!meLoading && !meError && (
                <form onSubmit={handleSubmit} className="grid gap-3 max-w-xl">
                    <label className="grid gap-1">
                        <span>Type</span>
                        <select
                            value={type}
                            onChange={(e) => setType(e.target.value as LeaveType)}
                            className="border rounded p-2"
                        >
                            <option value="VACATION">Vacation</option>
                            <option value="SICK">Sick</option>
                            <option value="UNPAID">Unpaid</option>
                            <option value="PARENTAL">Parental</option>
                            <option value="OTHER">Other</option>
                        </select>
                    </label>

                    <div className="grid grid-cols-2 gap-3">
                        <label className="grid gap-1">
                            <span>Start date</span>
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="border rounded p-2"
                                required
                            />
                        </label>
                        <label className="grid gap-1">
                            <span>End date</span>
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="border rounded p-2"
                                required
                            />
                        </label>
                    </div>

                    <label className="grid gap-1">
                        <span>Total hours</span>
                        <input
                            type="number"
                            min={1}
                            value={hours}
                            onChange={(e) => setHours(Number(e.target.value))}
                            className="border rounded p-2"
                            required
                        />
                    </label>

                    <label className="grid gap-1">
                        <span>Reason optional</span>
                        <textarea
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            className="border rounded p-2"
                            rows={3}
                            placeholder="Short note for your manager"
                        />
                    </label>

                    {submitError && <p className="text-red-600">{submitError}</p>}
                    {submitOk && <p className="text-green-700">{submitOk}</p>}

                    <div>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="px-4 py-2 rounded bg-black text-white disabled:opacity-50"
                        >
                            {submitting ? "Sending…" : "Submit request"}
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
}
