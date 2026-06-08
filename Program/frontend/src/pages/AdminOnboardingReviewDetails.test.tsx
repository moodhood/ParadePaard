import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import {
    applyEmployeeTaxProfileDefaults,
    createAndSendOnboardingContract,
    saveEmployerSignatureForContract,
    getContractDraftActionLabel,
    getPayrollPeriodOptionsForContractType,
    normalizeContractDraftForContractType,
    ReviewContractDownloadAction,
    saveOnboardingReviewContractDraft,
    validateEmployerPreSignRequirements,
} from "./AdminOnboardingReviewDetails";
import type { ContractResponseDTO, CreateContractRequestDTO } from "../services/user-service/UserServices";

function buildContract(overrides: Partial<ContractResponseDTO> = {}): ContractResponseDTO {
    return {
        contractId: "contract-1",
        userId: "user-1",
        status: "DRAFT",
        ...overrides,
    };
}

describe("AdminOnboardingReviewDetails contract download action", () => {
    it("shows a contract download button when a current contract exists", () => {
        const html = renderToStaticMarkup(
            <ReviewContractDownloadAction
                currentContract={buildContract()}
                actionLoading={false}
                onDownload={vi.fn()}
            />
        );

        expect(html).toContain("Download contract PDF");
    });

    it("renders nothing when there is no current contract", () => {
        const html = renderToStaticMarkup(
            <ReviewContractDownloadAction currentContract={null} actionLoading={false} onDownload={vi.fn()} />
        );

        expect(html).toBe("");
    });
});

describe("AdminOnboardingReviewDetails contract draft saving", () => {
    const payload: CreateContractRequestDTO = {
        userId: "user-1",
        functionId: "function-1",
        functionName: "Bar employee",
        contractType: "PART_TIME",
        startDate: "2026-06-01",
        endDate: null,
        grossHourlyWage: 15.5,
        paymentFrequency: "MONTHLY",
        travelAllowance: true,
    };

    it("creates a draft when there is no current contract", async () => {
        const createContract = vi.fn().mockResolvedValue(buildContract({ contractId: "created-contract" }));
        const updateContract = vi.fn();

        const result = await saveOnboardingReviewContractDraft({
            currentContract: null,
            payload,
            createContract,
            updateContract,
        });

        expect(createContract).toHaveBeenCalledWith(payload);
        expect(updateContract).not.toHaveBeenCalled();
        expect(result.mode).toBe("created");
        expect(result.contract.contractId).toBe("created-contract");
    });

    it("updates the existing draft when a current contract already exists", async () => {
        const createContract = vi.fn();
        const updateContract = vi.fn().mockResolvedValue(buildContract({ contractId: "contract-1", grossHourlyWage: 17.25 }));

        const result = await saveOnboardingReviewContractDraft({
            currentContract: buildContract(),
            payload,
            createContract,
            updateContract,
        });

        expect(updateContract).toHaveBeenCalledWith("contract-1", payload);
        expect(createContract).not.toHaveBeenCalled();
        expect(result.mode).toBe("updated");
        expect(result.contract.grossHourlyWage).toBe(17.25);
    });

    it("creates a new draft instead of updating a finalized contract", async () => {
        const createContract = vi.fn().mockResolvedValue(buildContract({ contractId: "created-contract" }));
        const updateContract = vi.fn();

        const result = await saveOnboardingReviewContractDraft({
            currentContract: buildContract({ contractId: "finalized-contract", status: "FINALIZED" }),
            payload,
            createContract,
            updateContract,
        });

        expect(createContract).toHaveBeenCalledWith(payload);
        expect(updateContract).not.toHaveBeenCalled();
        expect(result.mode).toBe("created");
        expect(result.contract.contractId).toBe("created-contract");
    });
});

describe("AdminOnboardingReviewDetails draft action label", () => {
    it("shows update wording when a current contract exists", () => {
        expect(getContractDraftActionLabel(buildContract())).toBe("Update contract draft");
        expect(getContractDraftActionLabel(null)).toBe("Create contract draft");
    });

    it("shows create wording when the current contract is already finalized", () => {
        expect(getContractDraftActionLabel(buildContract({ status: "FINALIZED" }))).toBe("Create contract draft");
    });
});

describe("AdminOnboardingReviewDetails employee tax profile defaults", () => {
    it("always applies the employee onboarding loonheffingskorting choice to the contract draft", () => {
        expect(
            applyEmployeeTaxProfileDefaults(
                {
                    loonheffingskorting: "YES",
                    pensionApplicable: "YES",
                },
                {
                    applyLoonheffingskorting: false,
                    pensionParticipant: true,
                }
            )
        ).toMatchObject({
            loonheffingskorting: "NO",
            pensionApplicable: "YES",
        });
    });

    it("leaves pension as-is when the employee onboarding profile has no pension choice", () => {
        expect(
            applyEmployeeTaxProfileDefaults(
                {
                    loonheffingskorting: "",
                    pensionApplicable: "NO",
                },
                {
                    applyLoonheffingskorting: true,
                    pensionParticipant: null,
                }
            )
        ).toMatchObject({
            loonheffingskorting: "YES",
            pensionApplicable: "NO",
        });
    });
});

describe("AdminOnboardingReviewDetails contract type rules", () => {
    it("forces zero-hours contracts to keep 0 hours per week and 0 gross monthly wage", () => {
        expect(
            normalizeContractDraftForContractType({
                contractType: "ZERO_HOURS",
                hoursPerWeek: "24",
                grossMonthlyWage: "2422.25",
                payrollPeriod: "MONTHLY",
                paymentFrequency: "MONTHLY",
            })
        ).toMatchObject({
            contractType: "ZERO_HOURS",
            hoursPerWeek: "0",
            grossMonthlyWage: "0",
            payrollPeriod: "MONTHLY",
            paymentFrequency: "MONTHLY",
        });
    });

    it("resets non-zero-hours testing payroll periods back to monthly", () => {
        expect(
            normalizeContractDraftForContractType({
                contractType: "PART_TIME",
                hoursPerWeek: "24",
                grossMonthlyWage: "2422.25",
                payrollPeriod: "EVERY_10_MINUTES",
                paymentFrequency: "EVERY_10_MINUTES",
            })
        ).toMatchObject({
            contractType: "PART_TIME",
            hoursPerWeek: "24",
            grossMonthlyWage: "2422.25",
            payrollPeriod: "MONTHLY",
            paymentFrequency: "MONTHLY",
        });
    });

    it("shows the 10-minute testing option only for zero-hours contracts", () => {
        expect(getPayrollPeriodOptionsForContractType("ZERO_HOURS").map((item) => item.value)).toContain("EVERY_10_MINUTES");
        expect(getPayrollPeriodOptionsForContractType("PART_TIME").map((item) => item.value)).not.toContain("EVERY_10_MINUTES");
        expect(getPayrollPeriodOptionsForContractType("FULL_TIME").map((item) => item.value)).not.toContain("EVERY_10_MINUTES");
    });
});

describe("AdminOnboardingReviewDetails employer pre-sign rules", () => {
    it("requires employer agreement confirmation and typed name before send", () => {
        expect(
            validateEmployerPreSignRequirements({
                employerAgreementChecked: false,
                employerTypedSignatureName: "",
            })
        ).toEqual(["Employer agreement confirmation", "Employer typed signature name"]);
    });
});

describe("AdminOnboardingReviewDetails employer signature persistence", () => {
    it("finalizes already employee-signed contracts instead of calling pre-sign again", async () => {
        const signedContract = buildContract({ status: "SIGNED" });
        const prepareEmployerSignature = vi.fn();
        const finalizeContract = vi.fn().mockResolvedValue(buildContract({ status: "FINALIZED" }));

        const result = await saveEmployerSignatureForContract({
            contract: signedContract,
            typedSignatureName: "Mara Manager",
            drawnSignatureImage: "data:image/png;base64,manager123",
            agreementCheckboxText: "I have reviewed the signed employment contract and approve it for ParadePaard.",
            contractVersion: "2026-05-employment-v1",
            buildDocumentHash: async () => "sha256:manager-contract-hash",
            browserUserAgent: "Mozilla/5.0 Manager Browser",
            prepareEmployerSignature,
            finalizeContract,
        });

        expect(finalizeContract).toHaveBeenCalledWith("contract-1", expect.objectContaining({
            typedSignatureName: "Mara Manager",
            documentHash: "sha256:manager-contract-hash",
        }));
        expect(prepareEmployerSignature).not.toHaveBeenCalled();
        expect(result.status).toBe("FINALIZED");
    });
});

describe("AdminOnboardingReviewDetails create and send flow", () => {
    const payload: CreateContractRequestDTO = {
        userId: "user-1",
        functionId: "function-1",
        functionName: "Bar employee",
        contractType: "PART_TIME",
        startDate: "2026-06-01",
        endDate: null,
        grossHourlyWage: 15.5,
        paymentFrequency: "MONTHLY",
        travelAllowance: true,
    };

    it("saves the onboarding review before saving the contract, employer pre-sign, and send flow", async () => {
        const callOrder: string[] = [];
        const currentContract = buildContract({ contractId: "contract-1", status: "DRAFT" });

        const result = await createAndSendOnboardingContract({
            currentContract,
            payload,
            reviewPayload: {
                decision: "READY_TO_SEND_CONTRACT",
                note: "Ready to send",
                status: "PENDING_CONTRACT_SIGNATURE",
            },
            employerSignaturePayload: {
                typedSignatureName: "Mara Manager",
                agreementCheckboxText: "I have reviewed the signed employment contract and approve it for ParadePaard.",
                contractVersion: "2026-05-employment-v1",
            },
            saveReview: async () => {
                callOrder.push("saveReview");
            },
            saveContractDraft: async () => {
                callOrder.push("saveContractDraft");
                return { contract: currentContract, mode: "updated" as const };
            },
            saveEmployerSignature: async () => {
                callOrder.push("saveEmployerSignature");
                return currentContract;
            },
            sendContract: async () => {
                callOrder.push("sendContract");
                return buildContract({ contractId: "contract-1", status: "SENT_TO_EMPLOYEE" });
            },
            updateReviewAfterSend: async () => {
                callOrder.push("updateReviewAfterSend");
            },
        });

        expect(callOrder).toEqual([
            "saveReview",
            "saveContractDraft",
            "saveEmployerSignature",
            "sendContract",
            "updateReviewAfterSend",
        ]);
        expect(result.contract.status).toBe("SENT_TO_EMPLOYEE");
    });
});
