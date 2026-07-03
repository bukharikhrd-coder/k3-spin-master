
-- Restore public write access for the kiosk app (no auth wired up in the UI).
-- The reset & spin operations were silently failing because RLS required admin role.

DROP POLICY IF EXISTS "Admins write participants" ON public.participants;
DROP POLICY IF EXISTS "Admins write settings" ON public.app_settings;
DROP POLICY IF EXISTS "Admins insert history" ON public.draw_history;
DROP POLICY IF EXISTS "Admins delete history" ON public.draw_history;

CREATE POLICY "Public write participants" ON public.participants FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Public write settings"     ON public.app_settings  FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Public insert history"     ON public.draw_history  FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Public delete history"     ON public.draw_history  FOR DELETE TO anon, authenticated USING (true);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.participants TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.app_settings TO anon, authenticated;
GRANT SELECT, INSERT, DELETE ON public.draw_history TO anon, authenticated;
