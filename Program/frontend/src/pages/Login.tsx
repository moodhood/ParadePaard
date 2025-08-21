import { useState } from "react";
import { useNavigate } from "react-router";
import axios from "axios";

type LoginResponse = {
    token: string;
    username?: string;
    id?: string;
};

export default function Login() {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPw, setShowPw] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setErrorMsg(null);
        setLoading(true);
        try {
            const res = await axios.post<LoginResponse>(
                "http://localhost:4004/auth/login",
                { email, password },
                { headers: { "Content-Type": "application/json" } }
            );
            if (!res.data?.token) {
                throw new Error("No token in response");
            }
            localStorage.setItem("accessToken", res.data.token);
            // navigate to your app page here if you have react router
            navigate("/");
        } catch (err: unknown) {
            const msg =
                axios.isAxiosError(err)
                    ? err.response?.data?.error || err.message
                    : "Login failed";
            setErrorMsg(String(msg));
        } finally {
            setLoading(false);
        }
    }

    return (
        <div style={{ maxWidth: 380, margin: "80px auto", padding: 20 }}>
            <h1 style={{ marginBottom: 16 }}>Login</h1>

            <form onSubmit={handleSubmit}>
                <label>
                    Email
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.currentTarget.value)}
                        required
                        placeholder="you@example.com"
                        style={{ width: "100%", padding: 10, marginTop: 6, marginBottom: 12 }}
                    />
                </label>

                <label>
                    Password
                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                        <input
                            type={showPw ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.currentTarget.value)}
                            required
                            placeholder="Your password"
                            style={{ flex: 1, padding: 10, marginTop: 6, marginBottom: 12 }}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPw((v) => !v)}
                            style={{ padding: "8px 10px", cursor: "pointer" }}
                        >
                            {showPw ? "Hide" : "Show"}
                        </button>
                    </div>
                </label>

                {errorMsg && (
                    <div style={{ color: "red", marginBottom: 12 }}>{errorMsg}</div>
                )}

                <button
                    type="submit"
                    disabled={loading}
                    style={{
                        width: "100%",
                        padding: 12,
                        cursor: loading ? "not-allowed" : "pointer",
                    }}
                >
                    {loading ? "Logging in..." : "Login"}
                </button>
            </form>
        </div>
    );
}
