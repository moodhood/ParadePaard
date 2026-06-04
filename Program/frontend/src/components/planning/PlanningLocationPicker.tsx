import { useEffect, useState } from "react";
import Modal from "../common/Modal";
import { UserServices, type PlanningLocationDTO } from "../../services/user-service/UserServices";
import "../../stylesheets/PlanningLocationPicker.css";

type PlanningLocationPickerProps = {
    label: string;
    value: string;
    savedLocationId?: string | null;
    clientCompanyId?: string | null;
    clientCompanyName?: string | null;
    disabled?: boolean;
    placeholder?: string;
    onChange: (next: { value: string; savedLocationId: string | null }) => void;
    onDirty?: () => void;
};

type CreateLocationDraft = {
    name: string;
    address: string;
    notes: string;
};

const INITIAL_DRAFT: CreateLocationDraft = {
    name: "",
    address: "",
    notes: "",
};

export default function PlanningLocationPicker({
    label,
    value,
    savedLocationId = null,
    clientCompanyId = null,
    clientCompanyName = null,
    disabled = false,
    placeholder = "Optional",
    onChange,
    onDirty,
}: PlanningLocationPickerProps) {
    const [locations, setLocations] = useState<PlanningLocationDTO[]>([]);
    const [loading, setLoading] = useState(false);
    const [loadError, setLoadError] = useState<string | null>(null);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [createDraft, setCreateDraft] = useState<CreateLocationDraft>(INITIAL_DRAFT);
    const [createError, setCreateError] = useState<string | null>(null);
    const [savingCreate, setSavingCreate] = useState(false);

    useEffect(() => {
        let cancelled = false;

        async function loadLocations() {
            try {
                setLoading(true);
                setLoadError(null);
                const data = await UserServices.getPlanningLocations(clientCompanyId);
                if (cancelled) return;
                setLocations(data);
            } catch (err: unknown) {
                if (cancelled) return;
                const message = err instanceof Error ? err.message : "Failed to load saved locations.";
                setLoadError(message);
                setLocations([]);
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        }

        void loadLocations();

        return () => {
            cancelled = true;
        };
    }, [clientCompanyId]);

    function markDirty() {
        onDirty?.();
    }

    function handleValueChange(nextValue: string) {
        const matchedLocation = locations.find(
            (location) => location.name.trim().toLowerCase() === nextValue.trim().toLowerCase()
        );
        onChange({
            value: nextValue,
            savedLocationId: matchedLocation?.locationId ?? null,
        });
        markDirty();
    }

    function handleSelectLocation(location: PlanningLocationDTO) {
        onChange({
            value: location.name,
            savedLocationId: location.locationId,
        });
        markDirty();
    }

    function openCreateModal() {
        setCreateDraft({
            ...INITIAL_DRAFT,
            name: value.trim(),
        });
        setCreateError(null);
        setIsCreateOpen(true);
    }

    async function handleCreateLocation() {
        try {
            setSavingCreate(true);
            setCreateError(null);
            const created = await UserServices.createPlanningLocation({
                name: createDraft.name,
                address: createDraft.address.trim() || null,
                notes: createDraft.notes.trim() || null,
                clientCompanyId,
            });
            const refreshed = await UserServices.getPlanningLocations(clientCompanyId);
            setLocations(refreshed);
            handleSelectLocation(created);
            setIsCreateOpen(false);
            setCreateDraft(INITIAL_DRAFT);
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "Failed to create saved location.";
            setCreateError(message);
        } finally {
            setSavingCreate(false);
        }
    }

    return (
        <>
            <div className="planningLocationField">
                <span className="planningLocationFieldLabel">{label}</span>
                <div className="planningLocationFieldRow">
                    <input
                        className="modal_input"
                        value={value}
                        onChange={(event) => handleValueChange(event.target.value)}
                        placeholder={placeholder}
                        disabled={disabled}
                    />
                    <button
                        type="button"
                        className="planningLocationFieldAdd"
                        onClick={openCreateModal}
                        disabled={disabled}
                    >
                        Add
                    </button>
                </div>

            </div>

            <Modal
                open={isCreateOpen}
                onClose={() => !savingCreate && setIsCreateOpen(false)}
                title="Add location"
                hideDefaultFooter
                maxHeight={560}
                height={560}
            >
                <div className="planningLocationModal">
                    <label className="planningLocationModalField">
                        <span className="planningLocationModalLabel">Location name</span>
                        <input
                            className="modal_input"
                            value={createDraft.name}
                            onChange={(event) => setCreateDraft((current) => ({ ...current, name: event.target.value }))}
                            placeholder="Example: Rotterdam Hall"
                            disabled={savingCreate}
                        />
                    </label>
                    <label className="planningLocationModalField">
                        <span className="planningLocationModalLabel">Address</span>
                        <input
                            className="modal_input"
                            value={createDraft.address}
                            onChange={(event) => setCreateDraft((current) => ({ ...current, address: event.target.value }))}
                            placeholder="Optional"
                            disabled={savingCreate}
                        />
                    </label>
                    <label className="planningLocationModalField">
                        <span className="planningLocationModalLabel">Notes</span>
                        <textarea
                            className="modal_input planningLocationModalTextarea"
                            value={createDraft.notes}
                            onChange={(event) => setCreateDraft((current) => ({ ...current, notes: event.target.value }))}
                            placeholder="Optional notes for planners"
                            disabled={savingCreate}
                        />
                    </label>
                    <div className="planningLocationSuggestionsMeta">
                        {clientCompanyName
                            ? `This location will be prioritized for ${clientCompanyName}.`
                            : "This location will be saved for planning use across the company."}
                    </div>
                    {createError ? (
                        <div className="planningLocationSuggestionsMeta planningLocationSuggestionsMeta--error">
                            {createError}
                        </div>
                    ) : null}
                    <div className="planningLocationModalActions">
                        <button
                            type="button"
                            className="buttonSecondary"
                            onClick={() => setIsCreateOpen(false)}
                            disabled={savingCreate}
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            className="button"
                            onClick={() => void handleCreateLocation()}
                            disabled={savingCreate || !createDraft.name.trim()}
                        >
                            {savingCreate ? "Saving..." : "Save location"}
                        </button>
                    </div>
                </div>
            </Modal>
        </>
    );
}
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            