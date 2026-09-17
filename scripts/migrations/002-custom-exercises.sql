-- Run in Neon SQL Editor, in the database/branch used by DATABASE_URL.
-- Existing public.users contains Clerk IDs.
BEGIN;
CREATE TABLE IF NOT EXISTS public.custom_exercises (
  id uuid PRIMARY KEY,
  owner_id text NOT NULL REFERENCES public.users(id),
  record jsonb NOT NULL CHECK (jsonb_typeof(record) = 'object'),
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.custom_exercises ENABLE ROW LEVEL SECURITY;
CREATE TABLE IF NOT EXISTS public.exercise_media (
  exercise_id uuid PRIMARY KEY REFERENCES public.custom_exercises(id) ON DELETE CASCADE,
  data bytea NOT NULL CHECK (octet_length(data) BETWEEN 1 AND 3145728)
);
ALTER TABLE public.exercise_media ENABLE ROW LEVEL SECURITY;
-- Access is through the trusted server DATABASE_URL role, never browser SQL/REST.
-- The existing table-owner server connection can access this table.
REVOKE ALL ON public.custom_exercises FROM PUBLIC;
REVOKE ALL ON public.exercise_media FROM PUBLIC;
COMMIT;
