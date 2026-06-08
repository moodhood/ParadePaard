import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import Navbar from "../components/Navbar";
import PageBack from "../components/PageBack";
import PrimaryNav from "../components/PrimaryNav";
import Card from "../components/common/Card";
import Modal from "../components/common/Modal";
import PlanningLocationAddressFields from "../components/planning/PlanningLocationAddressFields";
import {
    UserServices,
    type PlanningClientCompanyDTO,
    type PlanningLocationDTO,
    type PlanningLocationSaveDTO,
} from "../services/user-service/UserServices";
import {
    buildPlanningLocationAddressLines,
    buildPlanningLocationSearchText,
} from "../utils/planningLocationAddress";
import "../stylesheets/AdminDashboard.css";
import "../stylesheets/AdminLists.css";
import "../stylesheets/AdminUsers.css";
import "../stylesheets/Settings.css";
import "../stylesheets/AdminPlanningLocations.css";

const EMPTY_LOCATION_DRAFT: PlanningLocationSaveDTO = {
    name: "",
    streetName: "",
    houseNumber: "",
    houseNumberSuffix: "",
    postalCode: "",
    city: "",
    notes: "",
    clientCompanyId: null,
};

function SuccessCheckIcon() {
    return (
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
                d="M20 6 9 17l-5-5"
                stroke="currentColor"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}

function LocationPinIcon() {
    return (
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
                d="M12 21s-6.5-5.4-6.5-10.2A6.5 6.5 0 0 1 12 4.3a6.5 6.5 0 0 1 6.5 6.5C18.5 15.6 12 21 12 21Z"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinejoin="round"
            />
            <circle cx="12" cy="10.6" r="2.4" stroke="currentColor" strokeWidth="1.7" />
        </svg>
    );
}

function formatLastUsed(value?: string | null): string | null {
    if (!value) return null;
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return null;
    return new Intl.DateTimeFormat("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
    }).format(date);
}

export default function AdminPlanningLocations() {
    const [clients, setClients] = useState<PlanningClientCompanyDTO[]>([]);
    const [locations, setLocations] = useState<PlanningLocationDTO[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [saveError, setSaveError] = useState<string | null>(null);
    const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [sortClientId, setSortClientId] = useState("");
    const [editingLocation, setEditingLocation] = useState<PlanningLocationDTO | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [draft, setDraft] = useState<PlanningLocationSaveDTO>(EMPTY_LOCATION_DRAFT);

    const selectedClient = useMemo(
        () => clients.find((client) => client.clientCompanyId === sortClientId) ?? null,
        [clients, sortClientId]
    );

    const loadClients = useCallback(async () => {
        const data = await UserServices.getPlanningClients();
        setClients(data);
    }, []);

    const loadLocations = useCallback(async (clientCompanyId?: string | null) => {
        try {
            setLoading(true);
            setError(null);
            const data = await UserServices.getPlanningLocations(clientCompanyId || null);
            setLocations(data);
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "Failed to load saved locations.";
            setError(message);
            setLocations([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        void loadClients().catch((err: unknown) => {
            const message = err instanceof Error ? err.message : "Failed to load client companies.";
            setError(message);
        });
    }, [loadClients]);

    useEffect(() => {
        void loadLocations(sortClientId || null);
    }, [loadLocations, sortClientId]);

    useEffect(() => {
        if (!saveSuccess) return;
        const timeoutId = window.setTimeout(() => setSaveSuccess(null), 3200);
        return () => window.clearTimeout(timeoutId);
    }, [saveSuccess]);

    const visibleLocations = useMemo(() => {
        const term = searchTerm.trim().toLowerCase();
        if (!term) return locations;

        return locations.filter((location) =>
            [location.name, buildPlanningLocationSearchText(location), location.notes]
                .filter(Boolean)
                .some((value) => value!.toLowerCase().includes(term))
        );
    }, [locations, searchTerm]);

    function resetDraft(nextClientId?: string | null) {
        setDraft({
            ...EMPTY_LOCATION_DRAFT,
            clientCompanyId: nextClientId ?? (sortClientId || null),
        });
    }

    function openCreateModal() {
        setEditingLocation(null);
        resetDraft(sortClientId || null);
        setSaveError(null);
        setIsModalOpen(true);
    }

    function openEditModal(location: PlanningLocationDTO) {
        setEditingLocation(location);
        setDraft({
            name: location.name ?? "",
            streetName: location.streetName ?? "",
            houseNumber: location.houseNumber ?? "",
            houseNumberSuffix: location.houseNumberSuffix ?? "",
            postalCode: location.postalCode ?? "",
            city: location.city ?? "",
            notes: location.notes ?? "",
            clientCompanyId: location.preferredForClient ? sortClientId || null : null,
        });
        setSaveError(null);
        setIsModalOpen(true);
    }

    function closeModal() {
        if (saving) return;
        setIsModalOpen(false);
        setEditingLocation(null);
        setSaveError(null);
        resetDraft(null);
    }

    async function handleSave(event: FormEvent) {
        event.preventDefault();
        if (!draft.name?.trim()) {
            setSaveError("Location name is required.");
            return;
        }

        const payload: PlanningLocationSaveDTO = {
            name: draft.name.trim(),
            streetName: draft.streetName?.trim() || null,
            houseNumber: draft.houseNumber?.trim() || null,
            houseNumberSuffix: draft.houseNumberSuffix?.trim() || null,
            postalCode: draft.postalCode?.trim() || null,
            city: draft.city?.trim() || null,
            notes: draft.notes?.trim() || null,
            clientCompanyId: draft.clientCompanyId?.trim() || null,
        };

        try {
            setSaving(true);
            setSaveError(null);
            if (editingLocation) {
                await UserServices.updatePlanningLocation(editingLocation.locationId, payload);
                setSaveSuccess("Location updated.");
            } else {
                await UserServices.createPlanningLocation(payload);
                setSaveSuccess("Location added.");
            }
            setIsModalOpen(false);
            setEditingLocation(null);
            await loadLocations(sortClientId || null);
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "Failed to save location.";
            setSaveError(message);
        } finally {
            setSaving(false);
        }
    }

    async function handleDelete(location: PlanningLocationDTO) {
        const confirmed = window.confirm(`Delete location "${location.name}"?`);
        if (!confirmed) return;

        try {
            setSaving(true);
            setError(null);
            await UserServices.deletePlanningLocation(location.locationId);
            setSaveSuccess("Location deleted.");
            if (editingLocation?.locationId === location.locationId) {
                setIsModalOpen(false);
                setEditingLocation(null);
            }
            await loadLocations(sortClientId || null);
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "Failed to delete location.";
            setError(message);
        } finally {
            setSaving(false);
        }
    }

    const showGrid = !loading && !error && visibleLocations.length > 0;
    const showEmpty = !loading && !error && visibleLocations.length === 0;
    const hasAnyLocations = locations.length > 0;

    return (
        <>
            <Navbar />
            <div className="adminDashboardPage">
                <div className="pageShell">
                    <PrimaryNav />
                    <div className="pageShellContent">
                        <header className="pageHeader">
                            <PageBack to="/management" />
                            <h1 className="pageTitle">Planning locations</h1>
                            <p className="pageSubtitle">
                                Save reusable project and shift locations, then sort them around each client&apos;s
                                recent work.
                            </p>
                        </header>

                        <div className="adminDashboardCard">
                            <Card
                                title="Saved locations"
                                right={(
                                    <div className="adminUsersToolbar planningLocationsToolbar">
                                        <span className="adminUsersCount">
                                            {hasAnyLocations
                                                ? `${visibleLocations.length} of ${locations.length} shown`
                                                : "No locations yet"}
                                            {selectedClient ? ` · ranked for ${selectedClient.name}` : ""}
                                        </span>
                                        <input
                                            className="adminUsersSearchInput"
                                            type="search"
                                            value={searchTerm}
                                            onChange={(event) => setSearchTerm(event.target.value)}
                                            placeholder="Search location, city, postal code, or notes"
                                            disabled={loading}
                                        />
                                        <select
                                            className="uiSelect planningLocationsClientSelect"
                                            value={sortClientId}
                                            onChange={(event) => setSortClientId(event.target.value)}
                                            disabled={loading}
                                            aria-label="Sort for client"
                                        >
                                            <option value="">All clients</option>
                                            {clients.map((client) => (
                                                <option key={client.clientCompanyId} value={client.clientCompanyId}>
                                                    {client.name}
                                                </option>
                                            ))}
                                        </select>
                                        <button
                                            type="button"
                                            className="button"
                                            onClick={openCreateModal}
                                            disabled={saving}
                                        >
                                            Add location
                                        </button>
                                    </div>
                                )}
                            >
                                {error ? <div className="planningLocationsError">{error}</div> : null}
                                {loading ? (
                                    <div className="planningLocationsState">Loading locations…</div>
                                ) : null}

                                {showEmpty ? (
                                    <div className="planningLocationsEmpty">
                                        <span className="planningLocationsEmptyIcon">
                                            <LocationPinIcon />
                                        </span>
                                        <h3>
                                            {hasAnyLocations
                                                ? "No locations match this view"
                                                : "No saved locations yet"}
                                        </h3>
                                        <p>
                                            {hasAnyLocations
                                                ? "Try a different search term or client filter."
                                                : "Add a reusable location to speed up project and shift planning."}
                                        </p>
                                        {!hasAnyLocations ? (
                                            <button type="button" className="button" onClick={openCreateModal}>
                                                Add your first location
                                            </button>
                                        ) : null}
                                    </div>
                                ) : null}

                                {showGrid ? (
                                    <div className="planningLocationsGrid">
                                        {visibleLocations.map((location) => {
                                            const addressLines = buildPlanningLocationAddressLines(location);

                                            return (
                                            <article className="planningLocationsCard" key={location.locationId}>
                                                <div className="planningLocationsCardHeader">
                                                    <div className="planningLocationsCardHeading">
                                                        <span className="planningLocationsCardPin" aria-hidden="true">
                                                            <LocationPinIcon />
                                                        </span>
                                                        <h2>{location.name}</h2>
                                                    </div>
                                                    <div className="planningLocationsCardActions">
                                                        <button
                                                            type="button"
                                                            className="buttonSecondary"
                                                            onClick={() => openEditModal(location)}
                                                            disabled={saving}
                                                        >
                                                            Edit
                                                        </button>
                                                        <button
                                                            type="button"
                                                            className="buttonDanger"
                                                            onClick={() => void handleDelete(location)}
                                                            disabled={saving}
                                                        >
                                                            Delete
                                                        </button>
                                                    </div>
                                                </div>

                                                {location.preferredForClient || formatLastUsed(location.lastUsedAtForClient) ? (
                                                    <div className="planningLocationsCardBadges">
                                                        {location.preferredForClient ? (
                                                            <span className="planningLocationsBadge planningLocationsBadge--preferred">
                                                                Top for client
                                                            </span>
                                                        ) : null}
                                                        {formatLastUsed(location.lastUsedAtForClient) ? (
                                                            <span className="planningLocationsBadge">
                                                                Last used {formatLastUsed(location.lastUsedAtForClient)}
                                                            </span>
                                                        ) : null}
                                                    </div>
                                                ) : null}

                                                <dl className="planningLocationsMetaList">
                                                    <div>
                                                        <dt>Address</dt>
                                                        <dd
                                                            className={
                                                                addressLines.line1 || addressLines.line2
                                                                    ? "planningLocationsAddressValue"
                                                                    : "planningLocationsMuted"
                                                            }
                                                        >
                                                            {addressLines.line1 || addressLines.line2 ? (
                                                                <>
                                                                    {addressLines.line1 ? <span>{addressLines.line1}</span> : null}
                                                                    {addressLines.line2 ? <span>{addressLines.line2}</span> : null}
                                                                </>
                                                            ) : (
                                                                "No address added"
                                                            )}
                                                        </dd>
                                                    </div>
                                                    <div>
                                                        <dt>Notes</dt>
                                                        <dd className={location.notes?.trim() ? "" : "planningLocationsMuted"}>
                                                            {location.notes?.trim() || "No notes added"}
                                                        </dd>
                                                    </div>
                                                </dl>
                                            </article>
                                            );
                                        })}
                                    </div>
                                ) : null}
                            </Card>
                        </div>
                    </div>
                </div>
            </div>

            {saveSuccess ? (
                <div className="planningLocationsToast" role="status" aria-live="polite">
                    <span className="planningLocationsToastIcon">
                        <SuccessCheckIcon />
                    </span>
                    <div className="planningLocationsToastBody">
                        <span className="planningLocationsToastTitle">Locations updated</span>
                        <span className="planningLocationsToastMessage">{saveSuccess}</span>
                    </div>
                </div>
            ) : null}

            <Modal
                open={isModalOpen}
                onClose={closeModal}
                title={editingLocation ? "Edit location" : "Add location"}
                hideDefaultFooter
                maxHeight={720}
            >
                <form className="planningLocationsModal" onSubmit={(event) => void handleSave(event)}>
                    <label className="planningLocationsModalField">
                        <span>Location name</span>
                        <input
                            className="modal_input"
                            value={draft.name ?? ""}
                            onChange={(event) => {
                                setDraft((current) => ({ ...current, name: event.target.value }));
                                if (saveError) setSaveError(null);
                            }}
                            placeholder="Example: Rotterdam Hall"
                            disabled={saving}
                        />
                    </label>
                    <PlanningLocationAddressFields
                        value={draft}
                        onChange={(field, nextValue) => {
                            setDraft((current) => ({ ...current, [field]: nextValue }));
                            if (saveError) setSaveError(null);
                        }}
                        disabled={saving}
                    />
                    <label className="planningLocationsModalField">
                        <span>Notes</span>
                        <textarea
                            className="modal_input planningLocationsTextarea"
                            value={draft.notes ?? ""}
                            onChange={(event) => {
                                setDraft((current) => ({ ...current, notes: event.target.value }));
                                if (saveError) setSaveError(null);
                            }}
                            placeholder="Optional guidance for planners"
                            disabled={saving}
                        />
                    </label>
                    <label className="planningLocationsModalField">
                        <span>Prioritize for client</span>
                        <select
                            className="modal_input"
                            value={draft.clientCompanyId ?? ""}
                            onChange={(event) => {
                                setDraft((current) => ({ ...current, clientCompanyId: event.target.value || null }));
                                if (saveError) setSaveError(null);
                            }}
                            disabled={saving}
                        >
                            <option value="">No specific client</option>
                            {clients.map((client) => (
                                <option key={client.clientCompanyId} value={client.clientCompanyId}>
                                    {client.name}
                                </option>
                            ))}
                        </select>
                    </label>
                    <div className="planningLocationsModalHint">
                        Choosing a client pushes this location to the top of that client&apos;s picker the next time a
                        project or shift is created.
                    </div>
                    {saveError ? <div className="planningLocationsError">{saveError}</div> : null}
                    <div className="planningLocationsModalActions">
                        <button type="button" className="buttonSecondary" onClick={closeModal} disabled={saving}>
                            Cancel
                        </button>
                        <button type="submit" className="button" disabled={saving || !draft.name?.trim()}>
                            {saving ? "Saving..." : editingLocation ? "Save location" : "Add location"}
                        </button>
                    </div>
                </form>
            </Modal>
        </>
    );
}
