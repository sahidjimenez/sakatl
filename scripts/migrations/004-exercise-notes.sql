BEGIN;
CREATE TABLE IF NOT EXISTS exercise_notes (
  user_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  exercise_id text NOT NULL,
  note text NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, exercise_id),
  CONSTRAINT exercise_notes_length CHECK (char_length(note) BETWEEN 1 AND 2000)
);
ALTER TABLE exercise_notes ENABLE ROW LEVEL SECURITY;
COMMIT;
