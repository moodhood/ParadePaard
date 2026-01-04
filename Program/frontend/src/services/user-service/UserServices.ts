import ApproveLeaveRequest from "./ApproveLeaveRequest";
import CompleteSetup, { type UserSetupRequest } from "./CompleteSetup";
import CreateLeaveRequest from "./CreateLeaveRequest";
import GetLeaveRequests from "./GetLeaveRequests";
import GetLeaveRequestsByStatus from "./GetLeaveRequestsByStatus";
import GetListUserLeaveRequests from "./GetListUserLeaveRequests";
import GetMe from "./GetMe";
import GetUsers from "./GetUsers";
import RejectLeaveRequest from "./RejectLeaveRequest";
import AdminOnboardEmployee from "./AdminOnboardEmployee";
import GetMyProfilePicture from "./GetMyProfilePicture";
import UpdateMyProfilePicture from "./UpdateMyProfilePicture";
import DeleteMyProfilePicture from "./DeleteMyProfilePicture";
import GetMyPayslips, { type PayslipResponseDTO } from "./GetMyPayslips";
import GetPayslipsForReview from "./GetPayslipsForReview";
import UpdateMyPayslipFrequency, { type UpdatePayslipFrequencyRequestDTO } from "./UpdateMyPayslipFrequency";
import GetMyTimesheets, { type MyTimesheetRow } from "./GetMyTimesheets";
import GetPayslipPdf from "./GetPayslipPdf";
import type {
    AdminOnboardingRequestDTO,
    AdminOnboardingResponseDTO,
    LeaveRequestCreateDTO,
    LeaveRequestDTO,
    LeaveStatus,
    LeaveType,
    UserResponseDTO,
} from "./Types";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:4004";

export type {
    AdminOnboardingRequestDTO,
    AdminOnboardingResponseDTO,
    LeaveRequestCreateDTO,
    LeaveRequestDTO,
    LeaveStatus,
    LeaveType,
    PayslipResponseDTO,
    UpdatePayslipFrequencyRequestDTO,
    UserResponseDTO,
    UserSetupRequest,
};

export const UserServices = {
    adminOnboardEmployee: async (
        payload: AdminOnboardingRequestDTO
    ): Promise<AdminOnboardingResponseDTO> => {
        return await AdminOnboardEmployee(API_BASE_URL, payload);
    },
    getUsers: async (): Promise<UserResponseDTO[]> => {
        return await GetUsers(API_BASE_URL);
    },
    getMe: async (): Promise<UserResponseDTO> => {
        return await GetMe(API_BASE_URL);
    },
    getMyTimesheets: async (): Promise<
        MyTimesheetRow[]
    > => {
        return await GetMyTimesheets(API_BASE_URL);
    },
    getMyPayslips: async (): Promise<PayslipResponseDTO[]> => {
        return await GetMyPayslips(API_BASE_URL);
    },
    getPayslipsForReview: async (): Promise<PayslipResponseDTO[]> => {
        return await GetPayslipsForReview(API_BASE_URL);
    },
    getPayslipPdf: async (payslipId: string): Promise<Blob> => {
        return await GetPayslipPdf(API_BASE_URL, payslipId);
    },
    updateMyPayslipFrequency: async (payload: UpdatePayslipFrequencyRequestDTO): Promise<UserResponseDTO> => {
        return await UpdateMyPayslipFrequency(API_BASE_URL, payload);
    },
    getMyProfilePicture: async (): Promise<Blob | null> => {
        return await GetMyProfilePicture(API_BASE_URL);
    },
    updateMyProfilePicture: async (file: File): Promise<void> => {
        return await UpdateMyProfilePicture(API_BASE_URL, file);
    },
    deleteMyProfilePicture: async (): Promise<void> => {
        return await DeleteMyProfilePicture(API_BASE_URL);
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
