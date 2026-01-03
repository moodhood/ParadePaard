import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { AuthServices } from "../services/auth-service/AuthServices";
import Spinner from "./Spinner";

export default function RequireAdmin({ children }: { children: React.ReactNode }) {
    const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

    useEffect(() => {
        AuthServices.isAdmin()
            .then(setIsAdmin)
            .catch(() => setIsAdmin(false));
    }, []);

    if (isAdmin === null) {
        return <Spinner />;
    }
    if (!isAdmin) {
        return <Navigate to="/dashboard" replace />;
    }
    return <>{children}</>;
}

