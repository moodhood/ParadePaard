interface UsernameInputProps {
    username: string;
    setUsername: (username: string) => void;
}

export default function UsernameLabel({ username, setUsername }: UsernameInputProps) {
    return (
        <label>
            Username
            <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                placeholder="firstname.lastname"
                style={{ width: "100%", padding: 10, marginTop: 6, marginBottom: 12 }}
            />
        </label>
    );
}
