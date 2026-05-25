# Work History Split Design

## Goal

Split work history into a personal page and a management page, then make the management page configurable for managers.

## User Experience

`/work-history` becomes My Work History. It only loads the signed-in user's timesheets, uses default columns, and does not show a column picker.

`/management/work-history` becomes the management Work History page. It is visible from Management only to users with `CAN_VIEW_ALL_TIMESHEETS`. It loads all timesheets for the company, includes the employee column, allows column selection, and remembers the selected columns on the signed-in user's account.

The management Work History filters are dynamic. The page starts with one filter row where the manager chooses what to filter on, enters the value, and can add more filter rows with an Add filter button. Removing and resetting filters should be obvious from the controls.

Shift detail links should preserve context. Opening a timesheet from My Work History returns to `/work-history`; opening from Management Work History returns to `/management/work-history`.

## Persistence

The selected management columns are saved through the user service on the signed-in user record. The frontend sanitizes saved keys against the currently available columns so removed columns or finance-only columns are not shown to users without permission.

## Documentation

Update `Project Plan/Rundown/ParadePaardRundown.tex` with the visible frontend behavior and add a `2026 05 26` change log entry.
