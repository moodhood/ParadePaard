import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Spinner from "./Spinner";

export default function RequireOnboarding({ children }: { children: React.ReactNode }) {
    const { status, loading } = useAuth();

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
