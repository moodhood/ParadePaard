import Navbar from "../components/Navbar";
import PageBack from "../components/PageBack";
import PrimaryNav from "../components/PrimaryNav";
import Card from "../components/common/Card";

import "../stylesheets/AdminDashboard.css";

export default function AdminApplications() {
    return (
        <>
            <Navbar />
            <div className="adminDashboardPage">
                <div className="pageShell">
                    <PrimaryNav />
                    <div className="pageShellContent">
                        <header className="pageHeader">
                            <PageBack to="/management" />
                            <h1 className="pageTitle">Applications</h1>
                        </header>
                        <div className="adminDashboardCard">
                            <Card title="Applications">
                                <p>Application review screens are being prepared.</p>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
