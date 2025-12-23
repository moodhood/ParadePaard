// src/components/requests/LeaveRequestModal.tsx
import { useMemo, useState } from "react";
import Modal from "../common/Modal";
import type { LeaveType } from "../../services/user-service/types";

export type LeaveRequestForm = {
    type: LeaveType;
    fromDate: string;
    toDate: string;
    hoursPerDay: number;
    excludeWeekends: boolean;
    note?: string;
    totalHours: number;
};

type Props = {
    open: boolean;
    onClose: () => void;
    availableHours: number;
    defaultType?: LeaveType;
    onSubmit?: (data: LeaveRequestForm) => void;
};

export default function LeaveRequestModal({
                                              open,
                                              onClose,
                                              availableHours,
                                              defaultType = "VACATION",
                                              onSubmit,
                                          }: Props) {
    const [leaveType, setLeaveType] = useState<LeaveType>(defaultType);
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");
    const [hoursPerDay, setHoursPerDay] = useState<number>(8);
    const [excludeWeekends, setExcludeWeekends] = useState(true);
    const [note, setNote] = useState("");

    const totalHours = useMemo(() => {
        if (!fromDate || !toDate || hoursPerDay <= 0) return 0;
        const d1 = new Date(fromDate);
        const d2 = new Date(toDate);
        if (isNaN(d1.getTime()) || isNaN(d2.getTime())) return 0;
        if (d2 < d1) return 0;

        let days = 0;
        const cur = new Date(d1);
        while (cur <= d2) {
            const day = cur.getDay();
            const isWeekend = day === 0 || day === 6;
            if (!excludeWeekends || !isWeekend) days += 1;
            cur.setDate(cur.getDate() + 1);
        }
        return days * hoursPerDay;
    }, [fromDate, toDate, hoursPerDay, excludeWeekends]);

    const remaining = availableHours - totalHours;
    const canSubmit = !!fromDate && !!toDate && totalHours > 0;

    function handleSubmit() {
        if (!canSubmit) return;
        const payload: LeaveRequestForm = {
            type: leaveType,
            fromDate,
            toDate,
            hoursPerDay,
            excludeWeekends,
            note: note.trim() || undefined,
            totalHours,
        };
        onSubmit?.(payload);
        onClose();
    }

    return (
        <Modal open={open} onClose={onClose} title="Request leave">
            <div className="form_grid">
                <div className="form_row">
                    <label className="form_label">Type</label>
                    <select
                        className="modal_input"
                        value={leaveType}
                        onChange={(e) => setLeaveType(e.target.value as LeaveType)}
                    >
                        <option value="VACATION">Vacation</option>
                        <option value="SICK">Sick</option>
                        <option value="UNPAID">Unpaid</option>
                        <option value="PARENTAL">Parental</option>
                        <option value="PERSONAL">Personal</option>
                        <option value="OTHER">Other</option>
                    </select>
                </div>

                <div className="form_row">
                    <label className="form_label">From date</label>
                    <input
                        type="date"
                        className="modal_input"
                        value={fromDate}
                        onChange={(e) => setFromDate(e.target.value)}
                    />
                </div>

                <div className="form_row">
                    <label className="form_label">To date</label>
                    <input
                        type="date"
                        className="modal_input"
                        value={toDate}
                        onChange={(e) => setToDate(e.target.value)}
                    />
                </div>

                <div className="form_row">
                    <label className="form_label">Hours per day</label>
                    <input
                        type="number"
                        min={1}
                        step={0.5}
                        className="modal_input"
                        value={hoursPerDay}
                        onChange={(e) => setHoursPerDay(Number(e.target.value))}
                    />
                </div>

                <div className="form_row">
                    <label className="form_label">Skip weekends</label>
                    <label className="switch_row">
                        <input
                            type="checkbox"
                            checked={excludeWeekends}
                            onChange={(e) => setExcludeWeekends(e.target.checked)}
                        />
                        <span>Yes</span>
                    </label>
                </div>

                <div className="form_row form_row_full">
                    <label className="form_label">Note</label>
                    <textarea
                        rows={3}
                        className="modal_input"
                        placeholder="Optional message"
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                    />
                </div>
            </div>

            <div className="section_block">
                <h4 className="section_title">Summary</h4>
                <div className="grid_two">
                    <div className="info_item">
                        <div className="info_label">Total hours</div>
                        <div className="info_value">{totalHours}</div>
                    </div>
                    <div className="info_item">
                        <div className="info_label">Hours available now</div>
                        <div className="info_value">{availableHours}</div>
                    </div>
                    <div className="info_item">
                        <div className="info_label">Hours left if approved</div>
                        <div className={`info_value ${remaining < 0 ? "text_bad" : "text_ok"}`}>
                            {remaining}
                        </div>
                    </div>
                </div>
            </div>

            <div className="actions_row">
                <button className="btn" onClick={handleSubmit} disabled={!canSubmit}>
                    Submit request
                </button>
                <button className="btn btn_secondary" onClick={onClose}>
                    Cancel
                </button>
            </div>
        </Modal>
    );
}