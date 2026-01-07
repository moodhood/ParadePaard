import { useOutletContext } from "react-router-dom";
import Card from "../components/common/Card";
import type { AccountOutletContext } from "./Account";

export default function AccountEmploymentDetails() {
    const {
        user,
        formatValue,
        formatPosition,
    } = useOutletContext<AccountOutletContext>();

    return (
        <Card title="Employment details">
            <div className="generalInfoRows">
                <div className="profile_info_row">
                    <span className="profile_info_label">Position</span>
                    <span className="profile_info_value">{formatPosition(user.position)}</span>
                </div>
                <div className="profile_info_row">
                    <span className="profile_info_label">Worked For Us Before</span>
                    <span className="profile_info_value">{formatValue(user.workedForUsBefore)}</span>
                </div>
                <div className="profile_info_row">
                    <span className="profile_info_label">Status</span>
                    <span className="profile_info_value">{formatValue(user.status)}</span>
                </div>
            </div>
        </Card>
    );
}
