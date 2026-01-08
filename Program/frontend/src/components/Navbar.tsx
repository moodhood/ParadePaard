import { type JSX, useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { AuthServices } from "../services/auth-service/AuthServices";
import { UserServices, type CompanyResponseDTO, type UserResponseDTO } from "../services/user-service/UserServices";
import { clearAuthCache, readCachedIsAdmin, writeCachedIsAdmin } from "../utils/authCache";
import "../stylesheets/Navbar.css";

export default function Navbar(): JSX.Element {
    const location = useLocation();
    const navigate = useNavigate();
    const { setStatus } = useAuth();
    const [menuOpen, setMenuOpen] = useState(false);
    const [loggingOut, setLoggingOut] = useState(false);
    const menuRef = useRef<HTMLDivElement | null>(null);
    const searchRef = useRef<HTMLDivElement | null>(null);
    const headerRef = useRef<HTMLElement | null>(null);
    const companyRef = useRef<HTMLDivElement | null>(null);
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
    const [avatarInitial, setAvatarInitial] = useState("P");
    const cachedIsAdmin = useMemo(() => readCachedIsAdmin(), []);
    const [isAdmin, setIsAdmin] = useState(cachedIsAdmin ?? false);
    const [searchTerm, setSearchTerm] = useState("");
    const [searchOpen, setSearchOpen] = useState(false);
    const [searchLoading, setSearchLoading] = useState(false);
    const [searchError, setSearchError] = useState<string | null>(null);
    const [users, setUsers] = useState<UserResponseDTO[]>([]);
    const [canManageCompany, setCanManageCompany] = useState(false);
    const [companyInfo, setCompanyInfo] = useState<CompanyResponseDTO | null>(null);
    const [companyOpen, setCompanyOpen] = useState(false);
    const personalView = useMemo(() => {
        return new URLSearchParams(location.search).get("view") === "personal";
    }, [location.search]);

    useEffect(() => {
        return () => {
            if (avatarUrl) URL.revokeObjectURL(avatarUrl);
        };
    }, [avatarUrl]);

    useEffect(() => {
        let cancelled = false;

        AuthServices.isAdmin()
            .then((value) => {
                if (!cancelled) {
                    const nextValue = Boolean(value);
                    setIsAdmin(nextValue);
                    writeCachedIsAdmin(nextValue);
                }
            })
            .catch(() => {
                if (!cancelled && cachedIsAdmin === null) setIsAdmin(false);
            });

        return () => {
            cancelled = true;
        };
    }, []);

    useEffect(() => {
        let cancelled = false;

        AuthServices.getPermissions()
            .then((data) => {
                if (cancelled) return;
                const list = data ?? [];
                const canManage =
                    list.includes("CAN_MANAGE_COMPANY") ||
                    list.includes("CAN_CREATE_ROLE") ||
                    list.includes("CAN_ASSIGN_ROLES");
                setCanManageCompany(canManage);
            })
            .catch(() => {
                if (!cancelled) setCanManageCompany(false);
            });

        return () => {
            cancelled = true;
        };
    }, []);

    useEffect(() => {
        if (!isAdmin || personalView) {
            setUsers([]);
            setSearchOpen(false);
            setSearchTerm("");
            setSearchLoading(false);
            setSearchError(null);
            return;
        }
        let cancelled = false;

        const loadUsers = async () => {
            try {
                setSearchLoading(true);
                setSearchError(null);
                const data = await UserServices.getUsers();
                if (!cancelled) setUsers(data);
            } catch (err: unknown) {
                const message = err instanceof Error ? err.message : "Failed to load users";
                if (!cancelled) setSearchError(message);
            } finally {
                if (!cancelled) setSearchLoading(false);
            }
        };

        void loadUsers();

        return () => {
            cancelled = true;
        };
    }, [isAdmin, personalView]);

    useEffect(() => {
        if (!canManageCompany || personalView) {
            setCompanyInfo(null);
            setCompanyOpen(false);
            return;
        }
        let cancelled = false;

        const loadCompany = async () => {
            try {
                const data = await UserServices.getMyCompany();
                if (!cancelled) setCompanyInfo(data);
            } catch {
                if (!cancelled) setCompanyInfo(null);
            }
        };

        void loadCompany();

        const handleCompanyUpdated = () => {
            void loadCompany();
        };
        window.addEventListener("companyUpdated", handleCompanyUpdated);

        return () => {
            cancelled = true;
            window.removeEventListener("companyUpdated", handleCompanyUpdated);
        };
    }, [canManageCompany, personalView]);

    useEffect(() => {
        let cancelled = false;

        const loadInitial = async () => {
            try {
                const me = await UserServices.getMe();
                const fullName =
                    [me.firstNames, me.middleNamePrefix, me.lastName]
                        .map((part) => (part ?? "").trim())
                        .filter(Boolean)
                        .join(" ") ||
                    (me.preferredName ?? "").trim() ||
                    "";

                const initial = (fullName.trim()[0] ?? "P").toUpperCase();
                if (!cancelled) setAvatarInitial(initial);
            } catch {
                // ignore
            }
        };

        const loadAvatar = async () => {
            try {
                const blob = await UserServices.getMyProfilePicture();
                if (cancelled) return;
                setAvatarUrl(blob ? URL.createObjectURL(blob) : null);
            } catch {
                if (!cancelled) setAvatarUrl(null);
            }
        };

        void loadInitial();
        void loadAvatar();

        const handleProfilePictureUpdated = () => {
            void loadAvatar();
        };
        window.addEventListener("profilePictureUpdated", handleProfilePictureUpdated);

        return () => {
            cancelled = true;
            window.removeEventListener("profilePictureUpdated", handleProfilePictureUpdated);
        };
    }, []);

    useEffect(() => {
        if (!menuOpen) return;

        const handlePointerDown = (event: MouseEvent | TouchEvent) => {
            const target = event.target as Node | null;
            if (!target) return;
            if (menuRef.current && !menuRef.current.contains(target)) {
                setMenuOpen(false);
            }
        };

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") setMenuOpen(false);
        };

        document.addEventListener("mousedown", handlePointerDown);
        document.addEventListener("touchstart", handlePointerDown, { passive: true });
        document.addEventListener("keydown", handleKeyDown);

        return () => {
            document.removeEventListener("mousedown", handlePointerDown);
            document.removeEventListener("touchstart", handlePointerDown);
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [menuOpen]);

    useEffect(() => {
        if (!companyOpen) return;

        const handlePointerDown = (event: MouseEvent | TouchEvent) => {
            const target = event.target as Node | null;
            if (!target) return;
            if (companyRef.current && !companyRef.current.contains(target)) {
                setCompanyOpen(false);
            }
        };

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") setCompanyOpen(false);
        };

        document.addEventListener("mousedown", handlePointerDown);
        document.addEventListener("touchstart", handlePointerDown, { passive: true });
        document.addEventListener("keydown", handleKeyDown);

        return () => {
            document.removeEventListener("mousedown", handlePointerDown);
            document.removeEventListener("touchstart", handlePointerDown);
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [companyOpen]);

    useEffect(() => {
        const node = headerRef.current;
        if (!node) return;

        const updateHeight = () => {
            const rect = node.getBoundingClientRect();
            const height = Math.ceil(rect.height);
            document.documentElement.style.setProperty("--navbar-height", `${height}px`);
        };

        updateHeight();

        let observer: ResizeObserver | null = null;
        if (typeof ResizeObserver !== "undefined") {
            observer = new ResizeObserver(() => updateHeight());
            observer.observe(node);
        } else {
            window.addEventListener("resize", updateHeight);
        }

        return () => {
            observer?.disconnect();
            window.removeEventListener("resize", updateHeight);
        };
    }, []);

    useEffect(() => {
        if (!searchOpen) return;

        const handlePointerDown = (event: MouseEvent | TouchEvent) => {
            const target = event.target as Node | null;
            if (!target) return;
            if (searchRef.current && !searchRef.current.contains(target)) {
                setSearchOpen(false);
            }
        };

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") setSearchOpen(false);
        };

        document.addEventListener("mousedown", handlePointerDown);
        document.addEventListener("touchstart", handlePointerDown, { passive: true });
        document.addEventListener("keydown", handleKeyDown);

        return () => {
            document.removeEventListener("mousedown", handlePointerDown);
            document.removeEventListener("touchstart", handlePointerDown);
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [searchOpen]);

    const displayNameForUser = (user: UserResponseDTO) => {
        const parts = [user.firstNames, user.middleNamePrefix, user.lastName]
            .map((part) => (part ?? "").trim())
            .filter(Boolean);
        if (parts.length > 0) return parts.join(" ");
        const preferred = (user.preferredName ?? "").trim();
        if (preferred) return preferred;
        return user.email;
    };

    const searchResults = useMemo(() => {
        const term = searchTerm.trim().toLowerCase();
        if (!term) return [];
        return users
            .map((user) => ({
                user,
                name: displayNameForUser(user),
            }))
            .filter(({ user, name }) => {
                return (
                    name.toLowerCase().includes(term) ||
                    (user.preferredName ?? "").toLowerCase().includes(term) ||
                    user.email.toLowerCase().includes(term)
                );
            })
            .slice(0, 8);
    }, [searchTerm, users]);

    const companyName = (companyInfo?.name ?? "Company").trim() || "Company";
    const companyInitial = (companyName.trim()[0] ?? "C").toUpperCase();

    const handleSelectUser = (userId: string) => {
        setSearchTerm("");
        setSearchOpen(false);
        navigate(`/admin/user/${userId}`);
    };

    async function handleLogout(): Promise<void> {
        setLoggingOut(true);
        try {
            localStorage.removeItem("token");
            localStorage.removeItem("accessToken");
            localStorage.removeItem("refreshToken");
            localStorage.removeItem("authToken");
            localStorage.removeItem("passwordResetToken");
            localStorage.removeItem("userStatus");
            clearAuthCache();
            sessionStorage.removeItem("token");
            sessionStorage.removeItem("accessToken");
            sessionStorage.removeItem("refreshToken");
            sessionStorage.removeItem("authToken");
        } catch {
            // ignore storage failures (private mode, etc.)
        }

        try {
            const apiBaseUrl =
                import.meta.env.VITE_API_BASE_URL ?? "http://localhost:4004";
            await fetch(`${apiBaseUrl}/auth/logout`, {
                method: "POST",
                credentials: "include",
            });
        } catch {
            // ignore logout network failures
        } finally {
            setStatus(null);
            setMenuOpen(false);
            setAvatarUrl(null);
            navigate("/login", { replace: true });
        }
    }

    return (
        <>
            {loggingOut ? (
                <div className="nav_logout_overlay" role="status" aria-live="polite">
                    <div className="nav_logout_card">
                        <div className="nav_logout_spinner" aria-hidden="true" />
                        <div className="nav_logout_text">Logging out...</div>
                    </div>
                </div>
            ) : null}

            <header className="nav_wrap" ref={headerRef}>
                <div className="nav_left">
                    <div className="nav_top">
                        <div className="brand">
                            <span className="brand_main">ParadePaard</span>
                        </div>
                        {isAdmin && !personalView ? (
                            <div className="nav_search" ref={searchRef}>
                                <input
                                    className="nav_search_input"
                                    type="search"
                                    placeholder="Search users"
                                    aria-label="Search users"
                                    value={searchTerm}
                                    onFocus={() => setSearchOpen(true)}
                                    onChange={(e) => {
                                        setSearchTerm(e.target.value);
                                        setSearchOpen(true);
                                    }}
                                    disabled={loggingOut}
                                />
                                {searchOpen ? (
                                    <div className="nav_search_results" role="listbox">
                                        {searchLoading ? (
                                            <div className="nav_search_empty">Loading users...</div>
                                        ) : searchError ? (
                                            <div className="nav_search_empty">{searchError}</div>
                                        ) : searchTerm.trim().length === 0 ? (
                                            <div className="nav_search_empty">Start typing to search.</div>
                                        ) : searchResults.length === 0 ? (
                                            <div className="nav_search_empty">No matches found.</div>
                                        ) : (
                                            searchResults.map(({ user, name }) => (
                                                <button
                                                    key={user.userId}
                                                    type="button"
                                                    className="nav_search_item"
                                                    role="option"
                                                    onClick={() => handleSelectUser(user.userId)}
                                                >
                                                    <span className="nav_search_name">{name}</span>
                                                    <span className="nav_search_email">{user.email}</span>
                                                </button>
                                            ))
                                        )}
                                    </div>
                                ) : null}
                            </div>
                        ) : null}
                    </div>
                    
                </div>

                <div className="nav_right">
                    {canManageCompany && !personalView ? (
                        <div className="nav_company_menu" ref={companyRef}>
                            <button
                                type="button"
                                className="nav_company_button"
                                aria-haspopup="menu"
                                aria-expanded={companyOpen}
                                aria-label={companyName}
                                onClick={() => setCompanyOpen((open) => !open)}
                                title={companyName}
                            >
                                <span className="nav_company_avatar" aria-hidden="true">
                                    {companyInitial}
                                </span>
                                <span className="nav_company_name">{companyName}</span>
                            </button>
                            {companyOpen ? (
                                <div className="nav_dropdown nav_company_dropdown" role="menu">
                                    <div className="nav_company_header" role="presentation">
                                        <span className="nav_company_header_avatar" aria-hidden="true">
                                            {companyInitial}
                                        </span>
                                        <span className="nav_company_header_name" title={companyName}>
                                            {companyName}
                                        </span>
                                    </div>
                                    <Link
                                        className="nav_dropdown_item"
                                        role="menuitem"
                                        to="/account/company"
                                        onClick={() => setCompanyOpen(false)}
                                    >
                                        Company settings
                                    </Link>
                                </div>
                            ) : null}
                        </div>
                    ) : null}
                    <div className="nav_user_menu" ref={menuRef}>
                        <button
                            type="button"
                            className="nav_avatar_btn"
                            aria-label="Open user menu"
                            aria-haspopup="menu"
                            aria-expanded={menuOpen}
                            onClick={() => setMenuOpen((v) => !v)}
                            disabled={loggingOut}
                        >
                            <span
                                className={`nav_user_avatar ${
                                    avatarUrl ? "nav_user_avatar--image" : "nav_user_avatar--default"
                                }`}
                                aria-hidden="true"
                            >
                                {avatarUrl ? (
                                    <img
                                        className="nav_user_avatar_img"
                                        src={avatarUrl}
                                        alt=""
                                    />
                                ) : (
                                    avatarInitial
                                )}
                            </span>
                        </button>

                        {menuOpen && (
                            <div className="nav_dropdown" role="menu" aria-label="User menu">
                                {isAdmin && !personalView ? (
                                    <Link
                                        className="nav_dropdown_item"
                                        role="menuitem"
                                        to="/dashboard?view=personal"
                                        onClick={() => setMenuOpen(false)}
                                    >
                                        Personal Account
                                    </Link>
                                ) : null}
                                {isAdmin && personalView ? (
                                    <Link
                                        className="nav_dropdown_item"
                                        role="menuitem"
                                        to="/dashboard"
                                        onClick={() => setMenuOpen(false)}
                                    >
                                        Admin Dashboard
                                    </Link>
                                ) : null}
                                <Link
                                    className="nav_dropdown_item"
                                    role="menuitem"
                                    to={personalView ? "/account?view=personal" : "/account"}
                                    onClick={() => setMenuOpen(false)}
                                >
                                    Account
                                </Link>
                                <button
                                    type="button"
                                    className="nav_dropdown_item nav_dropdown_button"
                                    role="menuitem"
                                    onClick={() => void handleLogout()}
                                    disabled={loggingOut}
                                >
                                    Logout
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </header>
        </>
    );
}
