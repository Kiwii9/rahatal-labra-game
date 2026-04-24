
DROP POLICY IF EXISTS "Public read of player avatars" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users read own avatar" ON storage.objects;

-- Public read for individual avatar files (URLs contain unguessable UUIDs).
CREATE POLICY "Public read avatars"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');
