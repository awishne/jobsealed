-- Early Access Waitlist: waitlist_signups table + RLS
-- See also: docs/supabase-waitlist-signups.sql

CREATE TABLE IF NOT EXISTS public.waitlist_signups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  source text,
  created_at timestamptz NOT NULL DEFAULT now(),
  ip text,
  user_agent text
);

ALTER TABLE public.waitlist_signups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "waitlist_signups_anon_insert"
  ON public.waitlist_signups
  FOR INSERT
  TO anon
  WITH CHECK (true);
