ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS review_url text;
