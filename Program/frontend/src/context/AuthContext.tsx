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

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [status, setStatus] = useState<UserStatus | null>(null);
    const [loading, setLoading] = useState(true);

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
