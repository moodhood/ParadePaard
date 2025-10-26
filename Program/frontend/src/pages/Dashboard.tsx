import { useEffect, useState } from "react";
import { AuthServices } from "../services/auth-service/AuthServices";
import AdminDashboard from "../components/Dashboards/AdminDashboard.tsx";
import UserDashboard from "../components/Dashboards/UserDashboard.tsx"

export default function Dashboard() {
    const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        AuthServices.isAdmin()
            .then(setIsAdmin)
            .catch((err: unknown) => {
                if (err instanceof Error) {
                    setError(err.message);
                } else {
                    setError(String(err));
                }
            });
    }, []);

    if (error) return <div>{error}</div>;
    if (isAdmin === null) return <div>Checking your role…</div>;

    return isAdmin ? <AdminDashboard /> : <UserDashboard />;
}
