import GetUsers from "./Get-Users.tsx";
import GetMe from "./Get-Me.tsx";
import CompleteSetup, { type UserSetupRequest } from "./Complete-Setup";
import type { UserResponseDTO } from "./types";

const API_BASE_URL = "http://localhost:4004";

export type { UserResponseDTO };

export const UserServices = {
    getUsers: async () => {
        return await GetUsers(API_BASE_URL);
    },
    getMe: async () => {
        return await GetMe(API_BASE_URL);
    },
    completeSetup: async (payload: UserSetupRequest) => {
        return await CompleteSetup(API_BASE_URL, payload);
    }
};
