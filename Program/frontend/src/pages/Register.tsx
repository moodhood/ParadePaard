import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthServices } from "../services/auth-service/AuthServices.tsx";
import EmailLabel from "../components/EmailLabel";
import UsernameLabel from "../components/UsernameLabel";
import PasswordLabel from "../components/PasswordLabel";
import Button from "../components/Button";
import "../stylesheets/Register.css"

export default function Register() {
    const navigate = useNavigate();
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setErrorMsg(null);

        if (password !== confirmPassword) {
            setErrorMsg("Passwords do not match");
            return;
        }

        setLoading(true);

        try {
            const response = await AuthServices.register(email, username, password);
            console.log("Register successful:", response.message);
            navigate("/dashboard");
        } catch (err: unknown) {
            const errorMessage = err instanceof Error
                ? err.message
                : "Registration failed";
            setErrorMsg(errorMessage);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="register-container">
            <h1 className="register-title">Register</h1>

            <form onSubmit={handleSubmit}>
                <UsernameLabel username={username} setUsername={setUsername} />
                <EmailLabel email={email} setEmail={setEmail}/>
                <PasswordLabel label="Password" value={password} onChange={setPassword} placeholder="Your password"/>
                <PasswordLabel label="Confirm Password" value={confirmPassword} onChange={setConfirmPassword} placeholder="Repeat password"/>

                {errorMsg && (<div className="error-message">{errorMsg}</div>)}

                <Button type="submit" loading={loading}>{loading ? "Creating account..." : "Create account"}</Button>
            </form>

            <p className="existing-account">
                Already have an account? <Link to="/login">Login</Link>
            </p>
        </div>
    );
}
