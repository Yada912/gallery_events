-- ========================================================
-- GEMAR BELAJAR - Supabase Database Schema (Idempotent / Safe Re-run)
-- Pameran Siswa SMAS Kristen Harapan (Penglipuran Exhibition)
-- ========================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Classes Table
create table if not exists public.classes (
  id text primary key,
  name text not null,
  display_order integer default 0,
  description text default '',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Projects (Student Artworks / Karya Siswa) Table
create table if not exists public.projects (
  id text primary key,
  class_id text references public.classes(id) on delete cascade not null,
  piece_number text not null,
  title text not null,
  creators text not null,
  format text default 'WEBP',
  poster_url text not null,
  game_url text default '',
  description text default '',
  likes_count integer default 0,
  display_order integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Comments Table (Live Discussion)
create table if not exists public.comments (
  id uuid primary key default uuid_generate_v4(),
  project_id text references public.projects(id) on delete cascade not null,
  parent_id uuid references public.comments(id) on delete cascade,
  author_name text not null,
  content text not null,
  is_creator boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Access Keys Table (Single-use 6-digit keys for specific student groups)
create table if not exists public.access_keys (
  key text primary key,
  class_id text references public.classes(id) on delete cascade,
  group_name text not null default '',
  is_used boolean default false,
  used_at timestamp with time zone,
  project_id text default '',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS)
alter table public.classes enable row level security;
alter table public.projects enable row level security;
alter table public.comments enable row level security;
alter table public.access_keys enable row level security;

-- --------------------------------------------------------
-- RLS Policies (Safe drop & create so it can be re-run safely)
-- --------------------------------------------------------

-- Classes Policies
drop policy if exists "Allow public read access on classes" on public.classes;
create policy "Allow public read access on classes"
  on public.classes for select using (true);

drop policy if exists "Allow all operations for admin on classes" on public.classes;
create policy "Allow all operations for admin on classes"
  on public.classes for all using (true) with check (true);

-- Projects Policies
drop policy if exists "Allow public read access on projects" on public.projects;
create policy "Allow public read access on projects"
  on public.projects for select using (true);

drop policy if exists "Allow public update likes on projects" on public.projects;
create policy "Allow public update likes on projects"
  on public.projects for update using (true) with check (true);

drop policy if exists "Allow all operations for admin on projects" on public.projects;
create policy "Allow all operations for admin on projects"
  on public.projects for all using (true) with check (true);

-- Comments Policies
drop policy if exists "Allow public read access on comments" on public.comments;
create policy "Allow public read access on comments"
  on public.comments for select using (true);

drop policy if exists "Allow public insert on comments" on public.comments;
create policy "Allow public insert on comments"
  on public.comments for insert with check (true);

drop policy if exists "Allow all operations for admin on comments" on public.comments;
create policy "Allow all operations for admin on comments"
  on public.comments for all using (true) with check (true);

-- Access Keys Policies
drop policy if exists "Allow public read access on access_keys" on public.access_keys;
create policy "Allow public read access on access_keys"
  on public.access_keys for select using (true);

drop policy if exists "Allow update on access_keys" on public.access_keys;
create policy "Allow update on access_keys"
  on public.access_keys for update using (true) with check (true);

drop policy if exists "Allow all operations on access_keys" on public.access_keys;
create policy "Allow all operations on access_keys"
  on public.access_keys for all using (true) with check (true);

-- --------------------------------------------------------
-- Performance Indexing
-- --------------------------------------------------------
create index if not exists idx_projects_class on public.projects(class_id);
create index if not exists idx_projects_display on public.projects(display_order);
create index if not exists idx_projects_created on public.projects(created_at desc);
create index if not exists idx_comments_project on public.comments(project_id);
create index if not exists idx_comments_created on public.comments(created_at desc);
create index if not exists idx_access_keys_used on public.access_keys(is_used);
create index if not exists idx_access_keys_class on public.access_keys(class_id);

-- --------------------------------------------------------
-- Atomic Like Increment RPC Function (prevents race conditions)
-- --------------------------------------------------------
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

grant execute on function public.increment_project_like(text, integer) to anon, authenticated, service_role;

-- --------------------------------------------------------
-- Enable Supabase Realtime (Safe: does NOT drop publication)
-- --------------------------------------------------------
do $$
begin
  if not exists (
    select 1 from pg_publication_tables 
    where pubname = 'supabase_realtime' 
    and schemaname = 'public' 
    and tablename = 'comments'
  ) then
    alter publication supabase_realtime add table public.comments;
  end if;

  if not exists (
    select 1 from pg_publication_tables 
    where pubname = 'supabase_realtime' 
    and schemaname = 'public' 
    and tablename = 'projects'
  ) then
    alter publication supabase_realtime add table public.projects;
  end if;
exception
  when others then
    -- Silently ignore if already added or publication managed externally
    null;
end $$;

