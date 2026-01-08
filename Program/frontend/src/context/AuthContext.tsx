import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { UserServices } from "../services/user-service/UserServices";

export type UserStatus = "PENDING_SETUP" | "ACTIVE";

type AuthContextValue = {
    status: UserStatus | null;
    loading: boolean;
    setStatus: (status: UserStatus | null) => void;
    refreshStatus: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const getCachedStatus = (): UserStatus | null => {
    try {
        const token =
            localStorage.getItem("token") ||
            localStorage.getItem("accessToken") ||
            localStorage.getItem("authToken") ||
            sessionStorage.getItem("token") ||
            sessionStorage.getItem("accessToken") ||
            sessionStorage.getItem("authToken");

        if (!token) return null;
        const cached = localStorage.getItem("userStatus");
        if (cached === "ACTIVE" || cached === "PENDING_SETUP") return cached;
        return null;
    } catch {
        return null;
    }
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [status, setStatus] = useState<UserStatus | null>(getCachedStatus());
    const [loading, setLoading] = useState(status === null);

    const refreshStatus = async () => {
        try {
            const me = await UserServices.getMe();
            setStatus((me.status as UserStatus) || null);
        } catch {
            setStatus(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        refreshStatus();
    }, []);

    useEffect(() => {
        try {
            if (status) {
                localStorage.setItem("userStatus", status);
            } else {
                localStorage.removeItem("userStatus");
            }
        } catch {
            // ignore storage failures
        }
    }, [status]);

    const value = useMemo(
        () => ({ status, loading, setStatus, refreshStatus }),
        [status, loading]
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) {
        throw new Error("useAuth must be used within AuthProvider");
    }
    return ctx;
}
