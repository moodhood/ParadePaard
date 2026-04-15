ALTER TABLE IF EXISTS public.schedule_entries
    ADD COLUMN IF NOT EXISTS timesheet_exported BOOLEAN;

UPDATE public.schedule_entries
SET timesheet_exported = FALSE
WHERE timesheet_exported IS NULL;

ALTER TABLE IF EXISTS public.schedule_entries
    ALTER COLUMN timesheet_exported SET DEFAULT FALSE;

ALTER TABLE IF EXISTS public.schedule_entries
    ALTER COLUMN timesheet_exported SET NOT NULL;

ALTER TABLE IF EXISTS public.events
    ADD COLUMN IF NOT EXISTS event_timezone VARCHAR(100);

UPDATE public.events
SET event_timezone = 'UTC'
WHERE event_timezone IS NULL OR trim(event_timezone) = '';

ALTER TABLE IF EXISTS public.events
    ALTER COLUMN event_timezone SET DEFAULT 'UTC';

ALTER TABLE IF EXISTS public.events
    ALTER COLUMN event_timezone SET NOT NULL;
