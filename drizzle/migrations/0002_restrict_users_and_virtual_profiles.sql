DROP POLICY IF EXISTS "Allow public/authenticated read users" ON public.users;
DROP POLICY IF EXISTS "Virtual customer read" ON public.virtual_customer_profiles;
CREATE POLICY "Virtual customer read" ON public.virtual_customer_profiles FOR SELECT TO authenticated USING (public.is_sla_user(auth.uid()));