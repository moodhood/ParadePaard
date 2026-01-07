import { useLocation, useNavigate } from "react-router-dom";
import "../stylesheets/PageBack.css";

type Props = {
    label?: string;
};

export default function PageBack({ label = "Back" }: Props) {
    const navigate = useNavigate();
    const location = useLocation();

    const handleBack = () => {
        const path = location.pathname.toLowerCase();
        if (path.startsWith("/account/")) {
            navigate("/dashboard");
            return;
        }
        if (window.history.length > 1) {
            navigate(-1);
            return;
        }
        navigate("/dashboard");
    };

    return (
        <button type="button" className="pageBack" onClick={handleBack} aria-label="Go back">
            <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M15 18l-6-6 6-6" />
            </svg>
            <span>{label}</span>
        </button>
    );
}
