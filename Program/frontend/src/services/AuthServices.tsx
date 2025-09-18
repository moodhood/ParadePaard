import Login from "../services/apiFunctions/Login.tsx"
import Register from "../services/apiFunctions/Register.tsx"
const API_BASE_URL = "http://localhost:4004";

export const AuthServices = {
    login: async (email: string, password: string) => {
        return await Login(email, password, API_BASE_URL);
    },
    register: async (email: string, password: string) => {
        return await Register(email, password, API_BASE_URL);
    }
};


