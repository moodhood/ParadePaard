import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Spinner from "./Spinner";

export default function RequireActiveUser({ children }: { children: React.ReactNode }) {
    const { status, loading } = useAuth();

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
