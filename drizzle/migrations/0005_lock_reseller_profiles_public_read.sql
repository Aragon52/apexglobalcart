-- Safe public shop details (no phone, balances, payment details, email)
CREATE OR REPLACE FUNCTION public.get_public_reseller_profile(_key text)
RETURNS TABLE(id uuid, shop_name text, shop_slug text, first_name text, last_name text, level text,
  star_rating numeric, credit_score numeric, product_limit integer, reseller_id integer, verified boolean,
  shop_logo text, shop_hero_banner text, store_theme text, profile_picture text,
  registration_date timestamptz, created_at timestamptz, payment_method text)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path TO 'public'
AS $$
BEGIN
  RETURN QUERY
  SELECT p.id, p.shop_name, p.shop_slug, p.first_name, p.last_name, p.level,
    p.star_rating, p.credit_score, p.product_limit, p.reseller_id, p.verified,
    p.shop_logo, p.shop_hero_banner, p.store_theme, p.profile_picture,
    p.registration_date, p.created_at,
    CASE WHEN p.payment_method LIKE '{%' THEN
      (SELECT jsonb_object_agg(k, v)::text FROM jsonb_each(p.payment_method::jsonb) AS e(k, v)
        WHERE k IN ('storeTheme','shopLogo','profilePicture','shopHeroBanner'))
    ELSE NULL END
  FROM public.reseller_profiles p
  WHERE p.shop_slug = _key OR p.id::text = _key
  LIMIT 1;
EXCEPTION WHEN others THEN
  RETURN QUERY
  SELECT p.id, p.shop_name, p.shop_slug, p.first_name, p.last_name, p.level,
    p.star_rating, p.credit_score, p.product_limit, p.reseller_id, p.verified,
    p.shop_logo, p.shop_hero_banner, p.store_theme, p.profile_picture,
    p.registration_date, p.created_at, NULL::text
  FROM public.reseller_profiles p
  WHERE p.shop_slug = _key OR p.id::text = _key
  LIMIT 1;
END; $$;

CREATE OR REPLACE FUNCTION public.get_reseller_product_ids(_reseller_id uuid)
RETURNS SETOF text
LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public'
AS $$ SELECT product_id FROM public.reseller_product_selection WHERE reseller_id = _reseller_id; $$;

GRANT EXECUTE ON FUNCTION public.get_public_reseller_profile(text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_reseller_product_ids(uuid) TO anon, authenticated;

DROP POLICY IF EXISTS "Allow users to read reseller profile" ON public.reseller_profiles;
CREATE POLICY "Resellers and team can read reseller profiles" ON public.reseller_profiles
  FOR SELECT TO authenticated USING (auth.uid() = id OR public.is_sla_user(auth.uid()));

DROP POLICY IF EXISTS "Allow public read product selections" ON public.reseller_product_selection;