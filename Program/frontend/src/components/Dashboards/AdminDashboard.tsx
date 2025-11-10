// src/components/Dashboards/AdminDashboard.tsx
import React, { type JSX, useEffect, useState, useCallback } from "react";
import "../../stylesheets/app_base.css";
import "../../stylesheets/app_lists.css";
import "../../stylesheets/app_calendar.css";
import "../../stylesheets/app_modal.css";
import "../../stylesheets/app_forms.css";

import Navbar from "../Navbar";

import {
    type AnyRequest,
    type LeaveRequest,
    type PayslipUpdateRequest,
    type NewMemberRequest,
    AdminLeaveRequestModal,
    PayslipUpdateRequestModal,
    NewMemberRequestModal,
} from "../requests/RequestModals";

import {LeaveRequests} from "../../services/user-service/LeaveRequests";
import { mapLeaves, type LeaveRequestDTO } from "../../utils/mapLeaveDtoToUi";

type CardProps = { title: string; children?: React.ReactNode; className?: string };
type StatProps = { label: string; value: string | number };

type RequestRowProps = { name: string; type: string; when: string; onClick?: () => void };
type ErrorRowProps = { name: string; issue: string; when: string };
type ContractRowProps = { name: string; end: string; daysLeft: string };
type PayoutRowProps = { name: string; when: string; daysLeft: string };

export default function AdminDashboard(): JSX.Element {
    const [items, setItems] = useState<AnyRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState<string | null>(null);
    const [open, setOpen] = useState<AnyRequest | null>(null);
    const [acting, setActing] = useState(false);
    const [version, setVersion] = useState(0);

    const reload = useCallback(async () => {
        try {
            setLoading(true);
            setErr(null);
            const dtos: LeaveRequestDTO[] = await LeaveRequests.list("PENDING");
            const mapped = mapLeaves(dtos) as unknown as AnyRequest[];
            setItems(mapped);
        } catch (e: any) {
            setErr(e?.message || "Failed to load requests");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        void reload();
    }, [version, reload]);

    const handleApprove = async (id: string) => {
        try {
            setActing(true);
            await LeaveRequests.approve(id);
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
            await LeaveRequests.reject(id, reason);
            setOpen(null);
            setVersion((v) => v + 1);
        } catch (e: any) {
            alert(e?.message || "Reject failed");
        } finally {
            setActing(false);
        }
    };

    return (
        <div className="page">
            <Navbar />

            <header className="page_header">
                <h1>Admin Dashboard</h1>
                <p className="subtitle">Payroll overview at a glance</p>
            </header>

            <main className="dashboard_outer">
                <div className="dashboard_card">
                    <div className="dashboard_inner">
                        <section className="row_main">
                            <Card title="Requests" className="requests_card">
                                <ul className="list wide_cols scroll_area">
                                    <RequestsHeaderRow />

                                    {loading && (
                                        <li className="list_row">
                                            <span className="row_name">Loading</span>
                                            <span className="row_type">Please wait</span>
                                            <time className="row_when">…</time>
                                        </li>
                                    )}

                                    {err && !loading && (
                                        <li className="list_row">
                                            <span className="row_name text_bad">{err}</span>
                                            <span className="row_type">Error</span>
                                            <time className="row_when">now</time>
                                        </li>
                                    )}

                                    {!loading &&
                                        !err &&
                                        items.map((req) => (
                                            <RequestRow
                                                key={req.id}
                                                name={(req as LeaveRequest).by}
                                                type={
                                                    req.type === "PayslipUpdate"
                                                        ? "Payslip update request"
                                                        : req.type === "NewMember"
                                                            ? "New member request"
                                                            : "Leave request"
                                                }
                                                when={(req as LeaveRequest).createdAt}
                                                onClick={() => setOpen(req)}
                                            />
                                        ))}

                                    {!loading && !err && items.length === 0 && (
                                        <li className="list_row">
                                            <span className="row_name">No pending requests</span>
                                            <span className="row_type">All clear</span>
                                            <time className="row_when">now</time>
                                        </li>
                                    )}
                                </ul>

                                <div className="actions_row">
                                    <button className="btn" onClick={() => setVersion((v) => v + 1)} disabled={loading}>
                                        Refresh
                                    </button>
                                    <button className="btn btn_secondary" onClick={() => alert("Open settings")}>
                                        Settings
                                    </button>
                                </div>
                            </Card>

                            <Card title="General Info">
                                <div className="stats_col">
                                    <Stat label="Total users" value="1,284" />
                                    <Stat label="Sick" value="42" />
                                    <Stat label="Leave" value={items.length} />
                                </div>
                            </Card>
                        </section>

                        <section className="row_secondary">
                            <Card title="Payslip Errors" className="errors_card">
                                <ul className="list wide_cols scroll_area">
                                    <PayslipHeaderRow />
                                    <ErrorRow name="J. Smith" issue="Missing bank info" when="Oct 28 2025 08:15" />
                                    <ErrorRow name="A. Garcia" issue="Tax id mismatch" when="Oct 28 2025 08:12" />
                                    <ErrorRow name="K. Tanaka" issue="Overtime flag" when="Oct 27 2025 17:05" />
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
                                </ul>

                                <div className="actions_row">
                                    <button className="btn btn_secondary">See details</button>
                                </div>
                            </Card>
                        </section>

                        <section className="row_misc">
                            <Card title="Dates" className="dates_card">
                                <div className="calendar_stub scroll_area_small">
                                    <div className="month_head">October 2025</div>
                                    <div className="date_grid">
                                        {[...Array(14)].map((_, i) => (
                                            <div key={i} className={i === 4 || i === 10 ? "date_cell highlight" : "date_cell"}>
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
                                </ul>

                                <div className="actions_row">
                                    <button className="btn">Open checklist</button>
                                </div>
                            </Card>
                        </section>
                    </div>
                </div>
            </main>

            {open?.type === "Leave" && (
                <AdminLeaveRequestModal
                    key={open.id}
                    open={true}
                    onClose={() => setOpen(null)}
                    data={open as LeaveRequest}
                    onApprove={handleApprove}
                    onReject={handleReject}
                />
            )}

            {open?.type === "PayslipUpdate" && (
                <PayslipUpdateRequestModal
                    key={open.id}
                    open={true}
                    onClose={() => setOpen(null)}
                    data={open as PayslipUpdateRequest}
                    onMarkFixed={() => alert("Marked fixed")}
                    onAskInfo={() => alert("Asked for more info")}
                />
            )}

            {open?.type === "NewMember" && (
                <NewMemberRequestModal
                    key={open.id}
                    open={true}
                    onClose={() => setOpen(null)}
                    data={open as NewMemberRequest}
                    onApprove={() => alert("Approved")}
                    onReject={() => alert("Rejected")}
                />
            )}

            {acting && (
                <div
                    aria-hidden
                    style={{
                        position: "fixed",
                        inset: 0,
                        background: "rgba(0,0,0,0.2)",
                        zIndex: 9999,
                    }}
                />
            )}
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

function RequestRow({ name, type, when, onClick }: RequestRowProps): JSX.Element {
    return (
        <li
            className="list_row"
            onClick={onClick}
            onKeyDown={(e) => e.key === "Enter" && onClick?.()}
            tabIndex={0}
            role="button"
            style={{ cursor: "pointer" }}
            aria-label={`Open ${type} from ${name}`}
        >
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
