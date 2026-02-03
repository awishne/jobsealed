-- Tighten INSERT policy for job-photos bucket:
-- - Only authenticated users
-- - Only in bucket job-photos
-- - Object owner must be the current user
-- - Object name must be under the user's folder: {uid}/...

-- Drop existing policy (safe to run if already dropped)
drop policy if exists "Authenticated can upload job photos" on storage.objects;

-- Recreate with strict conditions
create policy "Authenticated can upload job photos"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'job-photos'
    and auth.role() = 'authenticated'
    and owner = auth.uid()
    and name like (auth.uid()::text || '/%')
  );
