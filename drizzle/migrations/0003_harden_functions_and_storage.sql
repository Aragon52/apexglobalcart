ALTER FUNCTION public.is_admin(uuid) SET search_path = public;
ALTER FUNCTION public.is_staff(uuid) SET search_path = public;
ALTER FUNCTION public.is_sla_user(uuid) SET search_path = public;

DROP POLICY IF EXISTS "Uploads update" ON storage.objects;
DROP POLICY IF EXISTS "Uploads delete" ON storage.objects;
CREATE POLICY "Uploads update" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'uploads') WITH CHECK (bucket_id = 'uploads');
CREATE POLICY "Uploads delete" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'uploads' AND (owner = auth.uid() OR public.is_sla_user(auth.uid())));