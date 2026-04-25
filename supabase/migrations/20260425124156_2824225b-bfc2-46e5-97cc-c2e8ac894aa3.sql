-- Cleanse legacy rows that stored raw base64 / non-URL avatars before the new rule.
UPDATE public.players
SET avatar_url = NULL
WHERE avatar_url IS NOT NULL
  AND NOT (
    char_length(avatar_url) <= 2048
    AND (
      avatar_url LIKE 'icon:%'
      OR avatar_url LIKE 'http://%'
      OR avatar_url LIKE 'https://%'
    )
  );

-- Enforce avatar_url format going forward.
ALTER TABLE public.players
  ADD CONSTRAINT players_avatar_url_format_chk
  CHECK (
    avatar_url IS NULL
    OR (
      char_length(avatar_url) <= 2048
      AND (
        avatar_url LIKE 'icon:%'
        OR avatar_url LIKE 'http://%'
        OR avatar_url LIKE 'https://%'
      )
    )
  );

-- Allow authenticated users to delete their own files in the public 'avatars' bucket.
CREATE POLICY "Authenticated users delete own avatar"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'avatars'
  AND (storage.foldername(name))[1] = (auth.uid())::text
);