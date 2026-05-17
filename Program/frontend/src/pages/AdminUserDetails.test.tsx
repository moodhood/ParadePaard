import { describe, expect, it } from "vitest";
import {
    buildContractDraftPayload,
    canShowCreateContractDraft,
    canSubmitEmployerContractSignature,
} from "./AdminUserDetails";

describe("AdminUserDetails contract finalization", () => {
    it("requires a loaded unfinalized contract, checked agreement, and typed manager name", () => {
        expect(canSubmitEmployerContractSignature({
            contractLoaded: false,
            alreadyFinalized: false,
            agreementChecked: true,
            typedName: "Mara Manager",
        })).toBe(false);
        expect(canSubmitEmployerContractSignature({
            contractLoaded: true,
            alreadyFinalized: true,
            agreementChecked: true,
            typedName: "Mara Manager",
        })).toBe(false);
        expect(canSubmitEmployerContractSignature({
            contractLoaded: true,
            alreadyFinalized: false,
            agreementChecked: false,
            typedName: "Mara Manager",
        })).toBe(false);
        expect(canSubmitEmployerContractSignature({
            contractLoaded: true,
            alreadyFinalized: false,
            agreementChecked: true,
            typedName: "   ",
        })).toBe(false);
        expect(canSubmitEmployerContractSignature({
            contractLoaded: true,
            alreadyFinalized: false,
            agreementChecked: true,
            typedName: "Mara Manager",
        })).toBe(true);
    });
});

describe("AdminUserDetails contract draft creation", () => {
    it("allows contract managers to create a draft for accepted applicants without a current contract", () => {
        expect(canShowCreateContractDraft({
            canManageContracts: true,
            contractLoading: false,
            currentContract: null,
            userStatus: "PENDING_PROFILE_REVIEW",
        })).toBe(true);

        expect(canShowCreateContractDraft({
            canManageContracts: false,
            contractLoading: false,
            currentContract: null,
            userStatus: "PENDING_PROFILE_REVIEW",
        })).toBe(false);

        expect(canShowCreateContractDraft({
            canManageContracts: true,
            contractLoading: false,
            currentContract: { contractId: "existing", userId: "user-1" },
            userStatus: "PENDING_PROFILE_REVIEW",
        })).toBe(false);
    });

    it("builds a contract draft payload from the selected function and draft fields", () => {
        const payload = buildContractDraftPayload({
            userId: "user-1",
            functionId: "function-1",
            fallbackFunctionName: "Runner",
            functions: [
                {
                    functionId: "function-1",
                    functionName: "Bar",
                    hourlyWage: 15.5,
                },
            ],
            draft: {
                functionName: "",
                contractType: "ON_CALL",
                startDate: "2026-06-01",
                endDate: "",
                grossHourlyWage: "",
                paymentFrequency: "WEEKLY",
                travelAllowance: true,
            },
        });

        expect(payload).toEqual({
            userId: "user-1",
            functionId: "function-1",
            functionName: "Bar",
            contractType: "ON_CALL",
            startDate: "2026-06-01",
            endDate: null,
            grossHourlyWage: 15.5,
            paymentFrequency: "WEEKLY",
            travelAllowance: true,
        });
    });
});
