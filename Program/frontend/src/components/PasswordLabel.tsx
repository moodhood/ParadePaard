import { useState } from 'react';

interface PasswordInputProps {
    label: string;
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
}

export default function PasswordLabel({label, value, onChange, placeholder = "Your password"}: PasswordInputProps) {
    const [showPassword, setShowPassword] = useState(false);

    return (
        <label>
            {label}
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <input
                    type={showPassword ? "text" : "password"}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    required
                    placeholder={placeholder}
                    style={{ flex: 1, padding: 10, marginTop: 6, marginBottom: 12 }}
                />
                <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    style={{ padding: "8px 10px", cursor: "pointer" }}
                >
                    {showPassword ? "Hide" : "Show"}
                </button>
            </div>
        </label>
    );
}