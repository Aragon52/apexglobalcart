ALTER FUNCTION public.is_admin(uuid) STABLE;
ALTER FUNCTION public.is_staff(uuid) STABLE;
ALTER FUNCTION public.is_sla_user(uuid) STABLE;

DO $$
DECLARE r record; q text; w text; stmt text;
BEGIN
  FOR r IN
    SELECT c.relname, p.polname, pg_get_expr(p.polqual, p.polrelid) AS q, pg_get_expr(p.polwithcheck, p.polrelid) AS w
    FROM pg_policy p JOIN pg_class c ON c.oid = p.polrelid
    WHERE c.relnamespace = 'public'::regnamespace
      AND (coalesce(pg_get_expr(p.polqual, p.polrelid),'') || coalesce(pg_get_expr(p.polwithcheck, p.polrelid),'')) ~ '(is_admin|is_staff|is_sla_user|is_owner)\(auth\.uid\(\)\)'
  LOOP
    q := regexp_replace(r.q, '(is_admin|is_staff|is_sla_user|is_owner)\(auth\.uid\(\)\)', '(SELECT \1(auth.uid()))', 'g');
    w := regexp_replace(r.w, '(is_admin|is_staff|is_sla_user|is_owner)\(auth\.uid\(\)\)', '(SELECT \1(auth.uid()))', 'g');
    stmt := format('ALTER POLICY %I ON public.%I', r.polname, r.relname);
    IF q IS NOT NULL THEN stmt := stmt || format(' USING (%s)', q); END IF;
    IF w IS NOT NULL THEN stmt := stmt || format(' WITH CHECK (%s)', w); END IF;
    EXECUTE stmt;
  END LOOP;
END $$;