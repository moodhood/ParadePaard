import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import PrimaryNav from "../components/PrimaryNav";
import Card from "../components/common/Card";
import { useAuth } from "../context/AuthContext";
import { getManagementNavItems } from "../utils/permissionPolicy";
import "../stylesheets/Management.css";

const cardDescriptions: Record<string, string> = {
    Users: "Open the employee directory and inspect employee profiles.",
    Onboarding: "Invite a new employee and start their setup flow.",
    Planning: "Create events, shifts, and staffing assignments.",
    Clients: "Manage client companies used in planning.",
    "Travel claims": "Review submitted travel claims.",
    "All payslips": "Inspect company payslips by employee, date, and status.",
    "Payslip review": "Open the payroll review queue.",
    "Company settings": "Manage company details, roles, workflow, and tax settings.",
};

export default function Management() {
    const { permissions } = useAuth();
    const items = getManagementNavItems(permissions);

    return (
        <>
            <Navbar />
            <div className="managementPage">
                <div className="pageShell">
                    <PrimaryNav />
                    <main className="pageShellContent">
                        <header className="pageHeader">
                            <h1 className="pageTitle">Management</h1>
                        </header>
                        {items.length === 0 ? (
                            <Card title="No management access" className="managementNotice">
                                <p>Your account does not currently include management permissions.</p>
                            </Card>
                        ) : (
                            <div className="managementGrid">
                                {items.map((item) => (
                                    <Card key={item.label} title={item.label} className="managementCard">
                                        <p className="managementCardText">
                                            {cardDescriptions[item.label] ?? "Open this management workspace."}
                                        </p>
                                        <Link className="button" to={item.to}>
                                            Open
                                        </Link>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </main>
                </div>
            </div>
        </>
    );
}
