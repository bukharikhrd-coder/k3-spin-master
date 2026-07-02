
-- Restrict app_settings writes to admins
DROP POLICY IF EXISTS "Phase1 anyone write settings" ON public.app_settings;
CREATE POLICY "Admins write settings" ON public.app_settings
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

-- Restrict participants writes to admins (keep public read)
DROP POLICY IF EXISTS "Phase1 anyone write participants" ON public.participants;
CREATE POLICY "Admins write participants" ON public.participants
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

-- Restrict draw_history inserts to admins
DROP POLICY IF EXISTS "Phase1 anyone insert history" ON public.draw_history;
CREATE POLICY "Admins insert history" ON public.draw_history
  FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

-- Storage: restrict the private 'assets' bucket to admins
DROP POLICY IF EXISTS "Admins manage assets bucket" ON storage.objects;
DROP POLICY IF EXISTS "Admins read assets bucket" ON storage.objects;
CREATE POLICY "Admins read assets bucket" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'assets' AND public.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "Admins manage assets bucket" ON storage.objects
  FOR ALL TO authenticated
  USING (bucket_id = 'assets' AND public.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (bucket_id = 'assets' AND public.has_role(auth.uid(), 'admin'::public.app_role));
