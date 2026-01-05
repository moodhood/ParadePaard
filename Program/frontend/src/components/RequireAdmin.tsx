import React, { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { AuthServices } from "../services/auth-service/AuthServices";
import Spinner from "./Spinner";
import { spinnerTextForPath } from "./spinnerText";

export default function RequireAdmin({ children }: { children: React.ReactNode }) {
    const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
    const location = useLocation();

    useEffect(() => {
        AuthServices.isAdmin()
            .then(setIsAdmin)
            .catch(() => setIsAdmin(false));
    }, []);

    if (isAdmin === null) {
        return <Spinner text={spinnerTextForPath(location.pathname)} />;
    }
    if (!isAdmin) {
        return <Navigate to="/dashboard" replace />;
    }
    return <>{children}</>;
}

