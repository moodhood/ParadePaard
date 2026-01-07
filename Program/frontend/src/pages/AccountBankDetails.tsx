import { useOutletContext } from "react-router-dom";
import Card from "../components/common/Card";
import type { AccountOutletContext } from "./Account";

export default function AccountBankDetails() {
    const { user, formatValue } = useOutletContext<AccountOutletContext>();

    return (
        <Card title="Bank details">
            <div className="generalInfoRows">
                <div className="profile_info_row">
                    <span className="profile_info_label">IBAN</span>
                    <span className="profile_info_value">{formatValue(user.iban)}</span>
                </div>
            </div>
        </Card>
    );
}
