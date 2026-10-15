-- ========================================================
-- GEMA BELAJAR - Supabase Database Schema
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

-- 2. Projects (Student Artworks / AI Games) Table
create table if not exists public.projects (
  id text primary key,
  class_id text references public.classes(id) on delete cascade not null,
  piece_number text not null,
  title text not null,
  creators text not null,
  format text default 'PNG',
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

-- Enable Row Level Security (RLS)
alter table public.classes enable row level security;
alter table public.projects enable row level security;
alter table public.comments enable row level security;

-- Public read access
create policy "Allow public read access on classes"
  on public.classes for select using (true);

create policy "Allow public read access on projects"
  on public.projects for select using (true);

create policy "Allow public read access on comments"
  on public.comments for select using (true);

-- Public write access for comments & likes
create policy "Allow public insert on comments"
  on public.comments for insert with check (true);

create policy "Allow public update likes on projects"
  on public.projects for update using (true) with check (true);

-- Admin CRUD access (Permissive or via Admin Key)
create policy "Allow all operations for admin on classes"
  on public.classes for all using (true) with check (true);

create policy "Allow all operations for admin on projects"
  on public.projects for all using (true) with check (true);

create policy "Allow all operations for admin on comments"
  on public.comments for all using (true) with check (true);

-- Enable Supabase Realtime
begin;
  drop publication if exists supabase_realtime;
  create publication supabase_realtime for table public.comments, public.projects;
commit;

-- Indexing for performance
create index if not exists idx_projects_class on public.projects(class_id);
create index if not exists idx_comments_project on public.comments(project_id);
create index if not exists idx_comments_created on public.comments(created_at desc);
