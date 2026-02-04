-- Storage bucket: company-logos
-- This bucket stores company logos for user profiles
-- Files are stored at: {user_id}/logo-{timestamp}.{ext}

-- Create the bucket (if it doesn't exist)
-- Note: Run this in Supabase Dashboard > Storage > Create bucket
-- Name: company-logos
-- Public: false (private bucket)

-- Policy: Authenticated users can INSERT their own logo files
CREATE POLICY "Users can upload their own logo"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'company-logos' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Authenticated users can SELECT (read) their own logo files
CREATE POLICY "Users can read their own logo"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'company-logos' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Authenticated users can DELETE their own logo files
CREATE POLICY "Users can delete their own logo"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'company-logos' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Note: Public reports access logos via signed URLs generated server-side
-- using the admin client or server client, so no public SELECT policy is needed.
