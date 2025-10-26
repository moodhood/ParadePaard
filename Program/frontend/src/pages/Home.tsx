import { useEffect, useState } from "react";
import "../stylesheets/Home.css"
import { UserServices } from "../services/user-service/UserServices.tsx"

type UserResponseDTO = {
    userId: string;
    name: string;
    email: string;
    streetName: string;
    houseNumber: string;
    houseNumberSuffix: string;
    postalCode: string;
    city: string;
    country: string;
    dateOfBirth: string;
    registeredDate: string;
    bankAccountNumber: string;
    phoneNumber: string;
};

export default function Home() {
    const [users, setUsers] = useState<UserResponseDTO[]>([]);
    const [, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

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
                        <th>Phone</th>
                    </tr>
                    </thead>
                    <tbody>
                    {users.map((user) => (
                        <tr key={user.userId}>
                            <td>{user.name}</td>
                            <td>{user.email}</td>
                            <td>{user.city}</td>
                            <td>{user.phoneNumber}</td>
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
