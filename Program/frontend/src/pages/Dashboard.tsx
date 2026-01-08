import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { AuthServices } from "../services/auth-service/AuthServices";
import AdminDashboard from "../components/Dashboards/AdminDashboard";
import UserDashboard from "../components/Dashboards/UserDashboard";
import Spinner from "../components/Spinner.tsx";
import Navbar from "../components/Navbar";

export default function Dashboard() {
    const [searchParams] = useSearchParams();
    const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
    const [error, setError] = useState<string | null>(null);
    const personalView = searchParams.get("view") === "personal";

    useEffect(() => {
        AuthServices.isAdmin()
            .then(setIsAdmin)
            .catch((err: unknown) => {
                setError(err instanceof Error ? err.message : String(err));
            });
    }, []);

    if (personalView) {
        return (
            <>
                <Navbar />
                <UserDashboard />
            </>
        );
    }

    if (error) return <div>{error}</div>;
    if (isAdmin === null) return <Spinner text="Loading dashboard" />;

    return (
        <>
            <Navbar />
            {isAdmin ? <AdminDashboard /> : <UserDashboard />}
        </>
    );
}
