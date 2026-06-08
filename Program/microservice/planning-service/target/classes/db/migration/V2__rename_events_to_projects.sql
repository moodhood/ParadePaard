-- Transitional migration: bring older "events" schemas up to the current
-- "projects" model and reconcile the schedule_entries.timesheet_exported and
-- shifts.project_id columns.
--
-- Every statement is written defensively so it is a no-op on databases that
-- are already current (e.g. a fresh database just created by V1). Unlike
-- Spring's built-in SQL script runner, Flyway understands PostgreSQL
-- dollar-quoted ($$) blocks, so the DO blocks below execute as single
-- statements.

-- Ensure schedule_entries.timesheet_exported exists, is backfilled, and is NOT NULL
ALTER TABLE IF EXISTS public.schedule_entries
    ADD COLUMN IF NOT EXISTS timesheet_exported BOOLEAN;

UPDATE public.schedule_entries
SET timesheet_exported = FALSE
WHERE timesheet_exported IS NULL;

ALTER TABLE IF EXISTS public.schedule_entries
    ALTER COLUMN timesheet_exported SET DEFAULT FALSE;

ALTER TABLE IF EXISTS public.schedule_entries
    ALTER COLUMN timesheet_exported SET NOT NULL;

-- Handle events -> projects table rename (only if events table exists and projects doesn't)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'events' AND table_schema = 'public') THEN
        IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'projects' AND table_schema = 'public') THEN
            ALTER TABLE public.events RENAME TO projects;
        END IF;
    END IF;
END $$;

-- Rename event_timezone -> project_timezone in projects (if column exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'event_timezone' AND table_schema = 'public') THEN
        ALTER TABLE public.projects RENAME COLUMN event_timezone TO project_timezone;
    END IF;
END $$;

-- Ensure project_timezone column exists in projects
ALTER TABLE IF EXISTS public.projects
    ADD COLUMN IF NOT EXISTS project_timezone VARCHAR(100);

UPDATE public.projects
SET project_timezone = 'UTC'
WHERE project_timezone IS NULL OR trim(project_timezone) = '';

ALTER TABLE IF EXISTS public.projects
    ALTER COLUMN project_timezone SET DEFAULT 'UTC';

ALTER TABLE IF EXISTS public.projects
    ALTER COLUMN project_timezone SET NOT NULL;

-- Handle event_id -> project_id rename in shifts (if event_id exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'shifts' AND column_name = 'event_id' AND table_schema = 'public') THEN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'shifts' AND column_name = 'project_id' AND table_schema = 'public') THEN
            ALTER TABLE public.shifts RENAME COLUMN event_id TO project_id;
        ELSE
            -- If both columns exist, copy event_id to project_id where project_id is null
            UPDATE public.shifts SET project_id = event_id WHERE project_id IS NULL AND event_id IS NOT NULL;
        END IF;
    END IF;
END $$;

-- Populate any remaining null project_ids with a default value (if needed).
-- This should rarely happen, but ensures data consistency before applying NOT NULL.
DO $$
DECLARE
    default_project_id UUID;
BEGIN
    IF EXISTS (SELECT 1 FROM public.shifts WHERE project_id IS NULL) THEN
        -- Reuse an existing project_id if one is available
        SELECT project_id INTO default_project_id FROM public.shifts WHERE project_id IS NOT NULL LIMIT 1;

        -- Otherwise create a system default project to attach orphaned shifts to
        IF default_project_id IS NULL THEN
            default_project_id := '00000000-0000-0000-0000-000000000001'::UUID;
            INSERT INTO public.projects (project_id, name, company_id, project_timezone, start_date, end_date, status, finalized)
            SELECT default_project_id, 'System Default Project', '00000000-0000-0000-0000-000000000000'::UUID, 'UTC', CURRENT_DATE, CURRENT_DATE, 'ACTIVE', false
            WHERE NOT EXISTS (SELECT 1 FROM public.projects WHERE project_id = default_project_id);
        END IF;

        UPDATE public.shifts SET project_id = default_project_id WHERE project_id IS NULL;
    END IF;
END $$;

-- Enforce NOT NULL on shifts.project_id now that all rows are populated
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'shifts' AND column_name = 'project_id' AND table_schema = 'public') THEN
        ALTER TABLE public.shifts ALTER COLUMN project_id SET NOT NULL;
    END IF;
END $$;

-- Ensure indexes exist (no-ops if already created by V1)
CREATE INDEX IF NOT EXISTS idx_project_company_date_range
    ON public.projects (company_id, start_date, end_date);

CREATE INDEX IF NOT EXISTS idx_shift_project
    ON public.shifts (project_id);

CREATE INDEX IF NOT EXISTS idx_shift_project_start_end
    ON public.shifts (project_id, start_time, end_time);

CREATE INDEX IF NOT EXISTS idx_schedule_shift_status
    ON public.schedule_entries (shift_id, status);
