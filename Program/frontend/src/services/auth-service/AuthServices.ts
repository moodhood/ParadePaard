import Login from "./Login";
import Register from "./Register";
import IsAdmin from "./IsAdmin";
import ForgotPassword from "./ForgotPassword";
import ResetPassword from "./ResetPassword";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:4004";

export const AuthServices = {
    login: async (username: string, password: string) => {
        return await Login(username, password, API_BASE_URL);
    },
    register: async (email: string, password: string, firstName?: string, lastName?: string) => {
        return await Register(email, password, firstName, lastName, API_BASE_URL);
    },
    isAdmin: async () => {
        return await IsAdmin(API_BASE_URL);
    },
    forgotPassword: async (email: string) => {
        return await ForgotPassword(email, API_BASE_URL);
    },
    resetPassword: async (token: string, newPassword: string) => {
        return await ResetPassword(token, newPassword, API_BASE_URL);
    },
};
