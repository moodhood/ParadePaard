import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { UserServices } from "../services/user-service/UserServices";
import "../stylesheets/Onboarding.css";

type Step = 1 | 2 | 3;

export default function Onboarding() {
    const navigate = useNavigate();
    const { setStatus } = useAuth();
    const [step, setStep] = useState<Step>(1);
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [street, setStreet] = useState("");
    const [houseNumber, setHouseNumber] = useState("");
    const [houseNumberSuffix, setHouseNumberSuffix] = useState("");
    const [postalCode, setPostalCode] = useState("");
    const [city, setCity] = useState("");
    const [country, setCountry] = useState("");
    const [iban, setIban] = useState("");

    const canContinue = useMemo(() => {
        if (step === 1) {
            return password.length >= 8 && password === confirmPassword;
        }
        if (step === 2) {
            return street && houseNumber && postalCode && city && country;
        }
        return iban.length >= 10;
    }, [step, password, confirmPassword, street, houseNumber, postalCode, city, country, iban]);

    const goNext = () => {
        setErrorMsg(null);
        if (step < 3 && canContinue) {
            setStep((step + 1) as Step);
        }
    };

    const goBack = () => {
        setErrorMsg(null);
        if (step > 1) {
            setStep((step - 1) as Step);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMsg(null);
        if (!canContinue) {
            setErrorMsg("Please complete the required fields.");
            return;
        }
        setLoading(true);
        try {
            await UserServices.completeSetup({
                password,
                street,
                houseNumber,
                houseNumberSuffix: houseNumberSuffix || null,
                postalCode,
                city,
                country,
                iban,
            });
            setStatus("ACTIVE");
            navigate("/dashboard");
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "Onboarding failed";
            setErrorMsg(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="onboarding-container">
            <div className="onboarding-card">
                <h1>Finish Your Setup</h1>
                <p className="onboarding-subtitle">Complete your onboarding to access the dashboard.</p>

                <div className="step-indicator">
                    <span className={step === 1 ? "active" : ""}>1. Password</span>
                    <span className={step === 2 ? "active" : ""}>2. Address</span>
                    <span className={step === 3 ? "active" : ""}>3. IBAN</span>
                </div>

                <form onSubmit={handleSubmit}>
                    {step === 1 && (
                        <div className="step-panel">
                            <label>
                                New password
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="At least 8 characters"
                                    required
                                />
                            </label>
                            <label>
                                Confirm password
                                <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="Repeat password"
                                    required
                                />
                            </label>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="step-panel">
                            <label>
                                Street
                                <input
                                    value={street}
                                    onChange={(e) => setStreet(e.target.value)}
                                    placeholder="Street name"
                                    required
                                />
                            </label>
                            <div className="inline-fields">
                                <label>
                                    House number
                                    <input
                                        value={houseNumber}
                                        onChange={(e) => setHouseNumber(e.target.value)}
                                        placeholder="12"
                                        required
                                    />
                                </label>
                                <label>
                                    Suffix
                                    <input
                                        value={houseNumberSuffix}
                                        onChange={(e) => setHouseNumberSuffix(e.target.value)}
                                        placeholder="A"
                                    />
                                </label>
                            </div>
                            <label>
                                Postal code
                                <input
                                    value={postalCode}
                                    onChange={(e) => setPostalCode(e.target.value)}
                                    placeholder="1234 AB"
                                    required
                                />
                            </label>
                            <label>
                                City
                                <input
                                    value={city}
                                    onChange={(e) => setCity(e.target.value)}
                                    placeholder="City"
                                    required
                                />
                            </label>
                            <label>
                                Country
                                <input
                                    value={country}
                                    onChange={(e) => setCountry(e.target.value)}
                                    placeholder="Country"
                                    required
                                />
                            </label>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="step-panel">
                            <label>
                                IBAN
                                <input
                                    value={iban}
                                    onChange={(e) => setIban(e.target.value)}
                                    placeholder="NL00BANK0123456789"
                                    required
                                />
                            </label>
                            <p className="hint">We will include this in your contract.</p>
                        </div>
                    )}

                    {errorMsg && <div className="error-message">{errorMsg}</div>}

                    <div className="onboarding-actions">
                        <button type="button" onClick={goBack} disabled={step === 1 || loading}>
                            Back
                        </button>
                        {step < 3 && (
                            <button type="button" onClick={goNext} disabled={!canContinue || loading}>
                                Next
                            </button>
                        )}
                        {step === 3 && (
                            <button type="submit" disabled={!canContinue || loading}>
                                {loading ? "Submitting..." : "Finish setup"}
                            </button>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
}
