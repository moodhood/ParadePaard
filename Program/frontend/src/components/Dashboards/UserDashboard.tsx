// UserDashboard.tsx
import React, { type JSX, useEffect, useState } from "react";
import "../../stylesheets/app_base.css";
import "../../stylesheets/app_lists.css";
import "../../stylesheets/app_calendar.css";
import "../../stylesheets/app_modal.css";
import "../../stylesheets/app_forms.css";

import Navbar from "../Navbar.tsx";
import LeaveRequestModal, {type LeaveRequestForm } from "../requests/LeaveRequestModals.tsx";

type CardProps = { title: string; children?: React.ReactNode; className?: string };
type StatProps = { label: string; value: string | number };

type PayslipRowProps = {
    period: string;
    payday: string;
    net: string;
    status: "Paid" | "Processing" | "On hold";
};

export default function UserDashboard(): JSX.Element {
    const [ready, setReady] = useState(false);
    const [showLeave, setShowLeave] = useState(false);

    useEffect(() => setReady(true), []);

    const payslips: PayslipRowProps[] = [
        { period: "Oct 2025", payday: "Oct 30 2025", net: "$2,450.20", status: "Paid" },
        { period: "Sep 2025", payday: "Sep 30 2025", net: "$2,401.10", status: "Paid" },
        { period: "Aug 2025", payday: "Aug 30 2025", net: "$2,398.75", status: "Paid" },
        { period: "Jul 2025", payday: "Jul 30 2025", net: "$2,412.60", status: "Paid" },
    ];

    const leaveAvailable = 56;
    const leavePending = 8;
    const leaveUsed = 96;

    return (
        <div className="page">
            <Navbar />

            <header className="page_header">
                <h1>User Dashboard</h1>
                <p className="subtitle">Your payroll and leave in one place</p>
            </header>

            <main className="dashboard_outer">
                <div className="dashboard_card">
                    <div className="dashboard_inner">
                        {/* row one */}
                        <section className="row_main">
                            <Card title="Payslips" className="requests_card">
                                <ul className="list wide_cols scroll_area">
                                    <PayslipHeaderRow />
                                    {payslips.map((p) => (
                                        <PayslipRow
                                            key={p.period}
                                            period={p.period}
                                            payday={p.payday}
                                            net={p.net}
                                            status={p.status}
                                        />
                                    ))}
                                </ul>

                                <div className="actions_row">
                                    <button className="btn btn_secondary">View older</button>
                                </div>
                            </Card>

                            <Card title="Leave">
                                <div className="stats_col">
                                    <Stat label="Hours left" value={leaveAvailable} />
                                    <Stat label="Pending" value={leavePending} />
                                    <Stat label="Used this year" value={leaveUsed} />
                                </div>

                                <div className="actions_row">
                                    <button className="btn" onClick={() => setShowLeave(true)}>Request leave</button>
                                </div>
                            </Card>
                        </section>

                        {/* row two */}
                        <section className="row_secondary">
                            <Card title="Quick actions" className="errors_card">
                                <div className="stats_col">
                                    <ActionButton label="Appeal a payslip" onClick={() => alert("Open payslip appeal form")} />
                                    <ActionButton label="Update bank info" onClick={() => alert("Open bank info form")} />
                                    <ActionButton label="View tax forms" onClick={() => alert("Open tax forms")} />
                                </div>
                            </Card>

                            <Card title="Messages" className="contracts_card">
                                <ul className="list narrow_cols scroll_area">
                                    <li className="list_row">
                                        <span className="row_name">Next payday</span>
                                        <time className="row_mid">Oct 30</time>
                                        <time className="row_when">in 2 days</time>
                                    </li>
                                    <li className="list_row">
                                        <span className="row_name">Reminder bank info</span>
                                        <span className="row_mid">Check routing</span>
                                        <time className="row_when">today</time>
                                    </li>
                                    <li className="list_row">
                                        <span className="row_name">Holiday notice</span>
                                        <span className="row_mid">Nov 27</span>
                                        <time className="row_when">closed</time>
                                    </li>
                                </ul>
                            </Card>
                        </section>

                        {/* row three */}
                        <section className="row_misc">
                            <Card title="Dates" className="dates_card">
                                <div className="calendar_stub scroll_area_small">
                                    <div className="month_head">October 2025</div>
                                    <div className="date_grid">
                                        {[...Array(14)].map((_, i) => (
                                            <div
                                                key={i}
                                                className={i === 4 || i === 10 ? "date_cell highlight" : "date_cell"}
                                            >
                                                {i + 15}
                                            </div>
                                        ))}
                                    </div>
                                    <div className="legend">
                                        <span className="dot" /> payday
                                    </div>
                                </div>

                                <div className="actions_row">
                                    <button className="btn btn_secondary">Open calendar</button>
                                </div>
                            </Card>

                            <Card title="Help" className="payout_card">
                                <ul className="list narrow_cols scroll_area">
                                    <li className="list_row">
                                        <span className="row_name">How to read my payslip</span>
                                        <span className="row_mid">Guide</span>
                                        <time className="row_when">5 min</time>
                                    </li>
                                    <li className="list_row">
                                        <span className="row_name">Leave policy</span>
                                        <span className="row_mid">Summary</span>
                                        <time className="row_when">3 min</time>
                                    </li>
                                </ul>
                            </Card>
                        </section>
                    </div>
                </div>
            </main>

            <LeaveRequestModal
                open={showLeave}
                onClose={() => setShowLeave(false)}
                availableHours={leaveAvailable}
                onSubmit={(data: LeaveRequestForm) => {
                    alert(
                        `Leave request\nFrom ${data.fromDate} to ${data.toDate}\nTotal ${data.totalHours} hours`
                    );
                }}
            />
        </div>
    );
}

function Card({ title, children, className }: CardProps): JSX.Element {
    return (
        <article className={`card ${className ?? ""}`}>
            <div className="card_head">
                <h2>{title}</h2>
            </div>
            <div className="card_body">{children}</div>
        </article>
    );
}

function Stat({ label, value }: StatProps): JSX.Element {
    return (
        <div className="stat">
            <span className="stat_label">{label}</span>
            <span className="stat_value">{value}</span>
        </div>
    );
}

function ActionButton({ label, onClick }: { label: string; onClick: () => void }) {
    return (
        <button className="btn btn_secondary" onClick={onClick} style={{ justifyContent: "space-between" }}>
            {label}
        </button>
    );
}

function PayslipHeaderRow(): JSX.Element {
    return (
        <li className="list_row list_row_header">
            <span className="row_name">Period</span>
            <span className="row_type">Net pay</span>
            <span className="row_when">Payday</span>
        </li>
    );
}

function PayslipRow({ period, payday, net }: PayslipRowProps): JSX.Element {
    return (
        <li className="list_row">
            <span className="row_name">{period}</span>

            <span className="row_type" style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
        {net}
                <button
                    className="btn btn_secondary"
                    onClick={() => alert(`Open ${period} pdf`)}
                    style={{ padding: "6px 10px" }}
                >
          pdf
        </button>
      </span>

            <time className="row_when">{payday}</time>
        </li>
    );
}
