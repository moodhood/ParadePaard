interface FirstNameInputProps {
    firstName: string;
    setFirstName: (firstName: string) => void;
}

export default function FirstNameLabel({ firstName, setFirstName }: FirstNameInputProps) {
    return (
        <label>
            First name
            <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="First name"
                style={{ width: "100%", padding: 10, marginTop: 6, marginBottom: 12 }}
            />
        </label>
    );
}
