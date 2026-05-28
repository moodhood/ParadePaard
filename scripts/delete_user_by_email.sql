-- Cascade-delete every row tied to a target user id from the current database.
-- Usage:
--   psql ... -v target_id="'<uuid>'" -f delete_user_by_email.sql
-- The PowerShell runner (delete_bevanrhee.ps1) sets target_id and pipes this in.

\set ON_ERROR_STOP on

BEGIN;

-- Disable foreign-key triggers for this transaction so deletes can happen in any order.
SET LOCAL session_replication_role = replica;

DO $$
DECLARE
    target uuid := :'target_id'::uuid;
    r record;
    deleted bigint;
BEGIN
    IF target IS NULL THEN
        RAISE NOTICE 'target_id is NULL; nothing to do.';
        RETURN;
    END IF;

    RAISE NOTICE 'Sweeping rows tied to user_id %', target;

    FOR r IN
        SELECT table_schema, table_name, column_name
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND column_name IN (
              'user_id',
              'recipient_id',
              'sender_id',
              'employee_id',
              'manager_id',
              'reviewer_id',
              'assigned_to',
              'approver_id',
              'created_by',
              'updated_by',
              'requested_by',
              'owner_id'
          )
    LOOP
        EXECUTE format(
            'DELETE FROM %I.%I WHERE %I::text = %L',
            r.table_schema, r.table_name, r.column_name, target::text
        );
        GET DIAGNOSTICS deleted = ROW_COUNT;
        IF deleted > 0 THEN
            RAISE NOTICE '  %.% (% = %): % row(s)',
                r.table_schema, r.table_name, r.column_name, target, deleted;
        END IF;
    END LOOP;

    -- Also delete from the users table itself if this DB has one keyed by the same uuid.
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'id'
    ) THEN
        EXECUTE format('DELETE FROM public.users WHERE id::text = %L', target::text);
        GET DIAGNOSTICS deleted = ROW_COUNT;
        RAISE NOTICE '  public.users (id = %): % row(s)', target, deleted;
    END IF;

    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'user_id'
    ) THEN
        EXECUTE format('DELETE FROM public.users WHERE user_id::text = %L', target::text);
        GET DIAGNOSTICS deleted = ROW_COUNT;
        RAISE NOTICE '  public.users (user_id = %): % row(s)', target, deleted;
    END IF;
END $$;

COMMIT;
