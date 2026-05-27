import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import {
    getContractDraftActionLabel,
    ReviewContractDownloadAction,
    saveOnboardingReviewContractDraft,
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
});

describe("AdminOnboardingReviewDetails draft action label", () => {
    it("shows update wording when a current contract exists", () => {
        expect(getContractDraftActionLabel(buildContract())).toBe("Update contract draft");
        expect(getContractDraftActionLabel(null)).toBe("Create contract draft");
    });
});
