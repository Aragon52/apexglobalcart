ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "System settings read" ON public.system_settings;
CREATE POLICY "System settings read" ON public.system_settings FOR SELECT TO authenticated
USING (public.is_sla_user(auth.uid()) OR key LIKE 'deposit_config%');

DROP POLICY IF EXISTS "Broadcast notifications read" ON public.broadcast_notifications;
CREATE POLICY "Broadcast notifications read" ON public.broadcast_notifications FOR SELECT TO authenticated
USING (active IS DISTINCT FROM false);