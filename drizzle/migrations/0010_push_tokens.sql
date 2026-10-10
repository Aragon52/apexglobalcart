CREATE TABLE public.push_tokens (
  token text PRIMARY KEY,
  user_id uuid NOT NULL DEFAULT auth.uid(),
  portal text NOT NULL DEFAULT 'reseller',
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX push_tokens_user_idx ON public.push_tokens(user_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.push_tokens TO authenticated;
GRANT ALL ON public.push_tokens TO service_role;
ALTER TABLE public.push_tokens ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own push tokens read" ON public.push_tokens FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Own push tokens insert" ON public.push_tokens FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Own push tokens update" ON public.push_tokens FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "Own push tokens delete" ON public.push_tokens FOR DELETE TO authenticated USING (user_id = auth.uid());