import Login from "./Login.tsx"
import Register from "./Register.tsx"
import IsAdmin from "./IsAdmin.tsx"
const API_BASE_URL = "http://localhost:4004";

export const AuthServices = {
    login: async (username: string, password: string) => {
        return await Login(username, password, API_BASE_URL);
    },
    register: async (email: string, username: string, password: string) => {
        return await Register(email, username, password, API_BASE_URL);
    },
    isAdmin: async () => {
        return await IsAdmin(API_BASE_URL);
    }
};


