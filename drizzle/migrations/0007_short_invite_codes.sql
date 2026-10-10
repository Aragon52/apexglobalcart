CREATE OR REPLACE FUNCTION public.generate_invite_code()
RETURNS text LANGUAGE plpgsql VOLATILE SET search_path TO 'public' AS $$
DECLARE
  alphabet constant text := 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  code text;
BEGIN
  LOOP
    code := '';
    FOR i IN 1..6 LOOP
      code := code || substr(alphabet, 1 + floor(random() * length(alphabet))::int, 1);
    END LOOP;
    EXIT WHEN NOT EXISTS (SELECT 1 FROM public.sla_admins WHERE invite_code = code)
          AND NOT EXISTS (SELECT 1 FROM public.sla_staff WHERE invite_code = code);
  END LOOP;
  RETURN code;
END $$;

ALTER TABLE public.sla_admins ADD COLUMN IF NOT EXISTS invite_code text;
ALTER TABLE public.sla_staff ADD COLUMN IF NOT EXISTS invite_code text;

UPDATE public.sla_admins SET invite_code = public.generate_invite_code() WHERE invite_code IS NULL;
UPDATE public.sla_staff SET invite_code = public.generate_invite_code() WHERE invite_code IS NULL;

ALTER TABLE public.sla_admins ALTER COLUMN invite_code SET DEFAULT public.generate_invite_code();
ALTER TABLE public.sla_staff ALTER COLUMN invite_code SET DEFAULT public.generate_invite_code();

CREATE UNIQUE INDEX IF NOT EXISTS sla_admins_invite_code_key ON public.sla_admins (invite_code);
CREATE UNIQUE INDEX IF NOT EXISTS sla_staff_invite_code_key ON public.sla_staff (invite_code);

REVOKE EXECUTE ON FUNCTION public.generate_invite_code() FROM anon, authenticated;