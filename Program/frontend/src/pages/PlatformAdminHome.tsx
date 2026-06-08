import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import PrimaryNav from "../components/PrimaryNav";
import Card from "../components/common/Card";
import "../stylesheets/PlatformAdmin.css";

const platformCards = [
    {
        title: "Company onboarding",
        to: "/platform/onboarding",
        meta: "New client setup",
        description: "Create a new company with its first admin and the basic defaults needed to start.",
    },
    {
        title: "Companies",
        to: "/platform/companies",
        meta: "Company directory",
        description: "Browse every company, inspect the details, and enter that company's management workspace.",
    },
];

export default function PlatformAdminHome() {
    return (
        <>
            <Navbar />
            <div className="managementPage platformAdminPage">
                <div className="pageShell">
                    <PrimaryNav />
                    <main className="pageShellContent">
                        <header className="managementHeader">
                            <div>
                                <h1 className="managementTitle">Platform</h1>
                                <p className="managementSubtitle">
                                    Manage company onboarding and move into a selected company's workspace.
                                </p>
                            </div>
                        </header>
                        <section className="managementSection">
                            <div className="managementSectionHeader">
                                <h2>Platform tools</h2>
                                <p>Keep the first version focused on company setup and company access.</p>
                            </div>
                            <div className="managementGrid">
                                {platformCards.map((card) => (
                                    <Link
                                        key={card.title}
                                        className="managementCardLink"
                                        to={card.to}
                                        aria-label={`Open ${card.title}`}
                                    >
                                        <Card title={card.title} className="managementCard platformAdminCard">
                                            <div className="managementCardBody">
                                                <span className="managementCardMeta">{card.meta}</span>
                                                <p className="managementCardText">{card.description}</p>
                                            </div>
                                        </Card>
                                    </Link>
                                ))}
                            </div>
                        </section>
                    </main>
                </div>
            </div>
        </>
    );
}
