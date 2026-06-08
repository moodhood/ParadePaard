import axios from "axios";
import { describe, expect, it, vi } from "vitest";
import SwitchPlatformCompanyScope from "./SwitchPlatformCompanyScope";

vi.mock("axios");

describe("SwitchPlatformCompanyScope", () => {
    it("posts the requested company scope with credentials", async () => {
        vi.mocked(axios.post).mockResolvedValueOnce({
            status: 200,
            data: { companyId: "company-2" },
        });

        await expect(
            SwitchPlatformCompanyScope("http://localhost:4004", "company-2")
        ).resolves.toEqual({ companyId: "company-2" });

        expect(axios.post).toHaveBeenCalledWith(
            "http://localhost:4004/auth/platform/company-scope",
            { companyId: "company-2" },
            { withCredentials: true }
        );
    });

    it("posts a null company id when restoring the home company scope", async () => {
        vi.mocked(axios.post).mockResolvedValueOnce({
            status: 200,
            data: { companyId: "company-1" },
        });

        await SwitchPlatformCompanyScope("http://localhost:4004", null);

        expect(axios.post).toHaveBeenCalledWith(
            "http://localhost:4004/auth/platform/company-scope",
            { companyId: null },
            { withCredentials: true }
        );
    });
});
