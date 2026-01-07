import { type Dispatch, type SetStateAction, useEffect, useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";
import PageBack from "../components/PageBack";
import Spinner from "../components/Spinner";
import { AuthServices } from "../services/auth-service/AuthServices";
import { UserServices, type UserResponseDTO } from "../services/user-service/UserServices";
import { formatMaybeDateTime } from "../utils/dateFormat";
import "../stylesheets/Profile.css";
import "../stylesheets/Settings.css";
import "../stylesheets/UserDashboard.css";

export type AccountOutletContext = {
    user: UserResponseDTO;
    fullName: string;
    defaultAvatarLetter: string;
    profilePictureUrl: string | null;
    profilePictureLoading: boolean;
    avatarErrorMsg: string | null;
    formatValue: (value: string | number | boolean | null | undefined) => string | number;
    formatPosition: (value: string | null | undefined) => string;
    onSelectProfilePicture: (file: File | null) => Promise<void>;
    onRemoveProfilePicture: () => Promise<void>;
};

export default function Account() {
    const [user, setUser] = useState<UserResponseDTO | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [avatarErrorMsg, setAvatarErrorMsg] = useState<string | null>(null);
    const [profilePictureUrl, setProfilePictureUrl] = useState<string | null>(null);
    const [profilePictureLoading, setProfilePictureLoading] = useState(false);
    const [permissions, setPermissions] = useState<string[]>([]);
    const [permissionsLoaded, setPermissionsLoaded] = useState(false);

    useEffect(() => {
        UserServices.getMe()
            .then((data) => {
                setUser(data);
            })
            .catch((err: Error) => setError(err.message));
    }, []);

    useEffect(() => {
        let cancelled = false;

        AuthServices.getPermissions()
            .then((data) => {
                if (!cancelled) setPermissions(data ?? []);
            })
            .catch(() => {
                if (!cancelled) setPermissions([]);
            })
            .finally(() => {
                if (!cancelled) setPermissionsLoaded(true);
            });

        return () => {
            cancelled = true;
        };
    }, []);

    useEffect(() => {
        if (!user) return;
        let cancelled = false;
        setProfilePictureLoading(true);

        UserServices.getMyProfilePicture()
            .then((blob) => {
                if (cancelled) return;
                setProfilePictureUrl(blob ? URL.createObjectURL(blob) : null);
            })
            .catch(() => {
                if (!cancelled) setProfilePictureUrl(null);
            })
            .finally(() => {
                if (!cancelled) setProfilePictureLoading(false);
            });

        return () => {
            cancelled = true;
        };
    }, [user?.userId]);

    useEffect(() => {
        return () => {
            if (profilePictureUrl) URL.revokeObjectURL(profilePictureUrl);
        };
    }, [profilePictureUrl]);

    const canManageCompany =
        permissions.includes("CAN_CREATE_ROLE") || permissions.includes("CAN_ASSIGN_ROLES");

    if (error) return <div className="error-container">{error}</div>;
    if (!user) return <Spinner text="Loading account" />;

    const formatValue = (value: string | number | boolean | null | undefined) => {
        if (value === null || value === undefined || value === "") return "-";
        if (typeof value === "boolean") return value ? "Yes" : "No";
        if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}/.test(value)) {
            return formatMaybeDateTime(value);
        }
        return value;
    };

    const formatPosition = (value: string | null | undefined) => {
        if (value === null || value === undefined || value.trim() === "") return "-";
        const normalized = value.trim().toUpperCase();
        if (normalized === "BAR") return "Bar";
        if (normalized === "RUNNER") return "Runner";
        return value;
    };

    const fullName = (() => {
        const parts = [user.firstNames, user.middleNamePrefix, user.lastName]
            .map((p) => (p ?? "").trim())
            .filter(Boolean);
        if (parts.length > 0) return parts.join(" ");
        return (user.preferredName ?? "").trim() || "-";
    })();

    const defaultAvatarLetter = (fullName.trim()[0] ?? "?").toUpperCase();

    const handleSelectProfilePicture = async (file: File | null) => {
        if (!file) return;
        if (!file.type.startsWith("image/")) {
            setAvatarErrorMsg("Please select an image file.");
            return;
        }

        try {
            setAvatarErrorMsg(null);
            await UserServices.updateMyProfilePicture(file);

            const blob = await UserServices.getMyProfilePicture();
            setProfilePictureUrl(blob ? URL.createObjectURL(blob) : null);
            window.dispatchEvent(new Event("profilePictureUpdated"));
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "Could not upload profile picture.";
            setAvatarErrorMsg(message);
        }
    };

    const handleRemoveProfilePicture = async () => {
        try {
            setAvatarErrorMsg(null);
            await UserServices.deleteMyProfilePicture();
            setProfilePictureUrl(null);
            window.dispatchEvent(new Event("profilePictureUpdated"));
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "Could not remove profile picture.";
            setAvatarErrorMsg(message);
        }
    };

    return (
        <>
            <Navbar />
            <div className="userDashboardCard settingsCard">
                <header className="pageHeader">
                    <PageBack />
                    <h1 className="pageTitle">Account</h1>
                    <p className="pageSubtitle">Manage your personal and employment details</p>
                </header>

                <div className="settingsLayout">
                    <aside className="settingsNav">
                        <NavLink
                            to="/account"
                            end
                            className={({ isActive }) =>
                                `settingsNavLink ${isActive ? "settingsNavLink--active" : ""}`
                            }
                        >
                            Personal info
                        </NavLink>
                        <NavLink
                            to="/account/bank"
                            className={({ isActive }) =>
                                `settingsNavLink ${isActive ? "settingsNavLink--active" : ""}`
                            }
                        >
                            Bank details
                        </NavLink>
                        <NavLink
                            to="/account/employment"
                            className={({ isActive }) =>
                                `settingsNavLink ${isActive ? "settingsNavLink--active" : ""}`
                            }
                        >
                            Employment details
                        </NavLink>
                        {permissionsLoaded && canManageCompany ? (
                            <NavLink
                                to="/account/company"
                                className={({ isActive }) =>
                                    `settingsNavLink ${isActive ? "settingsNavLink--active" : ""}`
                                }
                            >
                                Company settings
                            </NavLink>
                        ) : null}
                    </aside>

                    <div className="settingsContent">
                        <Outlet
                            context={{
                                user,
                                fullName,
                                defaultAvatarLetter,
                                profilePictureUrl,
                                profilePictureLoading,
                                avatarErrorMsg,
                                formatValue,
                                formatPosition,
                                onSelectProfilePicture: handleSelectProfilePicture,
                                onRemoveProfilePicture: handleRemoveProfilePicture,
                            }}
                        />
                    </div>
                </div>
            </div>
        </>
    );
}
