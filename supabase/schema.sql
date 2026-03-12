-- ══════════════════════════════════════════════════════
-- Fitness | दर्जी  —  Supabase schema
-- Run this once in: Supabase dashboard → SQL Editor
-- ══════════════════════════════════════════════════════

-- profiles table
-- user_id  = Clerk user ID (e.g. user_2abc...)
-- state    = the full S object from onboarding (JSONB)
-- plans    = generated meal / workout content (JSONB, optional)

CREATE TABLE IF NOT EXISTS profiles (
  id          UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     TEXT        UNIQUE NOT NULL,
  state       JSONB       NOT NULL DEFAULT '{}',
  plans       JSONB                DEFAULT '{}',
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- index for fast look-ups by Clerk user_id
CREATE INDEX IF NOT EXISTS profiles_user_id_idx ON profiles (user_id);

-- auto-update updated_at on row change
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS profiles_updated_at ON profiles;
CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- NOTE: all access goes through our /api/profile Vercel function
-- which uses the service-role key, so RLS is not required.
-- Enable it anyway as a safety net.
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Deny direct client access (our server-side code uses service role which bypasses RLS)
CREATE POLICY "deny_direct_client_access"
  ON profiles FOR ALL
  USING (false);
