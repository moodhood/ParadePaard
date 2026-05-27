ALTER TABLE IF EXISTS public.schedule_entries
    ADD COLUMN IF NOT EXISTS timesheet_exported BOOLEAN;

UPDATE public.schedule_entries
SET timesheet_exported = FALSE
WHERE timesheet_exported IS NULL;

ALTER TABLE IF EXISTS public.schedule_entries
    ALTER COLUMN timesheet_exported SET DEFAULT FALSE;

ALTER TABLE IF EXISTS public.schedule_entries
    ALTER COLUMN timesheet_exported SET NOT NULL;

-- rename table events -> projects
ALTER TABLE IF EXISTS public.events RENAME TO projects;

-- rename column event_timezone -> project_timezone in projects
ALTER TABLE IF EXISTS public.projects RENAME COLUMN event_timezone TO project_timezone;

ALTER TABLE IF EXISTS public.projects
    ADD COLUMN IF NOT EXISTS project_timezone VARCHAR(100);

UPDATE public.projects
SET project_timezone = 'UTC'
WHERE project_timezone IS NULL OR trim(project_timezone) = '';

ALTER TABLE IF EXISTS public.projects
    ALTER COLUMN project_timezone SET DEFAULT 'UTC';

ALTER TABLE IF EXISTS public.projects
    ALTER COLUMN project_timezone SET NOT NULL;

-- rename column event_id -> project_id in shifts
ALTER TABLE IF EXISTS public.shifts RENAME COLUMN event_id TO project_id;

CREATE INDEX IF NOT EXISTS idx_project_company_date_range
    ON public.projects (company_id, start_date, end_date);

CREATE INDEX IF NOT EXISTS idx_shift_project_start_end
    ON public.shifts (project_id, start_time, end_time);

CREATE INDEX IF NOT EXISTS idx_schedule_shift_status
    ON public.schedule_entries (shift_id, status);
