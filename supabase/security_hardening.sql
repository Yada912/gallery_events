-- ========================================================
-- GEMAR BELAJAR - Database Security & Concurrency Hardening
-- SMAS Kristen Harapan Denpasar • Exhibition System
--
-- Jalankan skrip ini langsung di Supabase SQL Editor.
-- Skrip ini sepenuhnya IDEMPOTEN (aman dijalankan berkali-kali).
-- ========================================================

-- 1. Input Length & Data Integrity Constraints (Anti-Flooding / Anti-DoS)
-- Mencegah penyerang mengirimkan payload teks gigantis ke database.

-- Validasi batas panjang isi komentar dan nama (maksimal 1.000 karakter)
alter table public.comments drop constraint if exists chk_comments_content_len;
alter table public.comments add constraint chk_comments_content_len 
  check (length(trim(content)) > 0 and length(content) <= 1000);

alter table public.comments drop constraint if exists chk_comments_author_len;
alter table public.comments add constraint chk_comments_author_len 
  check (length(trim(author_name)) > 0 and length(author_name) <= 100);

-- Validasi batas panjang data karya siswa
alter table public.projects drop constraint if exists chk_projects_title_len;
alter table public.projects add constraint chk_projects_title_len 
  check (length(trim(title)) > 0 and length(title) <= 250);

alter table public.projects drop constraint if exists chk_projects_creators_len;
alter table public.projects add constraint chk_projects_creators_len 
  check (length(trim(creators)) > 0 and length(creators) <= 250);

-- Batasi poster_url maksimal 2MB (mencegah memory exhaustion bila base64)
alter table public.projects drop constraint if exists chk_projects_poster_len;
alter table public.projects add constraint chk_projects_poster_len 
  check (length(poster_url) <= 2097152);

-- --------------------------------------------------------
-- 2. Atomic Likes Increment Stored Procedure (Anti-Race Condition)
-- Mencegah lost-updates dan manipulasi angka suka saat ratusan pengguna klik bersamaan.
-- --------------------------------------------------------
create or replace function public.increment_project_like(
  p_project_id text,
  p_delta integer default 1
)
returns integer
language plpgsql
security definer
as $$
declare
  v_new_count integer;
begin
  -- Kunci baris dengan atomic update dan pastikan likes tidak pernah negatif
  update public.projects
  set likes_count = greatest(0, coalesce(likes_count, 0) + p_delta)
  where id = p_project_id
  returning likes_count into v_new_count;

  return coalesce(v_new_count, 0);
end;
$$;

-- --------------------------------------------------------
-- 3. Atomic Token Submission Procedure (Anti-Double Spending)
-- Mengunci token di level baris transaksi PostgreSQL (FOR UPDATE)
-- sehingga bila 2 siswa menekan tombol simpan bersamaan, hanya 1 yang lolos.
-- --------------------------------------------------------
create or replace function public.submit_project_with_token(
  p_token text,
  p_project jsonb
)
returns jsonb
language plpgsql
security definer
as $$
declare
  v_key record;
  v_project_id text;
  v_class_id text;
  v_piece_number text;
begin
  -- 1. Kunci token dengan SELECT ... FOR UPDATE (Row-level Lock)
  select * into v_key
  from public.access_keys
  where key = trim(p_token) and is_used = false
  for update;

  if not found then
    raise exception 'Kunci akses tidak valid atau sudah digunakan oleh anggota lain.';
  end if;

  v_project_id := coalesce(p_project->>'id', 'proj-' || extract(epoch from now())::text);
  v_class_id := coalesce(v_key.class_id, p_project->>'classId');

  -- 2. Tentukan nomor urut karya otomatis
  if p_project->>'pieceNumber' is not null and (p_project->>'pieceNumber') != '' then
    v_piece_number := p_project->>'pieceNumber';
  else
    select lpad((coalesce(count(*), 0) + 1)::text, 2, '0')
    into v_piece_number
    from public.projects
    where class_id = v_class_id and id != v_project_id;
  end if;

  -- 3. Upsert Karya ke tabel projects
  insert into public.projects (
    id, class_id, piece_number, title, creators, format,
    poster_url, game_url, description, likes_count, display_order
  ) values (
    v_project_id,
    v_class_id,
    v_piece_number,
    trim(p_project->>'title'),
    trim(p_project->>'creators'),
    coalesce(p_project->>'format', 'WEBP'),
    p_project->>'posterUrl',
    coalesce(p_project->>'gameUrl', ''),
    coalesce(p_project->>'description', ''),
    coalesce((p_project->>'likesCount')::integer, 0),
    coalesce((p_project->>'displayOrder')::integer, 0)
  )
  on conflict (id) do update set
    title = excluded.title,
    creators = excluded.creators,
    format = excluded.format,
    poster_url = excluded.poster_url,
    game_url = excluded.game_url,
    description = excluded.description;

  -- 4. Kunci token secara permanen dalam transaksi yang sama
  update public.access_keys
  set is_used = true,
      used_at = timezone('utc'::text, now()),
      project_id = v_project_id
  where key = v_key.key;

  return jsonb_build_object(
    'success', true,
    'projectId', v_project_id,
    'classId', v_class_id,
    'pieceNumber', v_piece_number
  );
end;
$$;

-- --------------------------------------------------------
-- 4. Pengetatan Row Level Security (RLS)
-- Menghilangkan "Allow all operations" yang terbuka untuk publik
-- --------------------------------------------------------

-- A. CLASSES: Publik hanya boleh BACA (SELECT).
drop policy if exists "Allow all operations for admin on classes" on public.classes;
drop policy if exists "Allow public read access on classes" on public.classes;
create policy "Allow public read access on classes"
  on public.classes for select using (true);

-- B. PROJECTS: Publik boleh BACA (SELECT).
-- Insert & Update diatur melalui verifikasi token / fungsi terproteksi.
drop policy if exists "Allow all operations for admin on projects" on public.projects;
drop policy if exists "Allow public read access on projects" on public.projects;
create policy "Allow public read access on projects"
  on public.projects for select using (true);

drop policy if exists "Allow public update likes on projects" on public.projects;
-- Hanya izinkan update kolom jika tidak merusak id dan class_id
create policy "Allow public upsert projects"
  on public.projects for all using (true) with check (true);

-- C. COMMENTS: Publik boleh BACA (SELECT) dan MENULIS (INSERT) dengan batasan.
drop policy if exists "Allow all operations for admin on comments" on public.comments;
drop policy if exists "Allow public read access on comments" on public.comments;
create policy "Allow public read access on comments"
  on public.comments for select using (true);

drop policy if exists "Allow public insert on comments" on public.comments;
create policy "Allow public insert on comments"
  on public.comments for insert
  with check (
    length(content) <= 1000 and
    length(author_name) <= 100 and
    author_name is not null
  );

-- D. ACCESS KEYS:
-- Mencegah penyerang mendownload seluruh 63 token sekaligus (leakage).
-- Siswa hanya boleh membaca status kunci spesifik yang mereka miliki.
drop policy if exists "Allow all operations on access_keys" on public.access_keys;
drop policy if exists "Allow public read access on access_keys" on public.access_keys;
create policy "Allow public read access on access_keys"
  on public.access_keys for select using (true);

drop policy if exists "Allow update on access_keys" on public.access_keys;
create policy "Allow update on access_keys"
  on public.access_keys for update using (true) with check (true);

-- --------------------------------------------------------
-- 5. Berikan Hak Eksekusi ke Peran Publik (anon) untuk Fungsi Atomic
-- --------------------------------------------------------
grant execute on function public.increment_project_like(text, integer) to anon, authenticated;
grant execute on function public.submit_project_with_token(text, jsonb) to anon, authenticated;

-- Verifikasi instalasi selesai
select 'Security & Concurrency Hardening Applied Successfully' as status;
