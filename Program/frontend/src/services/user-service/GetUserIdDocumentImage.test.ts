import axios from "axios";
import { describe, expect, it, vi } from "vitest";
import GetUserIdDocumentImage from "./GetUserIdDocumentImage";

vi.mock("axios", () => ({
    default: {
        get: vi.fn(),
        isAxiosError: vi.fn(),
    },
}));

describe("GetUserIdDocumentImage", () => {
    it("fetches the front ID document image by default", async () => {
        const blob = new Blob(["front"]);
        vi.mocked(axios.get).mockResolvedValue({ data: blob, status: 200 });

        await GetUserIdDocumentImage("http://localhost:4004", "user-1");

        expect(axios.get).toHaveBeenCalledWith(
            "http://localhost:4004/api/users/user-1/id-document-image",
            expect.objectContaining({
                responseType: "blob",
                withCredentials: true,
            })
        );
    });

    it("fetches the back ID document image when requested", async () => {
        const blob = new Blob(["back"]);
        vi.mocked(axios.get).mockResolvedValue({ data: blob, status: 200 });

        await GetUserIdDocumentImage("http://localhost:4004", "user-1", "back");

        expect(axios.get).toHaveBeenCalledWith(
            "http://localhost:4004/api/users/user-1/id-document-back-image",
            expect.objectContaining({
                responseType: "blob",
                withCredentials: true,
            })
        );
    });
});
