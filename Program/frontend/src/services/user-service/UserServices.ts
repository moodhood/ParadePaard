import ApproveLeaveRequest from "./ApproveLeaveRequest";
import CompleteSetup, { type UserSetupRequest } from "./CompleteSetup";
import CreateLeaveRequest from "./CreateLeaveRequest";
import GetLeaveRequests from "./GetLeaveRequests";
import GetLeaveRequestsByStatus from "./GetLeaveRequestsByStatus";
import GetListUserLeaveRequests from "./GetListUserLeaveRequests";
import GetMe from "./GetMe";
import GetUsers from "./GetUsers";
import RejectLeaveRequest from "./RejectLeaveRequest";
import type {
    LeaveRequestCreateDTO,
    LeaveRequestDTO,
    LeaveStatus,
    LeaveType,
    UserResponseDTO,
} from "./Types";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:4004";

export type {
    LeaveRequestCreateDTO,
    LeaveRequestDTO,
    LeaveStatus,
    LeaveType,
    UserResponseDTO,
    UserSetupRequest,
};

export const UserServices = {
    getUsers: async (): Promise<UserResponseDTO[]> => {
        return await GetUsers(API_BASE_URL);
    },
    getMe: async (): Promise<UserResponseDTO> => {
        return await GetMe(API_BASE_URL);
    },
    completeSetup: async (payload: UserSetupRequest): Promise<void> => {
        return await CompleteSetup(API_BASE_URL, payload);
    },
    leaveRequests: {
        list: async (status?: LeaveStatus): Promise<LeaveRequestDTO[]> => {
            if (status) return await GetLeaveRequestsByStatus(API_BASE_URL, status);
            return await GetLeaveRequests(API_BASE_URL);
        },
        listMine: async (userId: string): Promise<LeaveRequestDTO[]> => {
            return await GetListUserLeaveRequests(API_BASE_URL, userId);
        },
        create: async (
            userId: string,
            payload: LeaveRequestCreateDTO
        ): Promise<LeaveRequestDTO> => {
            return await CreateLeaveRequest(API_BASE_URL, userId, payload);
        },
        approve: async (requestId: string): Promise<void> => {
            return await ApproveLeaveRequest(API_BASE_URL, requestId);
        },
        reject: async (requestId: string, note?: string): Promise<void> => {
            return await RejectLeaveRequest(API_BASE_URL, requestId, note);
        },
    },
};
