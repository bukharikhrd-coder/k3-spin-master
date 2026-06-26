
DROP POLICY IF EXISTS "Authenticated mark winners" ON public.participants;
DROP POLICY IF EXISTS "Authenticated insert history" ON public.draw_history;

CREATE POLICY "Admins or operators mark winners"
  ON public.participants FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'operator'))
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'operator'));

CREATE POLICY "Admins or operators insert history"
  ON public.draw_history FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'operator'));

REVOKE EXECUTE ON FUNCTION public.has_role(UUID, public.app_role) FROM PUBLIC, anon, authenticated;
