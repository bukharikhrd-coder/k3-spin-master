
-- Roles enum and table
CREATE TYPE public.app_role AS ENUM ('admin', 'operator');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own roles" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

-- App settings (singleton row id=1)
CREATE TABLE public.app_settings (
  id INT PRIMARY KEY DEFAULT 1,
  data JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT app_settings_singleton CHECK (id = 1)
);
GRANT SELECT ON public.app_settings TO anon, authenticated;
GRANT INSERT, UPDATE ON public.app_settings TO authenticated;
GRANT ALL ON public.app_settings TO service_role;
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone read settings" ON public.app_settings FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins write settings" ON public.app_settings FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

INSERT INTO public.app_settings (id, data) VALUES (1, '{}'::jsonb) ON CONFLICT DO NOTHING;

-- Participants
CREATE TABLE public.participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  number TEXT NOT NULL UNIQUE,
  name TEXT,
  department TEXT,
  photo_url TEXT,
  has_won BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX participants_number_idx ON public.participants (number);
CREATE INDEX participants_haswon_idx ON public.participants (has_won);
GRANT SELECT ON public.participants TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.participants TO authenticated;
GRANT ALL ON public.participants TO service_role;
ALTER TABLE public.participants ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone read participants" ON public.participants FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins write participants" ON public.participants FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
-- Allow operators to mark winners (update has_won) — kept permissive for now under authenticated
CREATE POLICY "Authenticated mark winners" ON public.participants FOR UPDATE TO authenticated
  USING (true) WITH CHECK (true);

-- Draw history
CREATE TABLE public.draw_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  round INT NOT NULL,
  winners JSONB NOT NULL,
  operator TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX draw_history_round_idx ON public.draw_history (round DESC);
GRANT SELECT ON public.draw_history TO anon, authenticated;
GRANT INSERT, DELETE ON public.draw_history TO authenticated;
GRANT ALL ON public.draw_history TO service_role;
ALTER TABLE public.draw_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone read history" ON public.draw_history FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Authenticated insert history" ON public.draw_history FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Admins delete history" ON public.draw_history FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.app_settings;
ALTER PUBLICATION supabase_realtime ADD TABLE public.participants;
ALTER PUBLICATION supabase_realtime ADD TABLE public.draw_history;
