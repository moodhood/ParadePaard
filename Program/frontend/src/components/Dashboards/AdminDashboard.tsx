// AdminDashboard.tsx
import React, { type JSX, useEffect, useState } from "react";
import "../../stylesheets/AdminDashboard.css";

type CardProps = {
    title: string;
    children?: React.ReactNode;
    className?: string;
};

type StatProps = { label: string; value: string | number };

type RequestRowProps = { name: string; type: string; when: string };
type ErrorRowProps = { name: string; issue: string; when: string };
type ContractRowProps = { name: string; end: string; daysLeft: string };
type PayoutRowProps = { name: string; when: string; daysLeft: string };

export default function AdminDashboard(): JSX.Element {
    const [ready, setReady] = useState(false);
    useEffect(() => setReady(true), []);

    return (
        <div className="page">
            <header className="page_header">
                <h1>Admin Dashboard</h1>
                <p className="subtitle">Payroll overview at a glance</p>
            </header>

            <main className="dashboard_outer">
                <div className="dashboard_card">
                    <div className="dashboard_inner">
                        {/* row one */}
                        <section className="row_main">
                            <Card title="Requests" className="requests_card">
                                <ul className="list wide_cols scroll_area">
                                    <RequestsHeaderRow />
                                    <RequestRow name="J. Smith" type="Leave request" when="Oct 28 09:40" />
                                    <RequestRow name="A. Garcia" type="New member request" when="Oct 28 11:10" />
                                    <RequestRow name="K. Tanaka" type="Payslip update request" when="Oct 27 16:25" />
                                    <RequestRow name="M. Diallo" type="Leave request" when="Oct 27 10:05" />
                                    <RequestRow name="P. Novak" type="New member request" when="Oct 26 14:18" />
                                </ul>

                                <div className="actions_row">
                                    <button className="btn">View all</button>
                                    <button className="btn btn_secondary">Settings</button>
                                </div>
                            </Card>

                            <Card title="General Info">
                                <div className="stats_col">
                                    <Stat label="Total users" value="1,284" />
                                    <Stat label="Sick" value="42" />
                                    <Stat label="Leave" value="4" />
                                </div>
                            </Card>
                        </section>

                        {/* row two */}
                        <section className="row_secondary">
                            <Card title="Payslip Errors" className="errors_card">
                                <ul className="list wide_cols scroll_area">
                                    <PayslipHeaderRow />
                                    <ErrorRow name="J. Smith" issue="Missing bank info" when="Oct 28 08:15" />
                                    <ErrorRow name="A. Garcia" issue="Tax id mismatch" when="Oct 28 08:12" />
                                    <ErrorRow name="K. Tanaka" issue="Overtime flag" when="Oct 27 17:05" />
                                    <ErrorRow name="M. Diallo" issue="Missing bank info" when="Oct 27 09:50" />
                                    <ErrorRow name="P. Novak" issue="Tax id mismatch" when="Oct 26 12:33" />
                                    <ErrorRow name="S. Lee" issue="Overtime flag" when="Oct 26 11:20" />
                                    <ErrorRow name="R. Cohen" issue="Overtime flag" when="Oct 26 10:55" />
                                </ul>

                                <div className="actions_row">
                                    <button className="btn">Review errors</button>
                                </div>
                            </Card>

                            <Card title="Contract End" className="contracts_card">
                                <ul className="list narrow_cols scroll_area">
                                    <ContractHeaderRow />
                                    <ContractRow name="J. Smith" end="Oct 29" daysLeft="1 day" />
                                    <ContractRow name="A. Garcia" end="Nov 2" daysLeft="5 days" />
                                    <ContractRow name="K. Tanaka" end="Nov 10" daysLeft="13 days" />
                                    <ContractRow name="M. Diallo" end="Nov 12" daysLeft="15 days" />
                                </ul>

                                <div className="actions_row">
                                    <button className="btn btn_secondary">See details</button>
                                </div>
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
                                                className={
                                                    i === 4 || i === 10
                                                        ? "date_cell highlight"
                                                        : "date_cell"
                                                }
                                            >
                                                {i + 15}
                                            </div>
                                        ))}
                                    </div>
                                    <div className="legend">
                                        <span className="dot" /> run day
                                    </div>
                                </div>

                                <div className="actions_row">
                                    <button className="btn btn_secondary">View calendar</button>
                                </div>
                            </Card>

                            <Card title="Payslip Check" className="payout_card">
                                <ul className="list narrow_cols scroll_area">
                                    <PayoutHeaderRow />
                                    <PayoutRow name="J. Smith" when="Oct 30" daysLeft="2 days" />
                                    <PayoutRow name="A. Garcia" when="Oct 30" daysLeft="2 days" />
                                    <PayoutRow name="K. Tanaka" when="Oct 30" daysLeft="2 days" />
                                    <PayoutRow name="M. Diallo" when="Oct 30" daysLeft="2 days" />
                                </ul>

                                <div className="actions_row">
                                    <button className="btn">Open checklist</button>
                                </div>
                            </Card>
                        </section>
                    </div>
                </div>
            </main>
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

/* header rows */
function RequestsHeaderRow(): JSX.Element {
    return (
        <li className="list_row list_row_header">
            <span className="row_name">Name</span>
            <span className="row_type">Request type</span>
            <span className="row_when">Date</span>
        </li>
    );
}

function PayslipHeaderRow(): JSX.Element {
    return (
        <li className="list_row list_row_header">
            <span className="row_name">Name</span>
            <span className="row_type">Error type</span>
            <span className="row_when">Date</span>
        </li>
    );
}

function ContractHeaderRow(): JSX.Element {
    return (
        <li className="list_row list_row_header">
            <span className="row_name">Name</span>
            <span className="row_mid">End date</span>
            <span className="row_when">Days left</span>
        </li>
    );
}

function PayoutHeaderRow(): JSX.Element {
    return (
        <li className="list_row list_row_header">
            <span className="row_name">Name</span>
            <span className="row_mid">Payout date</span>
            <span className="row_when">Days left</span>
        </li>
    );
}

/* data rows */
function RequestRow({ name, type, when }: RequestRowProps): JSX.Element {
    return (
        <li className="list_row">
            <span className="row_name">{name}</span>
            <span className="row_type">{type}</span>
            <time className="row_when">{when}</time>
        </li>
    );
}

function ErrorRow({ name, issue, when }: ErrorRowProps): JSX.Element {
    return (
        <li className="list_row">
            <span className="row_name">{name}</span>
            <span className="row_type">{issue}</span>
            <time className="row_when">{when}</time>
        </li>
    );
}

function ContractRow({ name, end, daysLeft }: ContractRowProps): JSX.Element {
    return (
        <li className="list_row">
            <span className="row_name">{name}</span>
            <time className="row_mid">{end}</time>
            <time className="row_when">{daysLeft}</time>
        </li>
    );
}

function PayoutRow({ name, when, daysLeft }: PayoutRowProps): JSX.Element {
    return (
        <li className="list_row">
            <span className="row_name">{name}</span>
            <time className="row_mid">{when}</time>
            <time className="row_when">{daysLeft}</time>
        </li>
    );
}
