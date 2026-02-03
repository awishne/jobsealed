-- 1) Verify the bucket is private:
select id, name, public from storage.buckets where id = 'job-photos';

-- 2) Dump storage.objects policies that mention job-photos:
select
  policyname,
  roles,
  cmd,
  qual,
  with_check
from pg_policies
where schemaname = 'storage'
  and tablename = 'objects'
  and (
    qual ilike '%job-photos%'
    or with_check ilike '%job-photos%'
    or policyname ilike '%job%'
    or policyname ilike '%photo%'
  )
order by policyname;
