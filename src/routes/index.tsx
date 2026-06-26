import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Settings, Sparkles, Trophy, Users, Hash } from "lucide-react";
import { useSettings } from "@/lib/settings-store";
import { useParticipants, type Participant } from "@/lib/participants-store";
import { SpinningWheel, type SpinningWheelHandle } from "@/components/wheel/SpinningWheel";
import { WinnerReveal } from "@/components/WinnerReveal";
import { HomeBackground } from "@/components/HomeBackground";
import { fireCelebration } from "@/lib/celebration";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Safety Lucky Draw — Bulan Keselamatan Produksi 2026" },
      { name: "description", content: "Live K3 lucky draw event powered by a cinematic spinning wheel." },
      { property: "og:title", content: "Safety Lucky Draw — Bulan Keselamatan Produksi 2026" },
      { property: "og:description", content: "Live K3 lucky draw event powered by a cinematic spinning wheel." },
    ],
  }),
  component: Home,
});

function useNow() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return now;
}

function pickWinners(pool: Participant[], n: number): Participant[] {
  const arr = [...pool];
  const out: Participant[] = [];
  for (let i = 0; i < n && arr.length > 0; i++) {
    const idx = Math.floor(Math.random() * arr.length);
    out.push(arr.splice(idx, 1)[0]);
  }
  return out;
}

function Home() {
  const { settings, t, init: initSettings, loaded } = useSettings();
  const { participants, init: initParticipants } = useParticipants();
  const wheelRef = useRef<SpinningWheelHandle>(null);
  const [spinning, setSpinning] = useState(false);
  const [revealed, setRevealed] = useState<Participant[]>([]);
  const [revealOpen, setRevealOpen] = useState(false);
  const now = useNow();
  const [wheelSize, setWheelSize] = useState(640);

  useEffect(() => { void initSettings(); void initParticipants(); }, [initSettings, initParticipants]);

  useEffect(() => {
    const update = () => {
      const w = window.innerWidth;
      if (w < 640) setWheelSize(Math.min(w - 32, 360));
      else if (w < 1024) setWheelSize(480);
      else if (w < 1536) setWheelSize(560);
      else setWheelSize(680);
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const remaining = useMemo(() => participants.filter((p) => !p.has_won), [participants]);
  const wonCount = participants.length - remaining.length;

  async function handleSpin() {
    if (spinning || remaining.length === 0) return;
    const winners = pickWinners(remaining, Math.min(settings.wheel.winnersPerRound, remaining.length));
    if (winners.length === 0) return;
    setSpinning(true);
    setRevealOpen(false);
    await wheelRef.current?.spinTo(winners.map((w) => w.id), settings.wheel.spinDurationSec);
    // mark winners
    const ids = winners.map((w) => w.id);
    await supabase.from("participants").update({ has_won: true }).in("id", ids);
    await supabase.from("draw_history").insert({
      round: settings.currentRound,
      winners: winners as any,
      operator: settings.operator,
    });
    // bump round
    useSettings.getState().setSettings((s) => ({ ...s, currentRound: s.currentRound + 1 }));
    setRevealed(winners);
    setRevealOpen(true);
    fireCelebration();
    setSpinning(false);
  }

  const dateStr = now.toLocaleDateString(undefined, { weekday: "long", year: "numeric", month: "long", day: "numeric" });
  const timeStr = now.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit", second: "2-digit" });

  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <HomeBackground settings={settings} />

      {/* Top bar */}
      <header className="relative z-10 mx-auto flex max-w-[1800px] flex-wrap items-center justify-between gap-4 px-4 py-5 md:px-8">
        <div className="flex items-center gap-3">
          {settings.logos.company.url ? (
            <img src={settings.logos.company.url} alt="" style={{ height: settings.logos.company.size, opacity: settings.logos.company.opacity / 100 }} />
          ) : (
            <div className="glass flex h-12 w-12 items-center justify-center rounded-xl font-display text-lg font-bold text-[var(--safety-yellow)]">K3</div>
          )}
          <div className="leading-tight">
            <div className="text-xs uppercase tracking-[0.3em] text-muted-foreground">{t("companyName")}</div>
            <div className="font-display text-lg font-bold text-foreground">{t("eventName")}</div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden text-right md:block">
            <div className="font-mono text-xs uppercase tracking-widest text-muted-foreground">{dateStr}</div>
            <div className="font-mono text-base font-semibold text-foreground">{timeStr}</div>
          </div>
          <Link
            to="/admin"
            className="glass inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-foreground transition hover:bg-white/10"
          >
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">{t("btn_admin")}</span>
          </Link>
        </div>
      </header>

      {/* Title */}
      <section className="relative z-10 mx-auto max-w-[1600px] px-4 text-center md:px-8">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full glass px-4 py-1 text-xs font-semibold uppercase tracking-[0.4em] text-[var(--safety-yellow)]">
            <Sparkles className="h-3.5 w-3.5" /> Safety Lucky Draw
          </div>
          <h1 className="font-display text-3xl font-extrabold leading-tight grad-text-gold text-glow-yellow sm:text-5xl md:text-6xl xl:text-7xl">
            {t("appTitle")}
          </h1>
          <p className="mt-2 font-display text-base uppercase tracking-[0.4em] text-foreground/80 md:text-xl">
            {t("appSubtitle")}
          </p>
        </motion.div>

        {/* Stats */}
        <div className="mx-auto mt-6 grid max-w-5xl grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
          <Stat icon={<Users className="h-5 w-5" />} label={t("stats_total")} value={participants.length} accent="blue" />
          <Stat icon={<Hash  className="h-5 w-5" />} label={t("stats_remaining")} value={remaining.length} accent="yellow" />
          <Stat icon={<Trophy className="h-5 w-5" />} label={t("stats_winners")} value={wonCount} accent="orange" />
          <Stat icon={<Sparkles className="h-5 w-5" />} label={t("stats_round")} value={settings.currentRound} accent="blue" />
        </div>
      </section>

      {/* Wheel + controls */}
      <section className="relative z-10 mx-auto mt-8 grid max-w-[1800px] grid-cols-1 gap-8 px-4 pb-16 md:px-8 lg:grid-cols-[1fr_360px]">
        <div className="flex flex-col items-center justify-center">
          {participants.length === 0 ? (
            <div className="glass-strong rounded-3xl p-10 text-center max-w-lg">
              <div className="font-display text-xl font-semibold text-foreground">{loaded ? t("no_participants") : t("loading")}</div>
              <Link to="/admin" className="mt-4 inline-block rounded-full bg-[var(--safety-yellow)] px-5 py-2 font-semibold text-black hover:brightness-110">
                {t("btn_admin")}
              </Link>
            </div>
          ) : (
            <SpinningWheel
              ref={wheelRef}
              participants={participants}
              size={wheelSize}
              showNumbersOnly={settings.wheel.showNumbersOnly}
              colors={{ primary: settings.theme.primary, accent: settings.theme.accent, secondary: settings.theme.secondary }}
            />
          )}
        </div>

        {/* Side panel */}
        <aside className="glass-strong flex flex-col gap-5 rounded-3xl p-6">
          <div>
            <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-muted-foreground">
              {t("winners_per_round")}
            </label>
            <div className="grid grid-cols-5 gap-2">
              {[1, 5, 10, 15, 20].map((n) => (
                <button
                  key={n}
                  onClick={() =>
                    useSettings.getState().setSettings((s) => ({ ...s, wheel: { ...s.wheel, winnersPerRound: n as any } }))
                  }
                  className={`rounded-lg py-2 font-display text-sm font-bold transition ${
                    settings.wheel.winnersPerRound === n
                      ? "bg-[var(--safety-yellow)] text-black shadow-[0_0_18px_rgba(255,193,7,0.7)]"
                      : "bg-white/5 text-foreground hover:bg-white/10"
                  }`}
                >{n}</button>
              ))}
            </div>
          </div>

          <button
            disabled={spinning || remaining.length === 0}
            onClick={handleSpin}
            className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-[var(--safety-yellow)] via-[#ffb300] to-[var(--safety-orange)] py-5 font-display text-2xl font-extrabold uppercase tracking-widest text-black shadow-[0_0_30px_rgba(255,193,7,0.6)] transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <span className="relative z-10">{spinning ? t("spinning") : t("btn_spin")}</span>
            <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
          </button>

          <div className="text-center font-mono text-xs uppercase tracking-widest text-muted-foreground">
            {dateStr} · {timeStr}
          </div>
        </aside>
      </section>

      <WinnerReveal
        winners={revealed}
        mode={settings.wheel.displayMode}
        open={revealOpen}
        onClose={() => setRevealOpen(false)}
        titleText={t("winners_title")}
        congratsText={t("congrats")}
        closeText={t("btn_close")}
      />
    </div>
  );
}

function Stat({ icon, label, value, accent }: { icon: React.ReactNode; label: string; value: number | string; accent: "blue" | "yellow" | "orange" }) {
  const glow = accent === "yellow" ? "glow-yellow" : accent === "orange" ? "glow-orange" : "glow-blue";
  const text = accent === "yellow" ? "text-[var(--safety-yellow)]" : accent === "orange" ? "text-[var(--safety-orange)]" : "text-[var(--safety-blue-glow,#67a0ff)]";
  return (
    <div className={`glass rounded-2xl p-4 ${glow}`} style={{ boxShadow: "inset 0 1px 0 rgba(255,255,255,0.1)" }}>
      <div className={`flex items-center justify-center gap-2 ${text}`}>
        {icon}
        <span className="text-[10px] font-bold uppercase tracking-[0.25em]">{label}</span>
      </div>
      <div className="mt-1 text-center font-display text-3xl font-extrabold text-foreground md:text-4xl">
        {value}
      </div>
    </div>
  );
}
