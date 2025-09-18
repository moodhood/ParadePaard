interface EmailInputProps {
    email: string;
    setEmail: (email: string) => void;
}

export default function EmailLabel({ email, setEmail }: EmailInputProps) {
    return (
        <label>
            Email
            <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
                style={{ width: "100%", padding: 10, marginTop: 6, marginBottom: 12 }}
            />
        </label>
    );
}