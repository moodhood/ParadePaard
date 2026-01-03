import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Spinner from "./Spinner";

export default function RequireActiveUser({ children }: { children: React.ReactNode }) {
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
    if (status === "PENDING_SETUP") {
        return <Navigate to="/onboarding" replace />;
    }
    if (!status) {
        return <Navigate to="/login" replace />;
    }
    return <>{children}</>;
}
