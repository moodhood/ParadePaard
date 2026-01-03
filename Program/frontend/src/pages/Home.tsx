import { useEffect, useState } from "react";
import "../stylesheets/Home.css"
import { UserServices, type UserResponseDTO } from "../services/user-service/UserServices"

export default function Home() {
    const [users, setUsers] = useState<UserResponseDTO[]>([]);
    const [, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const buildFullName = (user: UserResponseDTO) => {
        const parts = [user.firstNames, user.middleNamePrefix, user.lastName]
            .map((p) => (p ?? "").trim())
            .filter(Boolean);
        if (parts.length > 0) return parts.join(" ");
        return (user.preferredName ?? "").trim() || "-";
    };

    useEffect(() => {
        const fetchUsers = async () => {
            setIsLoading(true);
            try {
                const userData = await UserServices.getUsers();
                setUsers(userData);
                setError(null);
            } catch (err: unknown) {
                const errorMessage = err instanceof Error
                    ? err.message
                    : "Failed to fetch users";
                setError(errorMessage);
            } finally {
                setIsLoading(false);
            }
        };

        fetchUsers();
    }, []);

    return (
        <div className="home-container">
            <h1>Welcome to the Home page!</h1>

            {error && <p style={{ color: "red" }}>{error}</p>}

            {users.length > 0 ? (
                <table border={1} cellPadding={8}>
                    <thead>
                    <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>City</th>
                        <th>Mobile</th>
                        <th>Status</th>
                    </tr>
                    </thead>
                    <tbody>
                    {users.map((user) => (
                        <tr key={user.userId}>
                            <td>{buildFullName(user)}</td>
                            <td>{user.email}</td>
                            <td>{user.city ?? "-"}</td>
                            <td>{user.mobileNumber ?? "-"}</td>
                            <td>{user.status ?? "-"}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            ) : (
                !error && <p>Loading users...</p>
            )}
        </div>
    );
}
