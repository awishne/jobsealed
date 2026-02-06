-- =============================================================================
-- WAITLIST_SIGNUPS TABLE + RLS (Early Access Waitlist)
-- =============================================================================
-- Run this in Supabase SQL Editor or via migration.
-- Table: waitlist_signups
-- RLS: anon can INSERT only (for public waitlist form). SELECT/UPDATE/DELETE denied for anon.
-- =============================================================================

-- Table
CREATE TABLE IF NOT EXISTS public.waitlist_signups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  source text,
  created_at timestamptz NOT NULL DEFAULT now(),
  ip text,
  user_agent text
);

-- RLS
ALTER TABLE public.waitlist_signups ENABLE ROW LEVEL SECURITY;

-- Anon may only INSERT (so unauthenticated dialog can submit via API or direct client).
CREATE POLICY "waitlist_signups_anon_insert"
  ON public.waitlist_signups
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Anon may not SELECT, UPDATE, or DELETE.
-- (No policy = denied. Authenticated roles can add their own policies if needed.)

-- Optional: allow service role / authenticated to read (for admin dashboards later).
-- CREATE POLICY "waitlist_signups_authenticated_select" ON public.waitlist_signups FOR SELECT TO authenticated USING (true);
-- CREATE POLICY "waitlist_signups_service_all" ON public.waitlist_signups FOR ALL TO service_role USING (true) WITH CHECK (true);
