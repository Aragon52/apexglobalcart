DROP POLICY IF EXISTS "Uploads update" ON storage.objects;
CREATE POLICY "Uploads update" ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'uploads' AND (owner = auth.uid() OR public.is_sla_user(auth.uid())))
WITH CHECK (bucket_id = 'uploads' AND (owner = auth.uid() OR public.is_sla_user(auth.uid())));