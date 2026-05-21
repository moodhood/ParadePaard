# My Planning Scheduled Shift Response Cards Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove the standalone “Scheduled shifts” section and empty state from My Planning, and instead show one scheduled-shift response card per pending shift above the accepted shifts list (only when needed).

**Architecture:** Split `MyPlanning.tsx` into a small data/controller wrapper and a pure `MyPlanningView` component. `MyPlanningView` renders conditional scheduled response cards (ASSIGNED) and the accepted list (CONFIRMED) using the existing styles/actions. The wrapper keeps the current data loading and respond behavior.

**Tech Stack:** React + TypeScript + React Router + Vite/Vitest (tests use `renderToStaticMarkup` like existing page tests).

---

## File Structure / Write Map

**Modify**
- `Program/frontend/src/pages/MyPlanning.tsx` (extract `MyPlanningView`, remove scheduled section, render cards above accepted list only when needed)
- `Project Plan/Rundown/ParadePaardRundown.tex` (update “My Planning Page” description + add Change Log entry)

**Create**
- `Program/frontend/src/pages/MyPlanning.test.tsx` (static render tests for the new layout rules)

---

### Task 1: Extract a Pure `MyPlanningView` Component

**Files:**
- Modify: `Program/frontend/src/pages/MyPlanning.tsx`
- Test: `Program/frontend/src/pages/MyPlanning.test.tsx`

- [ ] **Step 1: Refactor `MyPlanning.tsx` to export a view component**

In `Program/frontend/src/pages/MyPlanning.tsx`, introduce an exported `MyPlanningView` that takes pre-filtered lists and callbacks. Keep the existing default export as the data-loading wrapper.

Add this shape (exact names) near the top of the file:

```ts
export type MyPlanningViewProps = {
    activeTab: "upcoming" | "past";
    scheduledItems: EmployeePlanningAssignmentDTO[];
    acceptedItems: EmployeePlanningAssignmentDTO[];
    loading: boolean;
    error: string | null;
    pendingActionId: string | null;
    onTabChange: (next: "upcoming" | "past") => void;
    onDecline: (scheduleEntryId: string) => void;
    onAccept: (scheduleEntryId: string) => void;
    onOpenShift: (scheduleEntryId: string) => void;
};
```

- [ ] **Step 2: Keep the wrapper logic identical**

In the default export component, continue to:

- load planning via `UserServices.getMyPlanning("all")`
- compute `scheduledItems` from `status === "ASSIGNED"`
- compute `acceptedItems` from `status === "CONFIRMED"`
- implement `respond(scheduleEntryId, status)` via `UserServices.respondToMyPlanningAssignment`
- pass handlers into `MyPlanningView`

No behavior changes yet in this step; only move rendering into the view component.

- [ ] **Step 3: Add a minimal render test scaffold**

Create `Program/frontend/src/pages/MyPlanning.test.tsx` with a first sanity test that renders `MyPlanningView` with empty lists and asserts the output contains “Accepted shifts”.

Use the same style as `AdminMessages.test.tsx`:

```tsx
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { MyPlanningView } from "./MyPlanning";

describe("MyPlanning", () => {
    it("renders accepted shifts header", () => {
        const html = renderToStaticMarkup(
            <MyPlanningView
                activeTab="upcoming"
                scheduledItems={[]}
                acceptedItems={[]}
                loading={false}
                error={null}
                pendingActionId={null}
                onTabChange={() => undefined}
                onDecline={() => undefined}
                onAccept={() => undefined}
                onOpenShift={() => undefined}
            />
        );
        expect(html).toContain("Accepted shifts");
    });
});
```

- [ ] **Step 4: Run the test**

Run: `cd Program/frontend && npm test -- --run Program/frontend/src/pages/MyPlanning.test.tsx`

Expected: PASS for the new test file. (If the overall test run fails due to unrelated existing failures, scope to this file only as above.)

- [ ] **Step 5: Commit**

```bash
git add Program/frontend/src/pages/MyPlanning.tsx Program/frontend/src/pages/MyPlanning.test.tsx
git commit -m "Refactor My Planning into testable view component"
```

---

### Task 2: Implement “Scheduled response cards above Accepted” Layout (Approach A)

**Files:**
- Modify: `Program/frontend/src/pages/MyPlanning.tsx`
- Test: `Program/frontend/src/pages/MyPlanning.test.tsx`

- [ ] **Step 1: Remove the Scheduled shifts section from the view**

In `MyPlanningView`, delete the entire `<section>` that currently renders:

- “Scheduled shifts”
- the explanatory text
- the badge with the count
- the empty state message

So the page no longer renders “No scheduled shifts waiting for a response.” at all.

- [ ] **Step 2: Render scheduled response cards only when there are scheduled items**

Above the Accepted shifts section, add:

- If `scheduledItems.length > 0`, render:
  - a list of the existing request cards (`userPlanningRequestCard`) — **one per scheduled shift**
  - keep the same “Decline” / “Accept” buttons on the right
- If `scheduledItems.length === 0`, render nothing (no header, no helper text, no badge).

Reuse the existing card markup from the removed section, but place it above the Accepted shifts section/list.

- [ ] **Step 3: Ensure Accept/Decline behavior remains unchanged**

Hook the buttons to call the view props:

```tsx
onClick={() => onDecline(item.scheduleEntryId)}
onClick={() => onAccept(item.scheduleEntryId)}
```

Do not change how `pendingActionId` disables buttons, and keep the existing “Accepting…” / “Declining…” labels.

- [ ] **Step 4: Update tests for the new rules**

Extend `Program/frontend/src/pages/MyPlanning.test.tsx` with two tests:

1) With `scheduledItems=[]`, assert the HTML does **not** contain:
   - `Scheduled shifts`
   - `No scheduled shifts waiting for a response.`

2) With `scheduledItems=[one ASSIGNED item]`, assert the HTML contains:
   - `Accept`
   - `Decline`
   - the event name for that scheduled item

Define a minimal `EmployeePlanningAssignmentDTO` object consistent with the type used by `MyPlanningView` (copy the needed fields from `UserServices` types).

- [ ] **Step 5: Run the test**

Run: `cd Program/frontend && npm test -- --run Program/frontend/src/pages/MyPlanning.test.tsx`

Expected: PASS.

- [ ] **Step 6: Manual UI check**

Run frontend: `cd Program/frontend && npm run dev`

Verify at `http://localhost:5173/my-planning`:

- With no pending scheduled responses, there is no scheduled section and no empty scheduled text.
- With one or more pending scheduled responses, each appears as a card above accepted shifts with Accept/Decline on the right.

- [ ] **Step 7: Commit**

```bash
git add Program/frontend/src/pages/MyPlanning.tsx Program/frontend/src/pages/MyPlanning.test.tsx
git commit -m "Show scheduled shift response cards above accepted shifts"
```

---

### Task 3: Update Rundown Documentation

**Files:**
- Modify: `Project Plan/Rundown/ParadePaardRundown.tex`

- [ ] **Step 1: Update the My Planning Page description**

In the “My Planning Page” section, update the wording so it no longer describes a visible “Scheduled shifts” section with an always-visible empty state. Replace it with:

- Scheduled shifts that require a response show as cards above accepted shifts (only when present)
- Accept/Decline actions live on the right of each card
- If there are no scheduled responses, the accepted list is shown directly

- [ ] **Step 2: Add Change Log entry**

In `\\section*{Change Log}`, add a new top entry:

`2026 05 20: Updated the My Planning page so scheduled shifts only appear as response cards when a shift needs acceptance or decline.`

- [ ] **Step 3: Commit**

```bash
git add "Project Plan/Rundown/ParadePaardRundown.tex"
git commit -m "Update My Planning docs after scheduled shift layout change"
```

---

### Task 4: Final Verification + Push

**Files:**
- (none)

- [ ] **Step 1: Check git status**

Run: `git status`

Expected: clean working tree.

- [ ] **Step 2: Push**

Run: `git push`

Expected: branch updated on GitHub.

---

## Self-Review Checklist

- Spec coverage: scheduled section removed; scheduled cards only render when items exist; actions on right; accepted list unchanged.
- Placeholder scan: no TBD/TODO; commands and file paths are exact.
- Type consistency: props use `EmployeePlanningAssignmentDTO`; shift ids use `scheduleEntryId`.

