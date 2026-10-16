-- ========================================================
-- GEMAR BELAJAR - Database Hotfix & Performance Tuning
-- Safe, idempotent script for Supabase SQL Editor
-- ========================================================

-- 1. Atomic Like Increment RPC Function (prevents lost updates under high concurrency)
drop function if exists public.increment_project_like(text, integer);
drop function if exists public.increment_project_like(text);

create or replace function public.increment_project_like(p_project_id text, p_delta integer default 1)
returns integer
language plpgsql
security definer
as $$
declare
  v_new_count integer;
begin
  update public.projects
  set likes_count = greatest(0, coalesce(likes_count, 0) + p_delta)
  where id = p_project_id
  returning likes_count into v_new_count;
  
  return coalesce(v_new_count, 0);
end;
$$;

-- Grant execution to public / anon
grant execute on function public.increment_project_like(text, integer) to anon, authenticated, service_role;

-- 2. Normalize any Google Drive share links into direct high-res CDN images
update public.projects
set poster_url = 'https://lh3.googleusercontent.com/d/' || substring(poster_url from '/file/d/([a-zA-Z0-9_-]{15,})')
where not poster_url like 'data:%'
  and not poster_url like 'https://lh3.googleusercontent.com%'
  and poster_url ~ '/file/d/([a-zA-Z0-9_-]{15,})';

-- 3. Replace any invalid folder links or broken truncated links with fallback artwork
update public.projects
set poster_url = '/artworks/poster1.jpg'
where not poster_url like 'data:%'
  and (
    poster_url like '%/drive/folders/%'
    or poster_url like '%/folders/%'
    or poster_url = 'https://drive.google.com/file/d/'
    or poster_url is null
    or trim(poster_url) = ''
  );

-- 4. Safe Deduplication:
-- Re-assign any comments from duplicate entries to the primary project entry before deletion
with ranked as (
  select id,
         class_id,
         lower(trim(title)) as norm_title,
         first_value(id) over (
           partition by class_id, lower(trim(title))
           order by likes_count desc, created_at asc
         ) as primary_id,
         row_number() over (
           partition by class_id, lower(trim(title))
           order by likes_count desc, created_at asc
         ) as rnum
  from public.projects
)
update public.comments c
set project_id = r.primary_id
from ranked r
where c.project_id = r.id
  and r.rnum > 1;

-- Delete leftover duplicate rows (only keeping the primary one per group/title)
with duplicates as (
  select id,
         row_number() over (
           partition by class_id, lower(trim(title))
           order by likes_count desc, created_at asc
         ) as rnum
  from public.projects
)
delete from public.projects
where id in (
  select id from duplicates where rnum > 1
);

-- 5. Performance Indexing & Query Planner Refresh
create index if not exists idx_projects_display on public.projects(display_order);
create index if not exists idx_projects_created on public.projects(created_at desc);

analyze public.projects;
analyze public.comments;
