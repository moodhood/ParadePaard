import axios from "axios";
import { describe, expect, it, vi } from "vitest";
import { UploadIdDocumentImages } from "./CompleteSetup";

vi.mock("axios", () => ({
    default: {
        post: vi.fn(),
    },
}));

describe("complete setup uploads", () => {
    it("uploads both ID document sides as multipart data without forcing a content type header", async () => {
        vi.mocked(axios.post).mockResolvedValue({
            data: undefined,
            status: 200,
        });

        const front = new File(["front"], "front.png", { type: "image/png" });
        const back = new File(["back"], "back.png", { type: "image/png" });

        await UploadIdDocumentImages("http://localhost:4004", front, back);

        expect(axios.post).toHaveBeenCalledWith(
            "http://localhost:4004/api/user/setup/id-document-image",
            expect.any(FormData),
            expect.objectContaining({
                withCredentials: true,
            })
        );
        expect(vi.mocked(axios.post).mock.calls[0][2]).not.toHaveProperty("headers");
    });
});
