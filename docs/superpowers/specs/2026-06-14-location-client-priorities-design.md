# Location Client Priorities Design

## Goal

Allow a saved planning location to be manually prioritized for multiple clients and make project and shift location fields searchable autocomplete controls.

## Data Model

`planning_client_location_usage` remains the shared relationship for client-specific location ranking. A new `manually_prioritized` boolean distinguishes an administrator's checkbox choice from automatic `last_used_at` history.

Unchecking a client clears only `manually_prioritized`. The usage row and its last-used timestamp remain available for ranking. Rows that have neither manual priority nor usage history may be removed.

## API

Location save requests use `prioritizedClientCompanyIds`, an array of client UUIDs. Location responses include the same array for management forms.

When locations are requested for a selected client, the service returns every company location. Ordering is:

1. manually prioritized for the selected client;
2. previously used for the selected client, newest first;
3. all remaining saved locations alphabetically.

Without a selected client, all locations are returned alphabetically.

## Management UI

The location modal replaces the single client select with a checkbox list. Existing selections are populated from `prioritizedClientCompanyIds`, and saving synchronizes the full set.

## Project And Shift Picker

The shared `PlanningLocationPicker` becomes an accessible autocomplete combobox. Typing filters by location name and formatted address. A saved location is selected only through click, Enter, or keyboard navigation; typing alone never silently selects the first match.

All locations remain searchable regardless of client. The selected client's prioritized and recently used locations appear first because the API supplies ranked results. Free text remains valid when the user does not choose a saved suggestion.

## Verification

Backend service tests cover multi-client synchronization, retained usage history, response IDs, and ordering. Frontend tests cover checkbox rendering, text filtering, and explicit mouse/keyboard selection. The focused frontend and planning-service test suites must pass, followed by browser verification of the management and planning forms.
