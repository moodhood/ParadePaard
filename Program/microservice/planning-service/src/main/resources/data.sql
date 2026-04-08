ALTER TABLE IF EXISTS public.schedule_entries
    ADD COLUMN IF NOT EXISTS timesheet_exported BOOLEAN;

UPDATE public.schedule_entries
SET timesheet_exported = FALSE
WHERE timesheet_exported IS NULL;

ALTER TABLE IF EXISTS public.schedule_entries
    ALTER COLUMN timesheet_exported SET DEFAULT FALSE;

ALTER TABLE IF EXISTS public.schedule_entries
    ALTER COLUMN timesheet_exported SET NOT NULL;
