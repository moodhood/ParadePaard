import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Spinner from "./Spinner";
import { spinnerTextForPath } from "./spinnerText";

// Permissions that mark the user as an admin who can drive their own
// onboarding/contract approval. When they have one of these we let them
// browse the admin app even while their own onboarding is still waiting on
// review.
const SELF_APPROVAL_PERMISSIONS = ["CAN_REVIEW_ONBOARDING", "CAN_FINALIZE_CONTRACT"];

export default function RequireActiveUser({ children }: { children: React.ReactNode }) {
    const { status, loading, permissions } = useAuth();
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
        return <Spinner text={spinnerTextForPath(location.pathname)} />;
    }
    const isContractSigningRoute =
        location.pathname.startsWith("/contracts/") && location.pathname.endsWith("/sign");
    const canSelfApprove = SELF_APPROVAL_PERMISSIONS.some((perm) => permissions.includes(perm));
    if (
        !canSelfApprove &&
        (status === "PENDING_SETUP" ||
            (status === "PENDING_PROFILE_REVIEW" && !isContractSigningRoute) ||
            status === "CHANGES_REQUESTED" ||
            status === "PENDING_CONTRACT_REVIEW")
    ) {
        return <Navigate to="/onboarding" replace />;
    }
    if (!status) {
        return <Navigate to="/login" replace />;
    }
    return <>{children}</>;
}
