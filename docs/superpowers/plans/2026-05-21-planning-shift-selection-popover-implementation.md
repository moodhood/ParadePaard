# Planning Shift Selection + Popover Actions Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** In `/management/planning` Shifts mode, add multi-selectable shift cells with a compact anchored popover menu and an inline “plan people” panel that can schedule multiple users to multiple selected shifts, without refreshing the page. Also default the page to Shifts mode.

**Architecture:** Extend `AdminPlanningOverview.tsx` to maintain a selection set of shift keys and an anchored popover state. Shift cards gain a top-left check icon for toggling selection and Shift+click adds to selection. Clicking the card body opens the popover (menu or planning panel). Planning uses existing `UserServices.createPlanningAssignment` and `UserServices.updatePlanningAssignment` patterns, while loading `users` on-demand and using `includeAllocationDetails=true` when fetching the overview so duplicates can be skipped. Styling is added to `AdminPlanningOverview.css`.

**Tech Stack:** React + TypeScript + existing `UserServices` axios layer + CSS (no new libraries).

---

## File Structure / Write Map

**Modify**
- `Program/frontend/src/pages/AdminPlanningOverview.tsx` (default Shifts mode, selection state, popover + bulk plan panel)
- `Program/frontend/src/stylesheets/AdminPlanningOverview.css` (selected state, check icon placement, popover styling)
- `Program/frontend/src/services/user-service/GetPlanningOverview.ts` (ensure query supports `includeAllocationDetails`)
- `Project Plan/Rundown/ParadePaardRundown.tex` (update Planning Overview description + Change Log)

**Create**
- `Program/frontend/src/pages/AdminPlanningOverview.test.tsx` (static render tests for selection UI + menu labels)

---

### Task 1: Default Planning Overview to Shifts Mode

**Files:**
- Modify: `Program/frontend/src/pages/AdminPlanningOverview.tsx`

- [ ] **Step 1: Change default `plannerMode`**

Find:

```ts
const [plannerMode, setPlannerMode] = useState<PlannerMode>("events");
```

Change to:

```ts
const [plannerMode, setPlannerMode] = useState<PlannerMode>("shifts");
```

- [ ] **Step 2: Quick manual check**

Run: `cd Program/frontend && npm run dev`

Open: `http://localhost:5173/management/planning`

Expected: The Shifts toggle is active by default.

- [ ] **Step 3: Commit**

```bash
git add Program/frontend/src/pages/AdminPlanningOverview.tsx
git commit -m "Default planning overview to shifts mode"
```

---

### Task 2: Add Shift Selection State + Check Icon Toggle (Shifts mode only)

**Files:**
- Modify: `Program/frontend/src/pages/AdminPlanningOverview.tsx`
- Modify: `Program/frontend/src/stylesheets/AdminPlanningOverview.css`
- Test: `Program/frontend/src/pages/AdminPlanningOverview.test.tsx`

- [ ] **Step 1: Add selection types**

In `AdminPlanningOverview.tsx`, define a shift selection key and helpers near the top:

```ts
type ShiftSelectionKey = {
  day: string;
  shiftId: string;
  eventId: string;
};

function toShiftKeyString(key: ShiftSelectionKey): string {
  return `${key.day}:${key.shiftId}:${key.eventId}`;
}
```

Parse the key from the existing `PlannerEntry` id format in shifts mode (currently `id: ${day.day}-${shift.shiftId}`) and the `href` querystring `?shift=` + event id segment.

- [ ] **Step 2: Store selection in state**

Add:

```ts
const [selectedShiftKeys, setSelectedShiftKeys] = useState<Set<string>>(() => new Set());
```

Add helpers:
- `toggleShiftSelected(keyString)`
- `addShiftSelected(keyString)`
- `replaceSelectionWith(keyString)`

- [ ] **Step 3: Render check icon in shift cards**

In `renderPlannerEntry`, when `plannerMode === "shifts"`, render a small top-left check icon button layered inside the shift card:
- `position: absolute; top: 6px; left: 6px;`
- Clicking it toggles selection and `event.stopPropagation()`

Ensure labels are English and accessible:
- `aria-label={isSelected ? "Unselect shift" : "Select shift"}`

- [ ] **Step 4: Add selected visual style**

In `AdminPlanningOverview.css`, add:
- `.planningEntryCard--selected` stronger border + subtle highlight
- `.planningEntrySelectButton` styles for the check icon
- `.planningEntrySelectButton--checked` checked state

- [ ] **Step 5: Add minimal render tests**

Create `Program/frontend/src/pages/AdminPlanningOverview.test.tsx` using `renderToStaticMarkup`, mocking `Navbar`/`PrimaryNav` if needed. Add tests that:
- Render a shift entry in shifts mode and assert the check icon button exists (by aria-label).
- Assert the menu labels are English once implemented (placeholder for now if needed, but avoid TODOs—implement after popover is added).

- [ ] **Step 6: Commit**

```bash
git add Program/frontend/src/pages/AdminPlanningOverview.tsx Program/frontend/src/stylesheets/AdminPlanningOverview.css Program/frontend/src/pages/AdminPlanningOverview.test.tsx
git commit -m "Add shift selection toggle UI in planning overview"
```

---

### Task 3: Shift+Click Multi-Select + Click-to-Open Popover Menu

**Files:**
- Modify: `Program/frontend/src/pages/AdminPlanningOverview.tsx`
- Modify: `Program/frontend/src/stylesheets/AdminPlanningOverview.css`
- Test: `Program/frontend/src/pages/AdminPlanningOverview.test.tsx`

- [ ] **Step 1: Popover state**

Add state for an anchored popover:

```ts
type PlanningPopoverMode = "menu" | "plan";
type PlanningPopoverState = {
  open: boolean;
  mode: PlanningPopoverMode;
  anchorRect: DOMRect | null;
  anchorKeyString: string | null;
};
```

Store it in `useState`.

- [ ] **Step 2: Clicking shift card body opens popover**

Update `renderPlannerEntry` for shifts mode:
- On click:
  - If `event.shiftKey` is true: add to selection
  - Else: if clicked card not selected, replace selection with it; if already selected, keep selection
  - Open popover in `"menu"` mode anchored to the clicked card’s bounding rect

Do **not** open popover in events mode (keep existing navigation).

- [ ] **Step 3: Outside click closes popover**

Implement a `useEffect` that attaches a `pointerdown` listener when popover open:
- If click target is outside popover container, close popover
- Do not clear selection

- [ ] **Step 4: Render compact menu**

Render a small popover component (inline JSX in the same file) with menu items:
- Single selection:
  - `Plan someone in`
  - `View shift details`
- Multi selection:
  - `Plan someone in`
  - `View selected shifts`

Menu styling matches screenshot vibe:
- subtle border + shadow
- compact rows + hover state
- optional small arrow indicator near anchor (CSS pseudo-element)

- [ ] **Step 5: Hook view actions**

Single selection “View shift details” navigates to `/management/planning/events/<eventId>?shift=<shiftId>` based on the selected key.

Multi “View selected shifts” opens a small modal listing selected shifts and providing per-row “View” actions.

- [ ] **Step 6: Update tests**

Add tests verifying:
- “Plan someone in” label exists in rendered popover markup (menu)
- “View selected shifts” appears when selection count > 1

- [ ] **Step 7: Commit**

```bash
git add Program/frontend/src/pages/AdminPlanningOverview.tsx Program/frontend/src/stylesheets/AdminPlanningOverview.css Program/frontend/src/pages/AdminPlanningOverview.test.tsx
git commit -m "Add shift popover actions and multi-select behavior"
```

---

### Task 4: Inline “Plan people” Panel + Bulk Scheduling

**Files:**
- Modify: `Program/frontend/src/pages/AdminPlanningOverview.tsx`
- Modify: `Program/frontend/src/services/user-service/GetPlanningOverview.ts`
- Test: `Program/frontend/src/pages/AdminPlanningOverview.test.tsx`

- [ ] **Step 1: Ensure allocation details are available**

In `AdminPlanningOverview.tsx`, when loading the overview for Shifts mode, call `UserServices.getPlanningOverview` (or the existing wrapper used in this page) with:
- `includeAllocationDetails: true`

If the page currently calls a service wrapper that doesn’t pass this option, update it accordingly.

- [ ] **Step 2: Load active users for the planning panel**

Add user loading state (similar to `AdminPlanningEventDetail.tsx` patterns):
- Load users lazily when the popover enters `"plan"` mode
- Use `UserServices.getUsers()` (or the existing users page endpoint wrapper) and filter `status === "ACTIVE"`

- [ ] **Step 3: Planning panel UI**

In popover `"plan"` mode render:
- Title: `Plan people to N shifts`
- Search input
- Scroll list of active users (name + email)
- Checkbox selection for multiple users
- Primary button: `Plan selected (X)`
- Secondary: `Back` to menu

- [ ] **Step 4: Bulk planning logic**

On submit:
- For each selected shift:
  - Determine existing allocations (by `userId`) from overview data
  - For each selected user:
    - If already exists: skip and count as existing
    - Else: call `UserServices.createPlanningAssignment(shiftId, { userId, status: "ASSIGNED" })`

After completion:
- Re-fetch planning overview data
- Keep shift selection
- Show success summary: `Planned A assignments (B already existed)`

Handle errors with a concise error message inside the panel.

- [ ] **Step 5: Update tests**

Add tests that the planning panel contains:
- `Plan people to`
- `Plan selected`

- [ ] **Step 6: Commit**

```bash
git add Program/frontend/src/pages/AdminPlanningOverview.tsx Program/frontend/src/services/user-service/GetPlanningOverview.ts Program/frontend/src/pages/AdminPlanningOverview.test.tsx
git commit -m "Add bulk plan people panel for selected planning shifts"
```

---

### Task 5: Documentation Updates + Final Push

**Files:**
- Modify: `Project Plan/Rundown/ParadePaardRundown.tex`

- [ ] **Step 1: Update Planning Overview description**

Update the Planning Overview section to describe:
- Shifts mode default
- Shift selection (check icon, Shift+click)
- Popover actions and bulk planning panel

- [ ] **Step 2: Add Change Log entry**

Add a new top entry (YYYY MM DD):
- `2026 05 21: Made planning shift cards selectable with a compact popover menu and bulk plan-people panel.`

- [ ] **Step 3: Commit + push**

```bash
git add "Project Plan/Rundown/ParadePaardRundown.tex"
git commit -m "Update planning overview docs after shift selection work"
git push
```

---

## Verification Checklist

- In Shifts mode:
  - Clicking check icon selects/unselects without opening menu
  - Shift+click adds to selection
  - Clicking card body opens menu near card
  - Clicking outside closes menu, selection remains visible
  - Multi-select shows “View selected shifts”
  - “Plan someone in” allows selecting multiple users and plans them into all selected shifts
- In Events mode:
  - Old click-to-navigate behavior remains unchanged

