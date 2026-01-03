import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Spinner from "./Spinner";

export default function RequireOnboarding({ children }: { children: React.ReactNode }) {
    const { status, loading } = useAuth();
    const location = useLocation();

    const resetToken = localStorage.getItem("passwordResetToken");
    if (resetToken) {
        return (
            <Navigate
                to={`/reset-password?token=${encodeURIComponent(resetToken)}&next=${encodeURIComponent(location.pathname)}`}
                replace
            />
        );
    }

    if (loading) {
        return <Spinner />;
    }
    if (status === "ACTIVE") {
        return <Navigate to="/dashboard" replace />;
    }
    if (!status) {
        return <Navigate to="/login" replace />;
    }
    return <>{children}</>;
}
