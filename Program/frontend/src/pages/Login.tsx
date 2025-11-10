import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthServices } from "../services/auth-service/AuthServices.tsx";
import EmailLabel from "../components/EmailLabel";
import PasswordLabel from "../components/PasswordLabel.tsx";
import Button from "../components/Button.tsx";
import "../stylesheets/Login.css"

export default function Login() {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setErrorMsg(null);
        setLoading(true);

        try {
            const response = await AuthServices.login(email, password);
            console.log("Login successful:", response.message);
            navigate("/dashboard");
        } catch (err: unknown) {
            const errorMessage = err instanceof Error
                ? err.message
                : "An unknown login error occurred";
            setErrorMsg(errorMessage);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="login-container">
            <h1 className="login-title">Login</h1>
            <form onSubmit={handleSubmit}>
                <EmailLabel email={email} setEmail={setEmail} />
                <PasswordLabel
                    label="Password"
                    value={password}
                    onChange={setPassword}
                    placeholder="Your password"
                />
                {errorMsg && (<div className="error-message">{errorMsg}</div>)}
                <Button type="submit" loading={loading}>Login</Button>
            </form>
        </div>
    );
}