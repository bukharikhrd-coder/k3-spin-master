
GRANT INSERT, UPDATE ON public.app_settings TO anon;
GRANT INSERT, UPDATE, DELETE ON public.participants TO anon;
GRANT INSERT ON public.draw_history TO anon;

DROP POLICY IF EXISTS "Admins write settings" ON public.app_settings;
CREATE POLICY "Phase1 anyone write settings" ON public.app_settings FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Admins write participants" ON public.participants;
DROP POLICY IF EXISTS "Admins or operators mark winners" ON public.participants;
CREATE POLICY "Phase1 anyone write participants" ON public.participants FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Admins or operators insert history" ON public.draw_history;
CREATE POLICY "Phase1 anyone insert history" ON public.draw_history FOR INSERT TO anon, authenticated WITH CHECK (true);
