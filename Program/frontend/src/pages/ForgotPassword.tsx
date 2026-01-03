import { useState } from "react";
import { Link } from "react-router-dom";
import { AuthServices } from "../services/auth-service/AuthServices";
import Button from "../components/Button";
import EmailLabel from "../components/EmailLabel"; //
import "../stylesheets/Login.css";

export default function ForgotPassword() {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [done, setDone] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setErrorMsg(null);
        setLoading(true);
        try {
            await AuthServices.forgotPassword(email);
            setDone(true);
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "Request failed";
            setErrorMsg(message);
            setDone(true);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="login-container">
            <h1 className="login-title">Forgot password</h1>
            {done ? (
                <div>
                    <p>
                        If an account exists for that email address, you’ll receive a password reset link shortly.
                    </p>
                    {errorMsg ? <div className="error-message">{errorMsg}</div> : null}
                    <p className="existing-account">
                        <Link to="/login">Back to login</Link>
                    </p>
                </div>
            ) : (
                <form onSubmit={handleSubmit}>
                    {/* Replaced raw input with EmailLabel for consistent styling */}
                    <EmailLabel email={email} setEmail={setEmail} />

                    <Button type="submit" loading={loading}>
                        Send reset link
                    </Button>
                    <p className="existing-account">
                        <Link to="/login">Back to login</Link>
                    </p>
                </form>
            )}
        </div>
    );
}