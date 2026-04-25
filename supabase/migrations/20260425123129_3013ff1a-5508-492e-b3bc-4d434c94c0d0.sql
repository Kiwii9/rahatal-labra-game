DROP POLICY IF EXISTS "Authenticated users can join waiting rooms" ON public.players;

CREATE POLICY "Authenticated users can join waiting rooms"
ON public.players
FOR INSERT
TO authenticated
WITH CHECK (
  (user_id IS NULL OR auth.uid() = user_id)
  AND char_length(name) >= 1
  AND char_length(name) <= 50
  AND EXISTS (
    SELECT 1 FROM public.rooms r
    WHERE r.id = players.room_id AND r.status = 'waiting'
  )
);