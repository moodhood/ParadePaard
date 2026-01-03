import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { AuthServices } from "../services/auth-service/AuthServices";
import Button from "../components/Button";
import PasswordLabel from "../components/PasswordLabel";
import "../stylesheets/Login.css";
import { useAuth } from "../context/AuthContext";

export default function ResetPassword() {
    const navigate = useNavigate();
    const { refreshStatus } = useAuth();
    const [searchParams] = useSearchParams();
    const tokenFromQuery = useMemo(() => searchParams.get("token") ?? "", [searchParams]);
    const next = useMemo(() => searchParams.get("next") ?? "", [searchParams]);
    const token = tokenFromQuery || localStorage.getItem("passwordResetToken") || "";

    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [done, setDone] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setErrorMsg(null);

        if (!token) {
            setErrorMsg("Missing reset token.");
            return;
        }
        if (newPassword !== confirmPassword) {
            setErrorMsg("Passwords do not match.");
            return;
        }

        setLoading(true);
        try {
            await AuthServices.resetPassword(token, newPassword);
            localStorage.removeItem("passwordResetToken");
            setDone(true);
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "Reset failed";
            setErrorMsg(message);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        if (!done || !next) return;

        refreshStatus()
            .catch(() => undefined)
            .finally(() => {
                navigate(next, { replace: true });
            });
    }, [done, next, refreshStatus, navigate]);

    return (
        <div className="login-container">
            <h1 className="login-title">Reset password</h1>

            {!token ? (
                <div className="error-message">Invalid reset link.</div>
            ) : null}

            {done ? (
                <div>
                    <p>Your password has been reset.</p>
                    {next ? (
                        <p className="existing-account">Redirecting…</p>
                    ) : (
                        <p className="existing-account">
                            <Link to="/login">Go to login</Link>
                        </p>
                    )}
                </div>
            ) : (
                <form onSubmit={handleSubmit}>
                    <PasswordLabel
                        label="New password"
                        value={newPassword}
                        onChange={setNewPassword}
                        placeholder="At least 8 characters"
                        minLength={8}
                        autoComplete="new-password"
                        disabled={loading}
                    />
                    <PasswordLabel
                        label="Confirm new password"
                        value={confirmPassword}
                        onChange={setConfirmPassword}
                        placeholder="Repeat password"
                        minLength={8}
                        autoComplete="new-password"
                        disabled={loading}
                    />

                    {errorMsg ? <div className="error-message">{errorMsg}</div> : null}

                    <Button type="submit" loading={loading} disabled={!token}>
                        Reset password
                    </Button>
                </form>
            )}
        </div>
    );
}
