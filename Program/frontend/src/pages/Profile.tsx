/* src/pages/Profile.tsx */
import { useEffect, useState } from "react";
// Import both the service and the type from the same file
import { UserServices, type UserResponseDTO } from "../services/user-service/UserServices";
import Spinner from "../components/Spinner";
import Card from "../components/common/Card";
import "../stylesheets/Profile.css";
import "../stylesheets/UserDashboard.css";

export default function Profile() {
    const [user, setUser] = useState<UserResponseDTO | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // Referencing the centralized UserServices
        UserServices.getMe()
            .then((data) => setUser(data as UserResponseDTO))
            .catch((err: Error) => setError(err.message));
    }, []);

    if (error) return <div className="error-container">{error}</div>;
    if (!user) return <Spinner />;

    const formatValue = (value: string | number | boolean | null | undefined) => {
        if (value === null || value === undefined || value === "") return "-";
        if (typeof value === "boolean") return value ? "Yes" : "No";
        return value;
    };

    return (
        <div className="userDashboardCard">
            <header className="pageHeader">
                <h1 className="pageTitle">My Profile</h1>
                <p className="pageSubtitle">Manage your personal and employment details</p>
            </header>

            <section className="dashboardGrid">
                <Card title="Personal Information">
                    <div className="generalInfoRows">
                        <div className="profile_info_row">
                            <span className="profile_info_label">Full Name</span>
                            <span className="profile_info_value">{formatValue(user.name)}</span>
                        </div>
                        <div className="profile_info_row">
                            <span className="profile_info_label">Nickname</span>
                            <span className="profile_info_value">{formatValue(user.nickname)}</span>
                        </div>
                        <div className="profile_info_row">
                            <span className="profile_info_label">Initials</span>
                            <span className="profile_info_value">{formatValue(user.initials)}</span>
                        </div>
                        <div className="profile_info_row">
                            <span className="profile_info_label">First Names</span>
                            <span className="profile_info_value">{formatValue(user.firstNames)}</span>
                        </div>
                        <div className="profile_info_row">
                            <span className="profile_info_label">Infix</span>
                            <span className="profile_info_value">{formatValue(user.infix)}</span>
                        </div>
                        <div className="profile_info_row">
                            <span className="profile_info_label">Last Name</span>
                            <span className="profile_info_value">{formatValue(user.lastName)}</span>
                        </div>
                        <div className="profile_info_row">
                            <span className="profile_info_label">Gender</span>
                            <span className="profile_info_value">{formatValue(user.gender)}</span>
                        </div>
                        <div className="profile_info_row">
                            <span className="profile_info_label">Date of Birth</span>
                            <span className="profile_info_value">{formatValue(user.dateOfBirth)}</span>
                        </div>
                        <div className="profile_info_row">
                            <span className="profile_info_label">Nationality</span>
                            <span className="profile_info_value">{formatValue(user.nationality)}</span>
                        </div>
                        <div className="profile_info_row">
                            <span className="profile_info_label">Email</span>
                            <span className="profile_info_value">{formatValue(user.email)}</span>
                        </div>
                        <div className="profile_info_row">
                            <span className="profile_info_label">Phone</span>
                            <span className="profile_info_value">{formatValue(user.phoneNumber)}</span>
                        </div>
                        <div className="profile_info_row">
                            <span className="profile_info_label">Mobile</span>
                            <span className="profile_info_value">{formatValue(user.mobileNumber)}</span>
                        </div>
                    </div>
                </Card>

                <Card title="Address">
                    <div className="generalInfoRows">
                        <div className="profile_info_row">
                            <span className="profile_info_label">Street</span>
                            <span className="profile_info_value">{formatValue(user.streetName)}</span>
                        </div>
                        <div className="profile_info_row">
                            <span className="profile_info_label">House Number</span>
                            <span className="profile_info_value">{formatValue(user.houseNumber)}</span>
                        </div>
                        <div className="profile_info_row">
                            <span className="profile_info_label">House Number Suffix</span>
                            <span className="profile_info_value">{formatValue(user.houseNumberSuffix)}</span>
                        </div>
                        <div className="profile_info_row">
                            <span className="profile_info_label">Postal Code</span>
                            <span className="profile_info_value">{formatValue(user.postalCode)}</span>
                        </div>
                        <div className="profile_info_row">
                            <span className="profile_info_label">City</span>
                            <span className="profile_info_value">{formatValue(user.city)}</span>
                        </div>
                        <div className="profile_info_row">
                            <span className="profile_info_label">Country</span>
                            <span className="profile_info_value">{formatValue(user.country)}</span>
                        </div>
                    </div>
                </Card>

                <Card title="Bank Details">
                    <div className="generalInfoRows">
                        <div className="profile_info_row">
                            <span className="profile_info_label">IBAN</span>
                            <span className="profile_info_value">{formatValue(user.iban)}</span>
                        </div>
                        <div className="profile_info_row">
                            <span className="profile_info_label">Bank Account Number</span>
                            <span className="profile_info_value">{formatValue(user.bankAccountNumber)}</span>
                        </div>
                        <div className="profile_info_row">
                            <span className="profile_info_label">Account Holder</span>
                            <span className="profile_info_value">{formatValue(user.accountHolderName)}</span>
                        </div>
                        <div className="profile_info_row">
                            <span className="profile_info_label">Bank Country</span>
                            <span className="profile_info_value">{formatValue(user.bankCountry)}</span>
                        </div>
                    </div>
                </Card>

                <Card title="Identification">
                    <div className="generalInfoRows">
                        <div className="profile_info_row">
                            <span className="profile_info_label">ID Type</span>
                            <span className="profile_info_value">{formatValue(user.idType)}</span>
                        </div>
                        <div className="profile_info_row">
                            <span className="profile_info_label">ID Number</span>
                            <span className="profile_info_value">{formatValue(user.idNumber)}</span>
                        </div>
                        <div className="profile_info_row">
                            <span className="profile_info_label">Issue Date</span>
                            <span className="profile_info_value">{formatValue(user.idIssueDate)}</span>
                        </div>
                        <div className="profile_info_row">
                            <span className="profile_info_label">Expiration Date</span>
                            <span className="profile_info_value">{formatValue(user.idExpirationDate)}</span>
                        </div>
                    </div>
                </Card>

                <Card title="Employment Details">
                    <div className="generalInfoRows">
                        <div className="profile_info_row">
                            <span className="profile_info_label">Registered Date</span>
                            <span className="profile_info_value">{formatValue(user.registeredDate)}</span>
                        </div>
                        <div className="profile_info_row">
                            <span className="profile_info_label">Leave Hours</span>
                            <span className="profile_info_value">{formatValue(user.leaveHours)}</span>
                        </div>
                        <div className="profile_info_row">
                            <span className="profile_info_label">Physically Demanding</span>
                            <span className="profile_info_value">{formatValue(user.physicallyDemanding)}</span>
                        </div>
                        <div className="profile_info_row">
                            <span className="profile_info_label">Apply Payroll Tax</span>
                            <span className="profile_info_value">{formatValue(user.applyPayrollTax)}</span>
                        </div>
                        <div className="profile_info_row">
                            <span className="profile_info_label">Previous Contract (Last 6 Months)</span>
                            <span className="profile_info_value">{formatValue(user.previousContractInLastSixMonths)}</span>
                        </div>
                    </div>
                </Card>
            </section>
        </div>
    );
}
