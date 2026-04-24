
-- 1. Drop legacy pin column from rooms (room_code is the join key)
ALTER TABLE public.rooms DROP COLUMN IF EXISTS pin;

-- 2. Tighten anon player insert: only into waiting rooms, with name length limit
DROP POLICY IF EXISTS "Anon can insert players" ON public.players;
CREATE POLICY "Anon can insert players into waiting rooms"
  ON public.players FOR INSERT TO anon
  WITH CHECK (
    char_length(name) BETWEEN 1 AND 50
    AND EXISTS (
      SELECT 1 FROM public.rooms r
      WHERE r.id = players.room_id
        AND r.status = 'waiting'
    )
  );

-- Also ensure authenticated joins respect status + length
DROP POLICY IF EXISTS "Authenticated users can join rooms" ON public.players;
CREATE POLICY "Authenticated users can join waiting rooms"
  ON public.players FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    AND char_length(name) BETWEEN 1 AND 50
    AND EXISTS (
      SELECT 1 FROM public.rooms r
      WHERE r.id = players.room_id
        AND r.status = 'waiting'
    )
  );

-- Hard CHECK constraint on name length as defense in depth
ALTER TABLE public.players
  DROP CONSTRAINT IF EXISTS players_name_length_check;
ALTER TABLE public.players
  ADD CONSTRAINT players_name_length_check
  CHECK (char_length(name) BETWEEN 1 AND 50);

-- 3. activation_codes: explicitly document deny-by-default
COMMENT ON TABLE public.activation_codes IS
  'Deny-by-default: no SELECT/INSERT/UPDATE/DELETE policies. Access is via the SECURITY DEFINER function consume_activation_code() or the service role only. DO NOT add a SELECT policy without column-level controls — the linked_email and code columns are sensitive.';

-- 4. Tighten avatars bucket
-- Limit MIME types and size on the bucket itself
UPDATE storage.buckets
  SET file_size_limit = 2097152,
      allowed_mime_types = ARRAY['image/png','image/jpeg','image/webp','image/gif']
  WHERE id = 'avatars';

-- Drop the over-permissive policies
DROP POLICY IF EXISTS "Avatars are publicly readable" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can upload avatars" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can update avatars" ON storage.objects;

-- Public read only for files inside the shared "players/" folder (no listing of arbitrary paths)
CREATE POLICY "Public read of player avatars"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = 'players'
  );

-- Authenticated users can upload into their own folder: avatars/<uid>/...
CREATE POLICY "Authenticated users upload own avatar"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Authenticated users update own avatar"
  ON storage.objects FOR UPDATE TO authenticated
  USING (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Authenticated users read own avatar"
  ON storage.objects FOR SELECT TO authenticated
  USING (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
