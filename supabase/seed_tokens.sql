-- ========================================================
-- GEMA BELAJAR - SEED KUNCI AKSES KELOMPOK SISWA (63 KELOMPOK)
-- SMAS Kristen Harapan Bali • Penglipuran AI Game Exhibition
-- Jalankan skrip ini langsung di Supabase SQL Editor.
-- ========================================================

-- 1. Buat Tabel access_keys jika belum ada
create table if not exists public.access_keys (
  key text primary key,
  class_id text references public.classes(id) on delete cascade,
  group_name text not null default '',
  is_used boolean default false,
  used_at timestamp with time zone,
  project_id text default '',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Aktifkan Row Level Security (RLS) & Kebijakan Akses
alter table public.access_keys enable row level security;

drop policy if exists "Allow public read access on access_keys" on public.access_keys;
create policy "Allow public read access on access_keys"
  on public.access_keys for select using (true);

drop policy if exists "Allow update on access_keys" on public.access_keys;
create policy "Allow update on access_keys"
  on public.access_keys for update using (true) with check (true);

drop policy if exists "Allow all operations on access_keys" on public.access_keys;
create policy "Allow all operations on access_keys"
  on public.access_keys for all using (true) with check (true);

create index if not exists idx_access_keys_used on public.access_keys(is_used);
create index if not exists idx_access_keys_class on public.access_keys(class_id);

-- 2. Pastikan ke-8 Kelas (X-1 s.d. X-8) Terdaftar di Database
insert into public.classes (id, name, display_order) values
  ('06201', 'X-1', 1),
  ('06202', 'X-2', 2),
  ('06203', 'X-3', 3),
  ('06204', 'X-4', 4),
  ('06205', 'X-5', 5),
  ('06206', 'X-6', 6),
  ('06207', 'X-7', 7),
  ('06208', 'X-8', 8)
on conflict (id) do update set name = excluded.name;

-- 3. Masukkan Seluruh 63 Token Unik per Kelompok Siswa
insert into public.access_keys (key, class_id, group_name, is_used)
values
  -- KELAS X-1 (10 Kelompok)
  ('965769', '06201', 'KUACI', false),
  ('518054', '06201', 'BRISCO', false),
  ('165996', '06201', 'OIKOS', false),
  ('402221', '06201', 'NOMOS', false),
  ('131609', '06201', 'BALDRICK', false),
  ('729410', '06201', 'THE SPORTIES ATHELICA', false),
  ('563318', '06201', 'JUSTMANI', false),
  ('922412', '06201', 'MINIOON BKS', false),
  ('379586', '06201', 'AYU6A', false),
  ('573873', '06201', 'INSIGHT', false),

  -- KELAS X-2 (9 Kelompok)
  ('378876', '06202', 'KELOMPOK 1', false),
  ('973814', '06202', 'KELOMPOK 2', false),
  ('169322', '06202', 'KELOMPOK 3', false),
  ('811107', '06202', 'KELOMPOK 4', false),
  ('446431', '06202', 'KELOMPOK 5', false),
  ('322248', '06202', 'KELOMPOK 6', false),
  ('908850', '06202', 'KELOMPOK 7', false),
  ('465675', '06202', 'KELOMPOK 8', false),
  ('534098', '06202', 'KELOMPOK 9', false),

  -- KELAS X-3 (8 Kelompok)
  ('512312', '06203', 'KELOMPOK 1', false),
  ('722805', '06203', 'KELOMPOK 2', false),
  ('731942', '06203', 'KELOMPOK 3', false),
  ('357952', '06203', 'KELOMPOK 4', false),
  ('398174', '06203', 'KELOMPOK 5', false),
  ('723534', '06203', 'KELOMPOK 6', false),
  ('835019', '06203', 'KELOMPOK 7', false),
  ('485072', '06203', 'KELOMPOK 8', false),

  -- KELAS X-4 (7 Kelompok)
  ('924411', '06204', 'CHEM IS TRY', false),
  ('605312', '06204', 'TITUT', false),
  ('191114', '06204', 'WARLOK LANTAM', false),
  ('829495', '06204', 'MANGGIRY', false),
  ('825735', '06204', 'BUMN', false),
  ('688932', '06204', 'MBG', false),
  ('753708', '06204', 'BAMBANG', false),

  -- KELAS X-5 (9 Kelompok)
  ('524066', '06205', 'IDO', false),
  ('920154', '06205', 'SUKA BIOLOGI', false),
  ('759382', '06205', 'ANASK MEDAN', false),
  ('229905', '06205', 'MBERGLEDEK', false),
  ('363559', '06205', 'SENI PURA', false),
  ('825119', '06205', 'TIBACI', false),
  ('130993', '06205', 'SOCI3TY', false),
  ('126130', '06205', 'JESJIS', false),
  ('468959', '06205', 'PATRA', false),

  -- KELAS X-6 (7 Kelompok)
  ('260246', '06206', 'VODCA', false),
  ('888129', '06206', 'FINESHYT', false),
  ('411293', '06206', 'MORVANA', false),
  ('427529', '06206', 'ZAT JENIUS', false),
  ('434718', '06206', 'DIGMAN', false),
  ('392085', '06206', 'NACO JELLY', false),
  ('199057', '06206', 'OECONONICUS', false),

  -- KELAS X-7 (7 Kelompok)
  ('304997', '06207', 'BAYI TABUNG', false),
  ('754678', '06207', 'BOJOG MELEBANG', false),
  ('568957', '06207', 'JOSJIS', false),
  ('202021', '06207', 'TIME VOYAGERS', false),
  ('930890', '06207', 'CAI', false),
  ('426301', '06207', 'ECV', false),
  ('391572', '06207', 'KAI', false),

  -- KELAS X-8 (6 Kelompok)
  ('569357', '06208', 'MODE TEROME POLIN', false),
  ('129713', '06208', 'WATADOS', false),
  ('605903', '06208', 'OXYGEN', false),
  ('745170', '06208', 'BOGLER FC', false),
  ('431136', '06208', 'MODE ON AKTIF NYALA HIDUP', false),
  ('790465', '06208', 'STUDEBT INVESTING', false)
on conflict (key) do nothing;
