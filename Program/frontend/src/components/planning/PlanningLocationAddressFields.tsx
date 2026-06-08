import "../../stylesheets/PlanningLocationAddressFields.css";
import type { PlanningLocationAddressFieldsValue } from "../../utils/planningLocationAddress";

type PlanningLocationAddressFieldsProps = {
    value: PlanningLocationAddressFieldsValue;
    onChange: (field: keyof PlanningLocationAddressFieldsValue, nextValue: string) => void;
    disabled?: boolean;
};

export default function PlanningLocationAddressFields({
    value,
    onChange,
    disabled = false,
}: PlanningLocationAddressFieldsProps) {
    return (
        <div className="planningLocationAddressFields">
            <div className="planningLocationAddressFieldsRow planningLocationAddressFieldsRow--single">
                <label className="planningLocationAddressField">
                    <span className="planningLocationAddressLabel">Street name</span>
                    <input
                        className="modal_input"
                        value={value.streetName ?? ""}
                        onChange={(event) => onChange("streetName", event.target.value)}
                        placeholder="Hoogstraat"
                        disabled={disabled}
                    />
                </label>
            </div>
            <div className="planningLocationAddressFieldsRow">
                <label className="planningLocationAddressField">
                    <span className="planningLocationAddressLabel">House number</span>
                    <input
                        className="modal_input"
                        value={value.houseNumber ?? ""}
                        onChange={(event) => onChange("houseNumber", event.target.value)}
                        placeholder="14"
                        disabled={disabled}
                    />
                </label>
                <label className="planningLocationAddressField planningLocationAddressField--compact">
                    <span className="planningLocationAddressLabel">Suffix</span>
                    <input
                        className="modal_input"
                        value={value.houseNumberSuffix ?? ""}
                        onChange={(event) => onChange("houseNumberSuffix", event.target.value)}
                        placeholder="A"
                        disabled={disabled}
                    />
                </label>
            </div>
            <div className="planningLocationAddressFieldsRow">
                <label className="planningLocationAddressField planningLocationAddressField--compact">
                    <span className="planningLocationAddressLabel">Postal code</span>
                    <input
                        className="modal_input"
                        value={value.postalCode ?? ""}
                        onChange={(event) => onChange("postalCode", event.target.value)}
                        placeholder="3011 PV"
                        disabled={disabled}
                    />
                </label>
                <label className="planningLocationAddressField">
                    <span className="planningLocationAddressLabel">City</span>
                    <input
                        className="modal_input"
                        value={value.city ?? ""}
                        onChange={(event) => onChange("city", event.target.value)}
                        placeholder="Rotterdam"
                        disabled={disabled}
                    />
                </label>
            </div>
        </div>
    );
}
