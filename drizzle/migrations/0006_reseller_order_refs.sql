CREATE OR REPLACE FUNCTION public.get_reseller_order_refs(_reseller_id uuid)
RETURNS TABLE(referred_by_staff_id uuid, member_of_admin_id uuid)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public'
AS $$ SELECT referred_by_staff_id, member_of_admin_id FROM public.reseller_profiles WHERE id = _reseller_id; $$;
GRANT EXECUTE ON FUNCTION public.get_reseller_order_refs(uuid) TO anon, authenticated;