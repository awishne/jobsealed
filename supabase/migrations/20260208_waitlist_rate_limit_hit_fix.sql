-- Waitlist rate limiting: durable bucket per IP (md5), returns allowed + hit_count + hit_reset_at.
-- Called by POST /api/waitlist via service role.

CREATE TABLE IF NOT EXISTS public.waitlist_rate_limits (
  bucket_key text PRIMARY KEY,
  hit_count int NOT NULL DEFAULT 0,
  window_ends_at timestamptz NOT NULL
);

CREATE OR REPLACE FUNCTION public.waitlist_rate_limit_hit(
  p_ip text,
  p_limit int,
  p_window_seconds int
)
RETURNS TABLE (allowed boolean, hit_count int, hit_reset_at timestamptz)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_key text;
  v_count int;
  v_ends_at timestamptz;
  v_now timestamptz := now();
BEGIN
  v_key := md5(p_ip);

  INSERT INTO public.waitlist_rate_limits (bucket_key, hit_count, window_ends_at)
  VALUES (v_key, 1, v_now + (p_window_seconds || ' seconds')::interval)
  ON CONFLICT (bucket_key) DO UPDATE SET
    hit_count = CASE
      WHEN public.waitlist_rate_limits.window_ends_at < v_now THEN 1
      ELSE public.waitlist_rate_limits.hit_count + 1
    END,
    window_ends_at = CASE
      WHEN public.waitlist_rate_limits.window_ends_at < v_now
        THEN v_now + (p_window_seconds || ' seconds')::interval
      ELSE public.waitlist_rate_limits.window_ends_at
    END
  RETURNING public.waitlist_rate_limits.hit_count, public.waitlist_rate_limits.window_ends_at
  INTO v_count, v_ends_at;

  allowed := v_count <= p_limit;
  hit_count := v_count;
  hit_reset_at := v_ends_at;
  RETURN NEXT;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.waitlist_rate_limit_hit(text, int, int) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.waitlist_rate_limit_hit(text, int, int) TO service_role;
