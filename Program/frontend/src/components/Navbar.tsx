import { type JSX } from "react";
import "../stylesheets/Navbar.css";

type NavbarProps = {
    onMenuClick?: () => void;
};

export default function Navbar({ onMenuClick }: NavbarProps): JSX.Element {
    return (
        <header className="nav_wrap">
            <div className="nav_left">
                <button
                    className="nav_menu_btn"
                    aria-label="Open menu"
                    onClick={onMenuClick}
                >
                    <span className="nav_menu_icon">
                        <span />
                        <span />
                        <span />
                    </span>
                </button>

                <div className="brand">
                    <span className="brand_main">ParadePaard</span>
                    <span className="brand_sub">Admin</span>
                </div>
            </div>

            <div className="nav_right">
                <div className="nav_stat_group">
                    <div className="nav_stat_item">
                        <span className="nav_stat_label">Run status</span>
                        <span className="nav_stat_value ok">Clear</span>
                    </div>

                    <div className="nav_stat_item">
                        <span className="nav_stat_label">Next run</span>
                        <span className="nav_stat_value">Oct 30</span>
                    </div>
                </div>

                <div className="nav_user">
                    <div className="nav_user_text">
                        <div className="nav_user_name">J. Smith</div>
                        <div className="nav_user_role">Payroll admin</div>
                    </div>
                    <div className="nav_user_avatar" aria-hidden="true">
                        JS
                    </div>
                </div>
            </div>
        </header>
    );
}
