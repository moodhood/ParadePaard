import axios from "axios";
import { describe, expect, it, vi } from "vitest";
import GetPlanningLocations from "./GetPlanningLocations";
import {
    CreatePlanningLocation,
    DeletePlanningLocation,
    UpdatePlanningLocation,
} from "./ManagePlanningLocations";

vi.mock("axios", () => ({
    default: {
        get: vi.fn(),
        post: vi.fn(),
        put: vi.fn(),
        delete: vi.fn(),
        isAxiosError: (error: unknown) => Boolean((error as { isAxiosError?: boolean }).isAxiosError),
    },
}));

describe("planning location services", () => {
    it("passes the selected client to the planning locations query", async () => {
        vi.mocked(axios.get).mockResolvedValue({
            data: [],
            status: 200,
        });

        await GetPlanningLocations("http://localhost:4004", "client-123");

        expect(axios.get).toHaveBeenCalledWith(
            "http://localhost:4004/api/planning/locations",
            expect.objectContaining({
                params: { clientCompanyId: "client-123" },
                withCredentials: true,
            })
        );
    });

    it("creates a planning location with json payload", async () => {
        vi.mocked(axios.post).mockResolvedValue({
            data: { locationId: "loc-1", name: "Rotterdam Hall" },
            status: 201,
        });

        await CreatePlanningLocation("http://localhost:4004", {
            name: "Rotterdam Hall",
            streetName: "Hoogstraat",
            houseNumber: "14",
            houseNumberSuffix: "A",
            postalCode: "3011 PV",
            city: "Rotterdam",
            notes: "Dock access",
            prioritizedClientCompanyIds: ["client-123", "client-456"],
        });

        expect(axios.post).toHaveBeenCalledWith(
            "http://localhost:4004/api/planning/locations",
            {
                name: "Rotterdam Hall",
                streetName: "Hoogstraat",
                houseNumber: "14",
                houseNumberSuffix: "A",
                postalCode: "3011 PV",
                city: "Rotterdam",
                notes: "Dock access",
                prioritizedClientCompanyIds: ["client-123", "client-456"],
            },
            expect.objectContaining({
                headers: { "Content-Type": "application/json" },
                withCredentials: true,
            })
        );
    });

    it("updates and deletes a saved planning location", async () => {
        vi.mocked(axios.put).mockResolvedValue({
            data: { locationId: "loc-1", name: "Breda Yard" },
            status: 200,
        });
        vi.mocked(axios.delete).mockResolvedValue({
            data: undefined,
            status: 204,
        });

        await UpdatePlanningLocation("http://localhost:4004", "loc-1", {
            name: "Breda Yard",
            streetName: null,
            houseNumber: null,
            houseNumberSuffix: null,
            postalCode: null,
            city: null,
            notes: null,
            prioritizedClientCompanyIds: [],
        });
        await DeletePlanningLocation("http://localhost:4004", "loc-1");

        expect(axios.put).toHaveBeenCalledWith(
            "http://localhost:4004/api/planning/locations/loc-1",
            {
                name: "Breda Yard",
                streetName: null,
                houseNumber: null,
                houseNumberSuffix: null,
                postalCode: null,
                city: null,
                notes: null,
                prioritizedClientCompanyIds: [],
            },
            expect.objectContaining({
                headers: { "Content-Type": "application/json" },
                withCredentials: true,
            })
        );
        expect(axios.delete).toHaveBeenCalledWith(
            "http://localhost:4004/api/planning/locations/loc-1",
            expect.objectContaining({
                withCredentials: true,
            })
        );
    });
});
