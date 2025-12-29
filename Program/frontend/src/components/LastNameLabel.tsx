interface LastNameInputProps {
    lastName: string;
    setLastName: (lastName: string) => void;
}

export default function LastNameLabel({ lastName, setLastName }: LastNameInputProps) {
    return (
        <label>
            Last name
            <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Last name"
                style={{ width: "100%", padding: 10, marginTop: 6, marginBottom: 12 }}
            />
        </label>
    );
}
