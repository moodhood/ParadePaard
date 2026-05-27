import axios from "axios";
import { describe, expect, it, vi } from "vitest";
import FinalizePlanningProject from "./FinalizePlanningProject";

vi.mock("axios", () => ({
    default: {
        post: vi.fn(),
        isAxiosError: (error: unknown) => Boolean((error as { isAxiosError?: boolean }).isAxiosError),
    },
}));

describe("FinalizePlanningProject", () => {
    it("sends project ids to the planning finalization request", async () => {
        vi.mocked(axios.post).mockResolvedValue({
            status: 200,
            data: {
                createdTimesheets: 2,
                finalizedProjectIds: ["project-7"],
                warnings: [],
            },
        } as never);

        await FinalizePlanningProject("http://localhost:4004", {
            companyId: "company-1",
            projectId: "project-7",
            isoWeek: 22,
            weekBasedYear: 2026,
        });

        expect(axios.post).toHaveBeenCalledWith(
            "http://localhost:4004/api/planning/finalization",
            {
                companyId: "company-1",
                projectId: "project-7",
                isoWeek: 22,
                weekBasedYear: 2026,
            },
            { withCredentials: true }
        );
    });
});
