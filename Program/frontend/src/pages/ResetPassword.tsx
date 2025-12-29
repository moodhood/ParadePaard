import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { AuthServices } from "../services/auth-service/AuthServices";
import Button from "../components/Button";
import "../stylesheets/Login.css";

export default function ResetPassword() {
    const [searchParams] = useSearchParams();
    const token = useMemo(() => searchParams.get("token") ?? "", [searchParams]);

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
            setDone(true);
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "Reset failed";
            setErrorMsg(message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="login-container">
            <h1 className="login-title">Reset password</h1>

            {!token ? (
                <div className="error-message">Invalid reset link.</div>
            ) : null}

            {done ? (
                <div>
                    <p>Your password has been reset. You can now log in.</p>
                    <p className="existing-account">
                        <Link to="/login">Go to login</Link>
                    </p>
                </div>
            ) : (
                <form onSubmit={handleSubmit}>
                    <label>
                        New password
                        <input
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="At least 8 characters"
                            required
                            minLength={8}
                        />
                    </label>
                    <label>
                        Confirm new password
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Repeat password"
                            required
                            minLength={8}
                        />
                    </label>

                    {errorMsg ? <div className="error-message">{errorMsg}</div> : null}

                    <Button type="submit" loading={loading} disabled={!token}>
                        Reset password
                    </Button>
                </form>
            )}
        </div>
    );
}
