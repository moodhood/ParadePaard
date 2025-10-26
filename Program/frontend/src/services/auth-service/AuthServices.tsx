import Login from "./Login.tsx"
import Register from "./Register.tsx"
import IsAdmin from "./IsAdmin.tsx"
const API_BASE_URL = "http://localhost:4004";

export const AuthServices = {
    login: async (email: string, password: string) => {
        return await Login(email, password, API_BASE_URL);
    },
    register: async (email: string, password: string) => {
        return await Register(email, password, API_BASE_URL);
    },
    isAdmin: async () => {
        return await IsAdmin(API_BASE_URL);
    }
};


