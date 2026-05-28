import { useEffect, useState } from "react";
import { Link, useOutletContext } from "react-router-dom";
import Card from "../components/common/Card";
import { UserServices, type ContractResponseDTO } from "../services/user-service/UserServices";
import type { AccountOutletContext } from "./Account";

const moneyFormatter = new Intl.NumberFormat("nl-NL", { style: "currency", currency: "EUR" });

export default function AccountEmploymentDetails() {
    const {
        user,
        formatValue,
        formatPosition,
    } = useOutletContext<AccountOutletContext>();
    const [currentContract, setCurrentContract] = useState<ContractResponseDTO | null>(null);
    const [contracts, setContracts] = useState<ContractResponseDTO[]>([]);
    const [contractLoading, setContractLoading] = useState(true);
    const [contractError, setContractError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;
        setContractLoading(true);
        setContractError(null);
        Promise.all([UserServices.getCurrentContract(), UserServices.getMyContracts()])
            .then(([contract, history]) => {
                if (cancelled) return;
                setCurrentContract(contract);
                setContracts(history ?? []);
            })
            .catch((err: unknown) => {
                if (cancelled) return;
                const message = err instanceof Error ? err.message : "Failed to load contract.";
                setContractError(message);
            })
            .finally(() => {
                if (!cancelled) setContractLoading(false);
            });
        return () => {
            cancelled = true;
        };
    }, []);

    const downloadContract = async () => {
        if (!currentContract) return;
        try {
            const blob = await UserServices.getContractPdf(currentContract.contractId);
            const url = URL.createObjectURL(blob);
            try {
                const a = document.createElement("a");
                a.href = url;
                a.download = `contract_${currentContract.contractId}.pdf`;
                a.rel = "noopener";
                document.body.appendChild(a);
                a.click();
                a.remove();
            } finally {
                URL.revokeObjectURL(url);
            }
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "Failed to download contract.";
            setContractError(message);
        }
    };

    const canSign = currentContract?.status === "SENT_TO_EMPLOYEE" || currentContract?.status === "REJECTED";

    return (
        <Card title="Employment details">
            <div className="generalInfoRows">
                <div className="profile_info_row">
                    <span className="profile_info_label">Position</span>
                    <span className="profile_info_value">
                        {currentContract?.functionName ?? formatPosition(user.position)}
                    </span>
                </div>
                <div className="profile_info_row">
                    <span className="profile_info_label">Gross hourly wage</span>
                    <span className="profile_info_value">
                        {currentContract?.grossHourlyWage != null
                            ? moneyFormatter.format(Number(currentContract.grossHourlyWage))
                            : contractLoading
                                ? "Loading..."
                                : "-"}
                    </span>
                </div>
                <div className="profile_info_row">
                    <span className="profile_info_label">Contract start</span>
                    <span className="profile_info_value">{formatValue(currentContract?.startDate)}</span>
                </div>
                <div className="profile_info_row">
                    <span className="profile_info_label">Contract end</span>
                    <span className="profile_info_value">
                        {currentContract ? (currentContract.endDate ? formatValue(currentContract.endDate) : "Open-ended") : "-"}
                    </span>
                </div>
                <div className="profile_info_row">
                    <span className="profile_info_label">Holiday allowance</span>
                    <span className="profile_info_value">
                        {currentContract?.holidayAllowancePercentage != null
                            ? `${currentContract.holidayAllowancePercentage}%`
                            : "-"}
                    </span>
                </div>
                <div className="profile_info_row">
                    <span className="profile_info_label">Payment frequency</span>
                    <span className="profile_info_value">{formatFrequency(currentContract?.paymentFrequency)}</span>
                </div>
                <div className="profile_info_row">
                    <span className="profile_info_label">Worked For Us Before</span>
                    <span className="profile_info_value">{formatValue(user.workedForUsBefore)}</span>
                </div>
                <div className="profile_info_row">
                    <span className="profile_info_label">Profile status</span>
                    <span className="profile_info_value">{formatValue(user.status)}</span>
                </div>
                <div className="profile_info_row">
                    <span className="profile_info_label">Contract status</span>
                    <span className="profile_info_value">{formatValue(currentContract?.status)}</span>
                </div>
                {currentContract?.reviewComment ? (
                    <div className="profile_info_row">
                        <span className="profile_info_label">Contract note</span>
                        <span className="profile_info_value">{currentContract.reviewComment}</span>
                    </div>
                ) : null}
                <div className="profile_info_row">
                    <span className="profile_info_label">Contract PDF</span>
                    <span className="profile_info_value contractActions">
                        <button
                            className="button buttonSecondary"
                            type="button"
                            onClick={() => void downloadContract()}
                            disabled={!currentContract}
                        >
                            Download
                        </button>
                        {canSign && currentContract ? (
                            <Link
                                className="button"
                                to={`/contracts/${currentContract.contractId}/sign`}
                            >
                                Review and sign contract
                            </Link>
                        ) : null}
                    </span>
                </div>
            </div>
            <div className="contractHistory">
                <h3>Contract history</h3>
                {contracts.length === 0 ? <p className="helperText">No contracts found.</p> : null}
                {contracts.map((contract) => (
                    <div className="contractHistoryRow" key={contract.contractId}>
                        <span>
                            {formatValue(contract.startDate)} - {contract.endDate ? formatValue(contract.endDate) : "Open-ended"}
                        </span>
                        <span>{formatFrequency(contract.paymentFrequency)}</span>
                        <span>{formatValue(contract.status)}</span>
                    </div>
                ))}
            </div>
            {contractError ? <p className="errorText">{contractError}</p> : null}
        </Card>
    );
}

function formatFrequency(value?: string | null): string {
    switch (value) {
        case "DAILY":
            return "Daily";
        case "WEEKLY":
            return "Weekly";
        case "BIWEEKLY":
            return "Biweekly";
        case "MONTHLY":
            return "Monthly";
        case "EVERY_5_MINUTES":
            return "Test only";
        case "EVERY_10_MINUTES":
            return "10 minutes (testing)";
        default:
            return value ?? "-";
    }
}
