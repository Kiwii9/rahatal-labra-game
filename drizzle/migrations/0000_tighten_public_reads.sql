DROP POLICY IF EXISTS "Anyone can read rooms" ON public.rooms;
CREATE POLICY "Read active or own rooms" ON public.rooms FOR SELECT TO public
USING (created_at > now() - interval '24 hours' OR auth.uid() = host_id);

DROP POLICY IF EXISTS "Anyone can read players in a room" ON public.players;
CREATE POLICY "Read players in active rooms" ON public.players FOR SELECT TO public
USING (auth.uid() = user_id OR EXISTS (SELECT 1 FROM public.rooms r WHERE r.id = players.room_id AND (r.created_at > now() - interval '24 hours' OR r.host_id = auth.uid())));

CREATE POLICY "No guest access to profiles" ON public.profiles AS RESTRICTIVE FOR ALL TO authenticated
USING ((auth.jwt() ->> 'is_anonymous')::boolean IS NOT TRUE)
WITH CHECK ((auth.jwt() ->> 'is_anonymous')::boolean IS NOT TRUE);
CREATE POLICY "No guest access to redemptions" ON public.code_redemptions AS RESTRICTIVE FOR ALL TO authenticated
USING ((auth.jwt() ->> 'is_anonymous')::boolean IS NOT TRUE)
WITH CHECK ((auth.jwt() ->> 'is_anonymous')::boolean IS NOT TRUE);
CREATE POLICY "Guests cannot create rooms" ON public.rooms AS RESTRICTIVE FOR INSERT TO authenticated
WITH CHECK ((auth.jwt() ->> 'is_anonymous')::boolean IS NOT TRUE);
CREATE POLICY "Guests cannot update rooms" ON public.rooms AS RESTRICTIVE FOR UPDATE TO authenticated
USING ((auth.jwt() ->> 'is_anonymous')::boolean IS NOT TRUE);

DROP POLICY IF EXISTS "Public read avatars" ON storage.objects;
DROP POLICY IF EXISTS "Question media is publicly readable" ON storage.objects;