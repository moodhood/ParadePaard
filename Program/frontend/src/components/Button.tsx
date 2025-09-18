import React from 'react';

interface ButtonProps {
    type?: 'button' | 'submit' | 'reset';
    disabled?: boolean;
    loading?: boolean;
    onClick?: () => void;
    children: React.ReactNode;
    style?: React.CSSProperties;
}

export default function Button({type = 'button', disabled = false, loading = false, onClick, children, style}: ButtonProps) {
    return (
        <button
            type={type}
            disabled={disabled || loading}
            onClick={onClick}
            style={{
                width: "100%",
                padding: 12,
                cursor: (disabled || loading) ? "not-allowed" : "pointer",
                ...style
            }}
        >
            {loading ? "Loading..." : children}
        </button>
    );
}