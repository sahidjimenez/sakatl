CREATE TABLE IF NOT EXISTS billing_accounts (
 user_id text PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
 customer_id text UNIQUE,
 routine_limit integer NOT NULL DEFAULT 4 CHECK (routine_limit >= 4),
 created_at timestamptz NOT NULL DEFAULT now()
);
-- Preserve the capacity already used by existing members. Never remove routines.
INSERT INTO billing_accounts(user_id, routine_limit)
SELECT u.id, GREATEST(4, count(r.id)::integer) FROM users u LEFT JOIN routines r ON r.owner_id=u.id
GROUP BY u.id ON CONFLICT(user_id) DO NOTHING;
CREATE TABLE IF NOT EXISTS billing_subscriptions (
 id text PRIMARY KEY,
 user_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
 customer_id text NOT NULL,
 price_id text NOT NULL,
 status text NOT NULL,
 paid boolean NOT NULL DEFAULT false,
 period_end timestamptz,
 cancel_at_period_end boolean NOT NULL DEFAULT false,
 updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS billing_subscriptions_user_idx ON billing_subscriptions(user_id);
CREATE TABLE IF NOT EXISTS billing_usage (
 user_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
 capability text NOT NULL,
 window_key text NOT NULL,
 used integer NOT NULL DEFAULT 0 CHECK(used >= 0),
 PRIMARY KEY(user_id, capability, window_key)
);
CREATE TABLE IF NOT EXISTS billing_events (
 id text PRIMARY KEY,
 type text NOT NULL,
 processed_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS billing_consents (
 checkout_id text PRIMARY KEY,
 user_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
 version text NOT NULL,
 amount integer NOT NULL,
 currency text NOT NULL DEFAULT 'mxn',
 interval text NOT NULL,
 accepted_at timestamptz NOT NULL DEFAULT now()
);
