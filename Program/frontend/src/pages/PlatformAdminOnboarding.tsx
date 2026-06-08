import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import PrimaryNav from "../components/PrimaryNav";
import PageBack from "../components/PageBack";
import Card from "../components/common/Card";
import { UserServices } from "../services/user-service/UserServices";
import "../stylesheets/PlatformAdmin.css";

type FormState = {
    companyName: string;
    adminFirstName: string;
    adminLastName: string;
    adminEmail: string;
    adminPassword: string;
};

const INITIAL_FORM: FormState = {
    companyName: "",
    adminFirstName: "",
    adminLastName: "",
    adminEmail: "",
    adminPassword: "",
};

export default function PlatformAdminOnboarding() {
    const navigate = useNavigate();
    const [form, setForm] = useState<FormState>(INITIAL_FORM);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const updateField = (field: keyof FormState, value: string) => {
        setForm((current) => ({ ...current, [field]: value }));
        if (error) setError(null);
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        try {
            setSaving(true);
            await UserServices.onboardPlatformCompany(form);
            navigate("/platform/companies");
        } catch (err) {
            setError(err instanceof Error ? err.message : "Could not create company.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <>
            <Navbar />
            <div className="managementPage platformAdminPage">
                <div className="pageShell">
                    <PrimaryNav />
                    <main className="pageShellContent">
                        <div className="platformAdminHeaderBar">
                            <PageBack to="/platform" />
                        </div>
                        <header className="managementHeader">
                            <div>
                                <h1 className="managementTitle">Company onboarding</h1>
                                <p className="managementSubtitle">
                                    Create a company and its first admin in one simple step.
                                </p>
                            </div>
                        </header>
                        <Card title="New company" className="platformAdminFormCard">
                            <form className="platformAdminForm" onSubmit={handleSubmit}>
                                <label>
                                    <span>Company name</span>
                                    <input
                                        value={form.companyName}
                                        onChange={(event) => updateField("companyName", event.target.value)}
                                        required
                                    />
                                </label>
                                <label>
                                    <span>Admin first name</span>
                                    <input
                                        value={form.adminFirstName}
                                        onChange={(event) => updateField("adminFirstName", event.target.value)}
                                        required
                                    />
                                </label>
                                <label>
                                    <span>Admin last name</span>
                                    <input
                                        value={form.adminLastName}
                                        onChange={(event) => updateField("adminLastName", event.target.value)}
                                        required
                                    />
                                </label>
                                <label>
                                    <span>Admin email</span>
                                    <input
                                        type="email"
                                        value={form.adminEmail}
                                        onChange={(event) => updateField("adminEmail", event.target.value)}
                                        required
                                    />
                                </label>
                                <label>
                                    <span>Temporary password</span>
                                    <input
                                        type="password"
                                        value={form.adminPassword}
                                        onChange={(event) => updateField("adminPassword", event.target.value)}
                                        required
                                    />
                                </label>
                                {error ? <div className="settingsError">{error}</div> : null}
                                <div className="platformAdminFormActions">
                                    <button type="submit" className="button" disabled={saving}>
                                        {saving ? "Creating..." : "Create company"}
                                    </button>
                                </div>
                            </form>
                        </Card>
                    </main>
                </div>
            </div>
        </>
    );
}
