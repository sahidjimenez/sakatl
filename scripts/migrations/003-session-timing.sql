BEGIN;
ALTER TABLE users ADD COLUMN IF NOT EXISTS auto_pause_minutes integer NOT NULL DEFAULT 15;
ALTER TABLE workout_sessions ADD COLUMN IF NOT EXISTS active_seconds integer;
ALTER TABLE workout_sessions ADD COLUMN IF NOT EXISTS running_since timestamptz;
ALTER TABLE workout_sessions ADD COLUMN IF NOT EXISTS last_activity_at timestamptz;
-- Only backfill rows not migrated yet. Preserve completed durations; pause old open sessions.
UPDATE workout_sessions s SET
  active_seconds = GREATEST(0, EXTRACT(EPOCH FROM (
    COALESCE(s.completed_at, LEAST(now(), COALESCE((SELECT MAX(l.completed_at) FROM set_logs l WHERE l.session_id = s.id), s.started_at) + interval '15 minutes')) - s.started_at
  )))::integer,
  running_since = NULL,
  last_activity_at = COALESCE((SELECT MAX(l.completed_at) FROM set_logs l WHERE l.session_id = s.id), s.started_at)
WHERE active_seconds IS NULL;
ALTER TABLE workout_sessions ALTER COLUMN active_seconds SET DEFAULT 0;
ALTER TABLE workout_sessions ALTER COLUMN active_seconds SET NOT NULL;
ALTER TABLE workout_sessions ALTER COLUMN running_since SET DEFAULT now();
ALTER TABLE workout_sessions ALTER COLUMN last_activity_at SET DEFAULT now();
ALTER TABLE workout_sessions ALTER COLUMN last_activity_at SET NOT NULL;
COMMIT;
