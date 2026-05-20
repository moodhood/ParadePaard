import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import PrimaryNav from "../components/PrimaryNav";
import PageBack from "../components/PageBack";
import Spinner from "../components/Spinner";
import Card from "../components/common/Card";
import { UserServices, type PayslipResponseDTO } from "../services/user-service/UserServices";
import { formatDate, formatDateTime } from "../utils/dateFormat";

import "../stylesheets/AdminDashboard.css";
import "../stylesheets/AdminLists.css";
import "../stylesheets/GeneralInfo.css";
import "../stylesheets/PayslipDetails.css";
import "../stylesheets/UserDashboard.css";
import "../stylesheets/WorkHistory.css";

const money = (n: number | null | undefined) =>
    new Intl.NumberFormat("nl-NL", { style: "currency", currency: "EUR" }).format(Number(n ?? 0));

const statusLabel = (value?: string | null) => {
    const normalized = (value ?? "").toUpperCase();
    if (normalized === "RELEASED") return "Released";
    if (normalized === "PENDING_REVIEW") return "Pending review";
    if (normalized === "PENDING_APPROVAL") return "Pending approval";
    if (normalized === "NEEDS_ATTENTION") return "Needs attention";
    if (normalized === "DISPUTED") return "Disputed";
    if (normalized === "APPROVED") return "Approved";
    return value ?? "-";
};

const statusTone = (value?: string | null) => (value ?? "UNKNOWN").toLowerCase().replace(/_/g, "-");

export default function PayslipDetails() {
    const { payslipId } = useParams<{ payslipId: string }>();

    const [payslip, setPayslip] = useState<PayslipResponseDTO | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [downloadError, setDownloadError] = useState<string | null>(null);
    const [downloading, setDownloading] = useState(false);

    const loadPayslip = useCallback(async () => {
        if (!payslipId) {
            setError("Missing payslip id.");
            setLoading(false);
            return;
        }
        try {
            setLoading(true);
            setError(null);
            const data = await UserServices.getPayslipById(payslipId);
            setPayslip(data);
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "Failed to load payslip.";
            setError(message);
        } finally {
            setLoading(false);
        }
    }, [payslipId]);

    useEffect(() => {
        void loadPayslip();
    }, [loadPayslip]);

    const totals = useMemo(() => {
        if (!payslip) return { gross: 0, net: 0 };
        const gross = Number(payslip.totalGrossAmount ?? 0);
        const deductions = Number(payslip.totalEmployeeDeductions ?? payslip.wageTaxWithheldAmount ?? payslip.wageTaxWithheldTest ?? 0);
        const travel = Number(payslip.travelExpenses ?? 0);
        const net = Number(payslip.totalNetAmount ?? (gross - deductions + travel));
        return { gross, deductions, net };
    }, [payslip]);

    const addressLine = useMemo(() => {
        if (!payslip) return "-";
        const line1 = [payslip.streetName, payslip.houseNumber, payslip.houseNumberSuffix]
            .filter(Boolean)
            .join(" ");
        const line2 = [payslip.postalCode, payslip.city].filter(Boolean).join(" ");
        return [line1, line2].filter(Boolean).join(", ") || "-";
    }, [payslip]);

    const downloadPayslipPdf = useCallback(async () => {
        if (!payslip) return;
        try {
            setDownloading(true);
            setDownloadError(null);
            const blob = await UserServices.getPayslipPdf(payslip.payslipId);
            const url = URL.createObjectURL(blob);
            try {
                const a = document.createElement("a");
                a.href = url;
                a.download = `payslip_${payslip.weekBasedYear}_W${payslip.weekNumber}.pdf`;
                a.rel = "noopener";
                document.body.appendChild(a);
                a.click();
                a.remove();
            } finally {
                URL.revokeObjectURL(url);
            }
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "Failed to download payslip.";
            setDownloadError(message);
        } finally {
            setDownloading(false);
        }
    }, [payslip]);

    const weekLabel = useMemo(() => {
        if (!payslip) return "-";
        return `${payslip.weekBasedYear ?? "-"} / Week ${payslip.weekNumber ?? "-"}`;
    }, [payslip]);

    const pageHeader = (
        <header className="pageHeader">
            <PageBack to="/payslips" />
            <h1 className="pageTitle">Payslip Overview</h1>
        </header>
    );

    if (!payslipId) {
        return (
            <>
            <Navbar />
            <div className="adminDashboardPage">
                <div className="pageShell">
                    <PrimaryNav />
                    <div className="pageShellContent">
                        {pageHeader}
                        <div className="adminDashboardCard">
                            <div className="workHistoryError">Missing payslip id.</div>
                        </div>
                        </div>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <Navbar />
            <div className="adminDashboardPage">
                <div className="pageShell">
                    <PrimaryNav />
                    <div className="pageShellContent">
                        {pageHeader}
                        <div className="adminDashboardCard">
                            <div className="pageActions">
                                <button
                                    className="button"
                                    onClick={() => void downloadPayslipPdf()}
                                    disabled={downloading}
                                >
                                    {downloading ? "Downloading..." : "Download PDF"}
                                </button>
                            </div>

                            {downloadError ? <div className="workHistoryError">{downloadError}</div> : null}

                            {loading ? (
                                <div className="workHistoryLoading">
                                    <Spinner text="Loading payslip" />
                                </div>
                            ) : error ? (
                                <div className="workHistoryError">{error}</div>
                            ) : payslip ? (
                                <div className="payslipDetailLayout payslipDetailLayout--list">
                                    <section className="payslipHero">
                                        <div className="payslipHeroIntro">
                                            <div className="payslipHeroEyebrow">Payslip summary</div>
                                            <h2 className="payslipHeroTitle">{payslip.name ?? "Employee payslip"}</h2>
                                            <p className="payslipHeroSubtitle">
                                                {payslip.functionName ?? "No function assigned"} for {weekLabel}. Issued on{" "}
                                                {formatDate(payslip.dateOfIssue)} and available to the employee on{" "}
                                                {formatDate(payslip.availableToUserAt)}.
                                            </p>
                                            <div className="payslipHeroMeta">
                                                <span
                                                    className={`payslipStatusBadge payslipStatusBadge--${statusTone(
                                                        payslip.status
                                                    )}`}
                                                >
                                                    {statusLabel(payslip.status)}
                                                </span>
                                                <span className="payslipStatusBadge">Payslip ID {payslip.payslipId}</span>
                                            </div>
                                        </div>
                                        <div className="payslipHeroMetrics">
                                            <div className="payslipHeroMetric">
                                                <span className="payslipHeroMetricLabel">Hours worked</span>
                                                <span className="payslipHeroMetricValue">
                                                    {Number(payslip.totalHoursWorked ?? 0).toFixed(2)} h
                                                </span>
                                            </div>
                                            <div className="payslipHeroMetric">
                                                <span className="payslipHeroMetricLabel">Gross pay</span>
                                                <span className="payslipHeroMetricValue">{money(totals.gross)}</span>
                                            </div>
                                            <div className="payslipHeroMetric">
                                                <span className="payslipHeroMetricLabel">Net pay</span>
                                                <span className="payslipHeroMetricValue">{money(totals.net)}</span>
                                            </div>
                                        </div>
                                    </section>

                                    <main className="payslipDetailGrid">
                                        <Card title="Overview" className="payslipDetailSection">
                                            <div className="payslipDetailList">
                                                <div className="listHeaderGrid gridPayslipDetailKV">
                                                    <div>Item</div>
                                                    <div>Value</div>
                                                </div>
                                                <div className="payslipDetailListBody">
                                                    <div className="listRowGrid gridPayslipDetailKV">
                                                        <div className="cellMain">Date of issue</div>
                                                        <div className="cellSub payslipDetailListValue">{formatDate(payslip.dateOfIssue)}</div>
                                                    </div>
                                                    <div className="listRowGrid gridPayslipDetailKV">
                                                        <div className="cellMain">Week</div>
                                                        <div className="cellSub payslipDetailListValue">{weekLabel}</div>
                                                    </div>
                                                    <div className="listRowGrid gridPayslipDetailKV">
                                                        <div className="cellMain">Available to user</div>
                                                        <div className="cellSub payslipDetailListValue">{formatDate(payslip.availableToUserAt)}</div>
                                                    </div>
                                                    <div className="listRowGrid gridPayslipDetailKV">
                                                        <div className="cellMain">Generated at</div>
                                                        <div className="cellSub payslipDetailListValue">{formatDateTime(payslip.generatedAt)}</div>
                                                    </div>
                                                    <div className="listRowGrid gridPayslipDetailKV">
                                                        <div className="cellMain">Status</div>
                                                        <div className="cellSub payslipDetailListValue">{statusLabel(payslip.status)}</div>
                                                    </div>
                                                    <div className="listRowGrid gridPayslipDetailKV">
                                                        <div className="cellMain">Payslip ID</div>
                                                        <div className="cellSub payslipDetailListValue">{payslip.payslipId}</div>
                                                    </div>
                                                </div>
                                            </div>
                                        </Card>

                                        <Card title="Pay details" className="payslipDetailSection">
                                            <div className="payslipDetailList">
                                                <div className="listHeaderGrid gridPayslipDetailKV">
                                                    <div>Item</div>
                                                    <div>Value</div>
                                                </div>
                                                <div className="payslipDetailListBody">
                                                    <div className="listRowGrid gridPayslipDetailKV">
                                                        <div className="cellMain">Function</div>
                                                        <div className="cellSub payslipDetailListValue">{payslip.functionName ?? "-"}</div>
                                                    </div>
                                                    <div className="listRowGrid gridPayslipDetailKV">
                                                        <div className="cellMain">Hourly wage</div>
                                                        <div className="cellSub payslipDetailListValue payslipDetailListValue--numeric">
                                                            {money(payslip.hourlyWage)}
                                                        </div>
                                                    </div>
                                                    <div className="listRowGrid gridPayslipDetailKV">
                                                        <div className="cellMain">Hours worked</div>
                                                        <div className="cellSub payslipDetailListValue payslipDetailListValue--numeric">
                                                            {Number(payslip.totalHoursWorked ?? 0).toFixed(2)} h
                                                        </div>
                                                    </div>
                                                    <div className="listRowGrid gridPayslipDetailKV">
                                                        <div className="cellMain">Loonheffing</div>
                                                        <div className="cellSub payslipDetailListValue payslipDetailListValue--numeric">
                                                            {money(payslip.wageTaxWithheldAmount ?? payslip.wageTaxWithheldTest)}
                                                        </div>
                                                    </div>
                                                    <div className="listRowGrid gridPayslipDetailKV">
                                                        <div className="cellMain">Total deductions</div>
                                                        <div className="cellSub payslipDetailListValue payslipDetailListValue--numeric">
                                                            {money(payslip.totalEmployeeDeductions)}
                                                        </div>
                                                    </div>
                                                    <div className="listRowGrid gridPayslipDetailKV">
                                                        <div className="cellMain">Travel expenses</div>
                                                        <div className="cellSub payslipDetailListValue payslipDetailListValue--numeric">
                                                            {money(payslip.travelExpenses)}
                                                        </div>
                                                    </div>
                                                    <div className="listRowGrid gridPayslipDetailKV payslipDetailListRow--accent">
                                                        <div className="cellMain">Gross total</div>
                                                        <div className="cellSub payslipDetailListValue payslipDetailListValue--numeric">
                                                            {money(totals.gross)}
                                                        </div>
                                                    </div>
                                                    <div className="listRowGrid gridPayslipDetailKV payslipDetailListRow--accent">
                                                        <div className="cellMain">Net total</div>
                                                        <div className="cellSub payslipDetailListValue payslipDetailListValue--numeric">
                                                            {money(totals.net)}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </Card>

                                        <Card title="Deductions" className="payslipDetailSection">
                                            <div className="payslipDetailList">
                                                <div className="listHeaderGrid gridPayslipDetailDeductions">
                                                    <div>Deduction</div>
                                                    <div>Category</div>
                                                    <div>Amount</div>
                                                </div>
                                                <div className="payslipDetailListBody">
                                                    {(payslip.deductionLines ?? []).length === 0 ? (
                                                        <div className="listEmpty">No deduction lines recorded for this payslip.</div>
                                                    ) : (
                                                        (payslip.deductionLines ?? []).map((line) => (
                                                            <div key={line.id} className="listRowGrid gridPayslipDetailDeductions">
                                                                <div className="cellMain">{line.label || line.code}</div>
                                                                <div className="cellSub payslipDetailListValue">{line.category || "OTHER"}</div>
                                                                <div className="cellSub payslipDetailListValue payslipDetailListValue--numeric">
                                                                    {money(line.calculatedAmount)}
                                                                </div>
                                                            </div>
                                                        ))
                                                    )}
                                                </div>
                                            </div>
                                        </Card>

                                        <Card
                                            title="Employee details"
                                            className="payslipDetailSection payslipDetailSection--wide"
                                        >
                                            <div className="payslipDetailList">
                                                <div className="listHeaderGrid gridPayslipDetailKV">
                                                    <div>Item</div>
                                                    <div>Value</div>
                                                </div>
                                                <div className="payslipDetailListBody">
                                                    <div className="listRowGrid gridPayslipDetailKV">
                                                        <div className="cellMain">Full name</div>
                                                        <div className="cellSub payslipDetailListValue">{payslip.name ?? "-"}</div>
                                                    </div>
                                                    <div className="listRowGrid gridPayslipDetailKV">
                                                        <div className="cellMain">User ID</div>
                                                        <div className="cellSub payslipDetailListValue">{payslip.userId}</div>
                                                    </div>
                                                    <div className="listRowGrid gridPayslipDetailKV">
                                                        <div className="cellMain">Date of birth</div>
                                                        <div className="cellSub payslipDetailListValue">{formatDate(payslip.dateOfBirth)}</div>
                                                    </div>
                                                    <div className="listRowGrid gridPayslipDetailKV">
                                                        <div className="cellMain">Start date</div>
                                                        <div className="cellSub payslipDetailListValue">{formatDate(payslip.startDate)}</div>
                                                    </div>
                                                    <div className="listRowGrid gridPayslipDetailKV">
                                                        <div className="cellMain">Address</div>
                                                        <div className="cellSub payslipDetailListValue payslipDetailListValue--wrap">
                                                            {addressLine}
                                                        </div>
                                                    </div>
                                                    <div className="listRowGrid gridPayslipDetailKV">
                                                        <div className="cellMain">Country</div>
                                                        <div className="cellSub payslipDetailListValue">{payslip.country ?? "-"}</div>
                                                    </div>
                                                </div>
                                            </div>
                                        </Card>
                                    </main>
                                </div>
                            ) : null}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
