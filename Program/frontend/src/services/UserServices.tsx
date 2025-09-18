import GetUsers from "./apiFunctions/Get-Users.tsx";

const API_BASE_URL = "http://localhost:4004";

export const UserServices = {
    getUsers: async () => {
        return await GetUsers(API_BASE_URL);
    },
};


