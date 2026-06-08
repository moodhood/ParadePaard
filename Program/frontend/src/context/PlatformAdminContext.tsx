import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { AuthServices } from "../services/auth-service/AuthServices";
import { useAuth } from "./AuthContext";
import { canAccessPlatform } from "../utils/permissionPolicy";

export type ActingCompany = {
    companyId: string;
    companyName: string;
};

type PlatformAdminContextValue = {
    actingCompany: ActingCompany | null;
    isPlatformAdmin: boolean;
    startActingAsCompany: (company: ActingCompany, redirectTo?: string) => Promise<void>;
    stopActingAsCompany: (redirectTo?: string) => Promise<void>;
};

export const PLATFORM_ACTING_COMPANY_STORAGE_KEY = "platformActingCompany";
const PlatformAdminContext = createContext<PlatformAdminContextValue | undefined>(undefined);

export function normalizeActingCompany(value: unknown): ActingCompany | null {
    if (!value || typeof value !== "object") return null;

    const companyId =
        "companyId" in value && typeof value.companyId === "string" ? value.companyId.trim() : "";
    const companyName =
        "companyName" in value && typeof value.companyName === "string" ? value.companyName.trim() : "";

    if (!companyId || !companyName) return null;

    return {
        companyId,
        companyName,
    };
}

function readStoredActingCompany(): ActingCompany | null {
    try {
        const raw = localStorage.getItem(PLATFORM_ACTING_COMPANY_STORAGE_KEY);
        if (!raw) return null;
        return normalizeActingCompany(JSON.parse(raw));
    } catch {
        return null;
    }
}

export function PlatformAdminProvider({ children }: { children: React.ReactNode }) {
    const { permissions } = useAuth();
    const isPlatformAdmin = canAccessPlatform(permissions);
    const [actingCompany, setActingCompany] = useState<ActingCompany | null>(() => readStoredActingCompany());

    useEffect(() => {
        if (!isPlatformAdmin && actingCompany) {
            setActingCompany(null);
        }
    }, [actingCompany, isPlatformAdmin]);

    useEffect(() => {
        try {
            if (actingCompany) {
                localStorage.setItem(PLATFORM_ACTING_COMPANY_STORAGE_KEY, JSON.stringify(actingCompany));
            } else {
                localStorage.removeItem(PLATFORM_ACTING_COMPANY_STORAGE_KEY);
            }
        } catch {
            // ignore storage failures
        }
    }, [actingCompany]);

    const value = useMemo<PlatformAdminContextValue>(
        () => ({
            actingCompany,
            isPlatformAdmin,
            startActingAsCompany: async (company, redirectTo = "/management") => {
                const normalized = normalizeActingCompany(company);
                if (!normalized) return;
                await AuthServices.switchPlatformCompanyScope(normalized.companyId);
                setActingCompany(normalized);
                window.location.assign(redirectTo);
            },
            stopActingAsCompany: async (redirectTo = "/platform") => {
                await AuthServices.switchPlatformCompanyScope(null);
                setActingCompany(null);
                window.location.assign(redirectTo);
            },
        }),
        [actingCompany, isPlatformAdmin]
    );

    return <PlatformAdminContext.Provider value={value}>{children}</PlatformAdminContext.Provider>;
}

export function usePlatformAdmin() {
    const context = useContext(PlatformAdminContext);
    if (!context) {
        throw new Error("usePlatformAdmin must be used within PlatformAdminProvider");
    }
    return context;
}
