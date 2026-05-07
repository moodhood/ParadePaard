import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import Spinner from "./Spinner";
import { spinnerTextForPath } from "./spinnerText";
import { useAuth } from "../context/AuthContext";

type RequirePermissionProps = {
    permission?: string;
    anyOf?: string[];
    allOf?: string[];
    children: React.ReactNode;
};

export default function RequirePermission({
    permission,
    anyOf,
    allOf,
    children,
}: RequirePermissionProps) {
    const location = useLocation();
    const { permissionsLoading, hasPermission, hasAnyPermission, hasAllPermissions } = useAuth();

    if (permissionsLoading) {
        return <Spinner text={spinnerTextForPath(location.pathname)} />;
    }

    const singleAllowed = permission ? hasPermission(permission) : true;
    const anyAllowed = anyOf && anyOf.length > 0 ? hasAnyPermission(anyOf) : true;
    const allAllowed = allOf && allOf.length > 0 ? hasAllPermissions(allOf) : true;

    if (!singleAllowed || !anyAllowed || !allAllowed) {
        return <Navigate to="/dashboard" replace />;
    }

    return <>{children}</>;
}
