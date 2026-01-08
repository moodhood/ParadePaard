const CACHE_TTL_MS = 5 * 60 * 1000;

const ADMIN_KEY = "authIsAdmin";
const ADMIN_AT_KEY = "authIsAdminAt";
const PERMS_KEY = "authPermissions";
const PERMS_AT_KEY = "authPermissionsAt";

const readTimestamp = (key: string): number | null => {
    const raw = localStorage.getItem(key);
    const ts = Number(raw);
    return Number.isFinite(ts) ? ts : null;
};

const isExpired = (ts: number) => Date.now() - ts > CACHE_TTL_MS;

export const readCachedIsAdmin = (): boolean | null => {
    try {
        const raw = localStorage.getItem(ADMIN_KEY);
        if (raw === null) return null;
        const ts = readTimestamp(ADMIN_AT_KEY);
        if (ts === null || isExpired(ts)) return null;
        return raw === "true";
    } catch {
        return null;
    }
};

export const writeCachedIsAdmin = (value: boolean): void => {
    try {
        localStorage.setItem(ADMIN_KEY, String(value));
        localStorage.setItem(ADMIN_AT_KEY, String(Date.now()));
    } catch {
        // ignore cache failures
    }
};

export const readCachedPermissions = (): string[] | null => {
    try {
        const raw = localStorage.getItem(PERMS_KEY);
        if (!raw) return null;
        const ts = readTimestamp(PERMS_AT_KEY);
        if (ts === null || isExpired(ts)) return null;
        const parsed = JSON.parse(raw);
        if (!Array.isArray(parsed)) return null;
        return parsed.filter((value) => typeof value === "string");
    } catch {
        return null;
    }
};

export const writeCachedPermissions = (permissions: string[]): void => {
    try {
        localStorage.setItem(PERMS_KEY, JSON.stringify(permissions));
        localStorage.setItem(PERMS_AT_KEY, String(Date.now()));
    } catch {
        // ignore cache failures
    }
};

export const clearAuthCache = (): void => {
    try {
        localStorage.removeItem(ADMIN_KEY);
        localStorage.removeItem(ADMIN_AT_KEY);
        localStorage.removeItem(PERMS_KEY);
        localStorage.removeItem(PERMS_AT_KEY);
    } catch {
        // ignore cache failures
    }
};
