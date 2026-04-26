-- 1) Add columns to rooms for question source + custom questions
ALTER TABLE public.rooms
  ADD COLUMN IF NOT EXISTS question_source text NOT NULL DEFAULT 'builtin',
  ADD COLUMN IF NOT EXISTS custom_questions jsonb;

ALTER TABLE public.rooms
  DROP CONSTRAINT IF EXISTS rooms_question_source_chk;
ALTER TABLE public.rooms
  ADD CONSTRAINT rooms_question_source_chk
  CHECK (question_source IN ('builtin', 'custom'));

-- 2) Storage bucket for question media (images / video posters)
INSERT INTO storage.buckets (id, name, public)
VALUES ('question-media', 'question-media', true)
ON CONFLICT (id) DO NOTHING;

-- Public read
DROP POLICY IF EXISTS "Question media is publicly readable" ON storage.objects;
CREATE POLICY "Question media is publicly readable"
ON storage.objects FOR SELECT
USING (bucket_id = 'question-media');

-- Hosts (authenticated users) can upload into their own uid-prefixed folder
DROP POLICY IF EXISTS "Hosts can upload question media" ON storage.objects;
CREATE POLICY "Hosts can upload question media"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'question-media'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

DROP POLICY IF EXISTS "Hosts can update own question media" ON storage.objects;
CREATE POLICY "Hosts can update own question media"
ON storage.objects FOR UPDATE TO authenticated
USING (
  bucket_id = 'question-media'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

DROP POLICY IF EXISTS "Hosts can delete own question media" ON storage.objects;
CREATE POLICY "Hosts can delete own question media"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'question-media'
  AND auth.uid()::text = (storage.foldername(name))[1]
);