-- ==============================================================================
-- GEMAR BELAJAR: RESET DATABASE KE STATUS AWAL SEED (PRA-PENGISIAN SISWA)
-- SMAS Kristen Harapan Bali • Pameran Karya Siswa
-- ==============================================================================
-- 1. Menghapus semua komentar & karya uji coba / demo.
-- 2. Menghapus & mengembalikan seluruh 63 token kelompok ke status AKTIF (belum terpakai).
-- 3. Memastikan ke-8 kelas (X-1 s.d. X-8) terdaftar sempurna.
-- ==============================================================================

-- LANGKAH 1: Bersihkan Data Percobaan (Komentar & Karya)
DELETE FROM public.comments;
DELETE FROM public.projects;

-- LANGKAH 2: Bersihkan Kunci Lama
DELETE FROM public.access_keys;

-- LANGKAH 3: Pastikan Tabel access_keys Ada & RLS Berjalan
CREATE TABLE IF NOT EXISTS public.access_keys (
  key text PRIMARY KEY,
  class_id text REFERENCES public.classes(id) ON DELETE CASCADE,
  group_name text NOT NULL DEFAULT '',
  is_used boolean DEFAULT false,
  used_at timestamp with time zone,
  project_id text DEFAULT '',
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.access_keys ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read access on access_keys" ON public.access_keys;
CREATE POLICY "Allow public read access on access_keys"
  ON public.access_keys FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow update on access_keys" ON public.access_keys;
CREATE POLICY "Allow update on access_keys"
  ON public.access_keys FOR UPDATE USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all operations on access_keys" ON public.access_keys;
CREATE POLICY "Allow all operations on access_keys"
  ON public.access_keys FOR ALL USING (true) WITH CHECK (true);

-- LANGKAH 4: Pastikan 8 Kelas Terdaftar
INSERT INTO public.classes (id, name, display_order) VALUES
  ('06201', 'X-1', 1),
  ('06202', 'X-2', 2),
  ('06203', 'X-3', 3),
  ('06204', 'X-4', 4),
  ('06205', 'X-5', 5),
  ('06206', 'X-6', 6),
  ('06207', 'X-7', 7),
  ('06208', 'X-8', 8)
ON CONFLICT (id) DO UPDATE SET 
  name = EXCLUDED.name,
  display_order = EXCLUDED.display_order;

-- LANGKAH 5: Masukkan Ulang 63 Token Kelompok Terkurasi (1 Kesempatan per Kelompok)
INSERT INTO public.access_keys (key, class_id, group_name, is_used, used_at, project_id)
VALUES
  -- KELAS X-1 (10 Kelompok)
  ('965769', '06201', 'kelompok KUACI', false, null, null),
  ('518054', '06201', 'kelompok BRISCO', false, null, null),
  ('165996', '06201', 'kelompok OIKOS', false, null, null),
  ('402221', '06201', 'kelompok NOMOS', false, null, null),
  ('131609', '06201', 'kelompok BALDRICK', false, null, null),
  ('729410', '06201', 'kelompok THE SPORTIES ATHELICA', false, null, null),
  ('563318', '06201', 'kelompok JUSTMANI', false, null, null),
  ('922412', '06201', 'kelompok MINIOON BKS', false, null, null),
  ('379586', '06201', 'kelompok AYU6A', false, null, null),
  ('573873', '06201', 'kelompok INSIGHT', false, null, null),

  -- KELAS X-2 (9 Kelompok)
  ('378876', '06202', 'Kelompok 1', false, null, null),
  ('973814', '06202', 'Kelompok 2', false, null, null),
  ('169322', '06202', 'Kelompok 3', false, null, null),
  ('811107', '06202', 'Kelompok 4', false, null, null),
  ('446431', '06202', 'Kelompok 5', false, null, null),
  ('322248', '06202', 'Kelompok 6', false, null, null),
  ('908850', '06202', 'Kelompok 7', false, null, null),
  ('465675', '06202', 'Kelompok 8', false, null, null),
  ('534098', '06202', 'Kelompok 9', false, null, null),

  -- KELAS X-3 (8 Kelompok)
  ('512312', '06203', 'Kelompok 1', false, null, null),
  ('722805', '06203', 'Kelompok 2', false, null, null),
  ('731942', '06203', 'Kelompok 3', false, null, null),
  ('357952', '06203', 'Kelompok 4', false, null, null),
  ('398174', '06203', 'Kelompok 5', false, null, null),
  ('723534', '06203', 'Kelompok 6', false, null, null),
  ('835019', '06203', 'Kelompok 7', false, null, null),
  ('485072', '06203', 'Kelompok 8', false, null, null),

  -- KELAS X-4 (7 Kelompok)
  ('924411', '06204', 'kelompok CHEM IS TRY', false, null, null),
  ('605312', '06204', 'kelompok TITUT', false, null, null),
  ('191114', '06204', 'kelompok WARLOK LANTAM', false, null, null),
  ('829495', '06204', 'kelompok MANGGIRY', false, null, null),
  ('825735', '06204', 'kelompok BUMN', false, null, null),
  ('688932', '06204', 'kelompok MBG', false, null, null),
  ('753708', '06204', 'kelompok BAMBANG', false, null, null),

  -- KELAS X-5 (9 Kelompok)
  ('524066', '06205', 'kelompok IDO', false, null, null),
  ('920154', '06205', 'kelompok SUKA BIOLOGI', false, null, null),
  ('759382', '06205', 'kelompok ANASK MEDAN', false, null, null),
  ('229905', '06205', 'kelompok MBERGLEDEK', false, null, null),
  ('363559', '06205', 'kelompok SENI PURA', false, null, null),
  ('825119', '06205', 'kelompok TIBACI', false, null, null),
  ('130993', '06205', 'kelompok SOCI3TY', false, null, null),
  ('733475', '06205', 'kelompok JESJIS', false, null, null),
  ('317618', '06205', 'kelompok PATRA', false, null, null),

  -- KELAS X-6 (7 Kelompok)
  ('445694', '06206', 'kelompok VODCA', false, null, null),
  ('613437', '06206', 'kelompok FINESHYT', false, null, null),
  ('806742', '06206', 'kelompok MORVANA', false, null, null),
  ('727494', '06206', 'kelompok ZAT JENIUS', false, null, null),
  ('288077', '06206', 'kelompok DIGMAN', false, null, null),
  ('993414', '06206', 'kelompok NACO JELLY', false, null, null),
  ('130835', '06206', 'kelompok OECONONICUS', false, null, null),

  -- KELAS X-7 (7 Kelompok)
  ('847596', '06207', 'kelompok BAYI TABUNG', false, null, null),
  ('264789', '06207', 'kelompok BOJOG MELEBANG', false, null, null),
  ('471018', '06207', 'kelompok JOSJIS', false, null, null),
  ('606716', '06207', 'kelompok TIME VOYAGERS', false, null, null),
  ('909249', '06207', 'kelompok CAI', false, null, null),
  ('326622', '06207', 'kelompok ECV', false, null, null),
  ('717646', '06207', 'kelompok KAI', false, null, null),

  -- KELAS X-8 (6 Kelompok)
  ('433606', '06208', 'kelompok MODE TEROME POLIN', false, null, null),
  ('744576', '06208', 'kelompok WATADOS', false, null, null),
  ('476686', '06208', 'kelompok OXYGEN', false, null, null),
  ('452844', '06208', 'kelompok BOGLER FC', false, null, null),
  ('165947', '06208', 'kelompok MODE ON AKTIF NYALA HIDUP', false, null, null),
  ('483015', '06208', 'kelompok STUDEBT INVESTING', false, null, null),

  -- KUNCI CADANGAN STANDALONE / BEBAS (5 Kunci Darurat/Susulan)
  ('700001', null, 'Kunci Standalone / Bebas (Susulan)', false, null, null),
  ('700002', null, 'Kunci Standalone / Bebas (Susulan)', false, null, null),
  ('700003', null, 'Kunci Standalone / Bebas (Susulan)', false, null, null),
  ('700004', null, 'Kunci Standalone / Bebas (Susulan)', false, null, null),
  ('700005', null, 'Kunci Standalone / Bebas (Susulan)', false, null, null);

-- LANGKAH 6: Tampilkan Verifikasi Status Database
SELECT 
  (SELECT count(*) FROM public.classes) AS total_kelas,
  (SELECT count(*) FROM public.projects) AS total_karya,
  (SELECT count(*) FROM public.comments) AS total_komentar,
  (SELECT count(*) FROM public.access_keys WHERE is_used = false) AS token_aktif_siap_pakai,
  (SELECT count(*) FROM public.access_keys WHERE is_used = true) AS token_hangus;
