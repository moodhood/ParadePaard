import { useEffect, useId, useMemo, useState, type KeyboardEvent } from "react";
import Modal from "../common/Modal";
import PlanningLocationAddressFields from "./PlanningLocationAddressFields";
import { UserServices, type PlanningLocationDTO } from "../../services/user-service/UserServices";
import {
    buildPlanningLocationAddressLines,
    buildPlanningLocationSearchText,
} from "../../utils/planningLocationAddress";
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
    streetName: string;
    houseNumber: string;
    houseNumberSuffix: string;
    postalCode: string;
    city: string;
    notes: string;
};

const INITIAL_DRAFT: CreateLocationDraft = {
    name: "",
    streetName: "",
    houseNumber: "",
    houseNumberSuffix: "",
    postalCode: "",
    city: "",
    notes: "",
};

export function filterPlanningLocationSuggestions(
    locations: PlanningLocationDTO[],
    query: string
): PlanningLocationDTO[] {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return locations;

    return locations.filter((location) =>
        [location.name, buildPlanningLocationSearchText(location)]
            .filter(Boolean)
            .some((value) => value!.toLowerCase().includes(normalizedQuery))
    );
}

export function movePlanningLocationSuggestionIndex(
    currentIndex: number,
    key: "ArrowDown" | "ArrowUp",
    suggestionCount: number
): number {
    if (suggestionCount <= 0) return -1;
    if (key === "ArrowDown") return (currentIndex + 1 + suggestionCount) % suggestionCount;
    return (currentIndex - 1 + suggestionCount) % suggestionCount;
}

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
    const [suggestionsOpen, setSuggestionsOpen] = useState(false);
    const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(-1);
    const listboxId = useId();
    const filteredLocations = useMemo(
        () => filterPlanningLocationSuggestions(locations, value).slice(0, 10),
        [locations, value]
    );

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
        onChange({
            value: nextValue,
            savedLocationId: null,
        });
        setSuggestionsOpen(true);
        setActiveSuggestionIndex(-1);
        markDirty();
    }

    function handleSelectLocation(location: PlanningLocationDTO) {
        onChange({
            value: location.name,
            savedLocationId: location.locationId,
        });
        setSuggestionsOpen(false);
        setActiveSuggestionIndex(-1);
        markDirty();
    }

    function handleInputKeyDown(event: KeyboardEvent<HTMLInputElement>) {
        const navigationKey = event.key === "ArrowDown" || event.key === "ArrowUp" ? event.key : null;
        if (navigationKey) {
            event.preventDefault();
            setSuggestionsOpen(true);
            setActiveSuggestionIndex((currentIndex) =>
                movePlanningLocationSuggestionIndex(currentIndex, navigationKey, filteredLocations.length)
            );
            return;
        }
        if (event.key === "Enter" && suggestionsOpen && activeSuggestionIndex >= 0) {
            const selectedLocation = filteredLocations[activeSuggestionIndex];
            if (selectedLocation) {
                event.preventDefault();
                handleSelectLocation(selectedLocation);
            }
            return;
        }
        if (event.key === "Escape") {
            setSuggestionsOpen(false);
            setActiveSuggestionIndex(-1);
        }
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
                streetName: createDraft.streetName.trim() || null,
                houseNumber: createDraft.houseNumber.trim() || null,
                houseNumberSuffix: createDraft.houseNumberSuffix.trim() || null,
                postalCode: createDraft.postalCode.trim() || null,
                city: createDraft.city.trim() || null,
                notes: createDraft.notes.trim() || null,
                prioritizedClientCompanyIds: clientCompanyId ? [clientCompanyId] : [],
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
                    <div className="planningLocationCombobox">
                        <input
                            className="modal_input"
                            value={value}
                            onChange={(event) => handleValueChange(event.target.value)}
                            onFocus={() => setSuggestionsOpen(true)}
                            onBlur={() => window.setTimeout(() => setSuggestionsOpen(false), 100)}
                            onKeyDown={handleInputKeyDown}
                            placeholder={placeholder}
                            disabled={disabled}
                            role="combobox"
                            aria-autocomplete="list"
                            aria-expanded={suggestionsOpen}
                            aria-controls={listboxId}
                            aria-activedescendant={
                                suggestionsOpen && activeSuggestionIndex >= 0
                                    ? `${listboxId}-option-${activeSuggestionIndex}`
                                    : undefined
                            }
                        />
                        {suggestionsOpen && !loading ? (
                            <div className="planningLocationSuggestions" id={listboxId} role="listbox">
                                {filteredLocations.length > 0 ? filteredLocations.map((location, index) => {
                                    const address = buildPlanningLocationAddressLines(location);
                                    const addressText = [address.line1, address.line2].filter(Boolean).join(", ");
                                    return (
                                        <button
                                            type="button"
                                            id={`${listboxId}-option-${index}`}
                                            className={`planningLocationSuggestion${
                                                index === activeSuggestionIndex ? " planningLocationSuggestion--active" : ""
                                            }`}
                                            role="option"
                                            aria-selected={location.locationId === savedLocationId}
                                            key={location.locationId}
                                            onMouseDown={(event) => {
                                                event.preventDefault();
                                                handleSelectLocation(location);
                                            }}
                                        >
                                            <span className="planningLocationSuggestionName">{location.name}</span>
                                            {addressText ? (
                                                <span className="planningLocationSuggestionAddress">{addressText}</span>
                                            ) : null}
                                        </button>
                                    );
                                }) : (
                                    <div className="planningLocationSuggestionEmpty">No matching saved locations.</div>
                                )}
                            </div>
                        ) : null}
                    </div>
                    <button
                        type="button"
                        className="planningLocationFieldAdd"
                        onClick={openCreateModal}
                        disabled={disabled}
                    >
                        Add
                    </button>
                </div>
                {loading ? <div className="planningLocationFieldMeta">Loading saved locations...</div> : null}
                {loadError ? <div className="planningLocationFieldMeta planningLocationFieldMeta--error">{loadError}</div> : null}
            </div>

            <Modal
                open={isCreateOpen}
                onClose={() => !savingCreate && setIsCreateOpen(false)}
                title="Add location"
                hideDefaultFooter
                maxHeight={700}
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
                    <PlanningLocationAddressFields
                        value={createDraft}
                        onChange={(field, nextValue) =>
                            setCreateDraft((current) => ({ ...current, [field]: nextValue }))
                        }
                        disabled={savingCreate}
                    />
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
