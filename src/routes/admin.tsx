import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Users, Trash2, Sparkles, Eye, Upload, Volume2, VolumeX, Trash } from "lucide-react";
import { useSettings } from "@/lib/settings-store";
import { useParticipants } from "@/lib/participants-store";
import { BACKGROUND_PRESETS } from "@/lib/settings-defaults";
import type { LangMode, TextKey } from "@/lib/i18n";
import { TEXT_KEYS, DEFAULT_TEXTS } from "@/lib/i18n";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin Panel — Safety Lucky Draw" },
      { name: "description", content: "Configure the Safety Lucky Draw event." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminPage,
});

type Tab = "general" | "branding" | "participants" | "theme" | "text" | "wheel" | "sound";

function AdminPage() {
  const { settings, setSettings, init: initSettings, t } = useSettings();
  const { participants, init: initParticipants, generate, remove, resetAll, refresh } = useParticipants();
  const [tab, setTab] = useState<Tab>("general");
  const [genCount, setGenCount] = useState(200);
  const bgmInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => { void initSettings(); void initParticipants(); }, [initSettings, initParticipants]);

  async function fileToDataUrl(file: File, maxMB = 5): Promise<string | null> {
    if (file.size > maxMB * 1024 * 1024) {
      alert(`File terlalu besar. Maks ${maxMB} MB.`);
      return null;
    }
    return new Promise((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => resolve(r.result as string);
      r.onerror = () => reject(r.error);
      r.readAsDataURL(file);
    });
  }

  async function handleBgmUpload(file: File) {
    if (!file) return;
    setUploading(true);
    try {
      const dataUrl = await fileToDataUrl(file, 8);
      if (dataUrl) setSettings((s) => ({ ...s, sound: { ...s.sound, bgmUrl: dataUrl } }));
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-white/10 glass-strong sticky top-0 z-20">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-4">
          <div className="flex items-center gap-3">
            <Link to="/" className="glass rounded-full p-2 hover:bg-white/10"><ArrowLeft className="h-4 w-4" /></Link>
            <h1 className="font-display text-xl font-bold grad-text-gold">{t("admin_title")}</h1>
          </div>
          <div className="text-xs text-muted-foreground">Auto-saved · {settings.lang.toUpperCase()}</div>
        </div>
        <nav className="mx-auto flex max-w-7xl gap-1 overflow-x-auto px-6 pb-2">
          {(["general", "branding", "participants", "theme", "text", "wheel", "sound"] as const).map((id) => (
            <button key={id} onClick={() => setTab(id)}
              className={`whitespace-nowrap rounded-lg px-4 py-2 text-sm font-semibold transition ${
                tab === id ? "bg-[var(--safety-yellow)] text-black" : "text-muted-foreground hover:bg-white/5"
              }`}>
              {id === "general" ? t("admin_general")
                : id === "branding" ? "Branding & Ornamen"
                : id === "participants" ? t("admin_participants")
                : id === "theme" ? t("admin_theme")
                : id === "text" ? t("admin_text")
                : id === "sound" ? t("admin_sound")
                : "Wheel"}
            </button>
          ))}
        </nav>
      </header>

      <main className="mx-auto max-w-7xl space-y-6 px-6 py-8">
        {tab === "general" && (
          <section className="glass rounded-2xl p-6 space-y-5">
            <Field label="Language Mode">
              <select value={settings.lang}
                onChange={(e) => setSettings((s) => ({ ...s, lang: e.target.value as LangMode }))}
                className="rounded-lg bg-black/40 border border-white/15 px-3 py-2">
                <option value="id">Indonesian</option>
                <option value="zh">Mandarin</option>
                <option value="id_zh">Indonesian + Mandarin</option>
                <option value="zh_id">Mandarin + Indonesian</option>
              </select>
            </Field>
            <Field label="Operator name">
              <input value={settings.operator}
                onChange={(e) => setSettings((s) => ({ ...s, operator: e.target.value }))}
                className="rounded-lg bg-black/40 border border-white/15 px-3 py-2 w-72" />
            </Field>
            <Field label="Current round">
              <input type="number" min={1} value={settings.currentRound}
                onChange={(e) => setSettings((s) => ({ ...s, currentRound: Number(e.target.value) || 1 }))}
                className="rounded-lg bg-black/40 border border-white/15 px-3 py-2 w-32" />
            </Field>

            <h3 className="font-display text-lg font-bold pt-4">Background</h3>
            <Field label="Preset">
              <select value={settings.background.preset}
                onChange={(e) => setSettings((s) => ({ ...s, background: { ...s.background, preset: e.target.value, customUrl: undefined } }))}
                className="rounded-lg bg-black/40 border border-white/15 px-3 py-2">
                {BACKGROUND_PRESETS.map((p) => <option key={p.id} value={p.id}>{p.label}</option>)}
              </select>
            </Field>
            <Slider label="Brightness" min={20} max={150} value={settings.background.brightness}
              onChange={(v) => setSettings((s) => ({ ...s, background: { ...s.background, brightness: v } }))} suffix="%" />
            <Slider label="Blur" min={0} max={20} value={settings.background.blur}
              onChange={(v) => setSettings((s) => ({ ...s, background: { ...s.background, blur: v } }))} suffix="px" />
            <Slider label="Overlay opacity" min={0} max={100} value={settings.background.overlayOpacity}
              onChange={(v) => setSettings((s) => ({ ...s, background: { ...s.background, overlayOpacity: v } }))} suffix="%" />
            <Slider label="Zoom" min={80} max={150} value={settings.background.zoom}
              onChange={(v) => setSettings((s) => ({ ...s, background: { ...s.background, zoom: v } }))} suffix="%" />
          </section>
        )}

        {tab === "participants" && (
          <section className="glass rounded-2xl p-6 space-y-5">
            <div className="flex flex-wrap items-end gap-3">
              <Field label="Auto-generate participants">
                <div className="flex gap-2">
                  <input type="number" min={1} max={5000} value={genCount}
                    onChange={(e) => setGenCount(Number(e.target.value) || 0)}
                    className="rounded-lg bg-black/40 border border-white/15 px-3 py-2 w-32" />
                  <button onClick={async () => {
                    if (!confirm(`This replaces all participants with ${genCount} sequential numbers. Continue?`)) return;
                    await generate(genCount);
                  }} className="rounded-lg bg-[var(--safety-yellow)] px-4 py-2 font-semibold text-black hover:brightness-110">
                    <Sparkles className="inline h-4 w-4 mr-1" /> Generate
                  </button>
                </div>
              </Field>
              <button onClick={async () => {
                if (!confirm("Reset all winners (mark no one as won)?")) return;
                await resetAll();
              }} className="rounded-lg bg-white/5 px-4 py-2 font-semibold hover:bg-white/10">Reset all winners</button>
              <button onClick={async () => {
                if (!confirm("Delete ALL participants?")) return;
                await remove(participants.map((p) => p.id));
              }} className="rounded-lg bg-destructive/80 px-4 py-2 font-semibold hover:bg-destructive">
                <Trash2 className="inline h-4 w-4 mr-1" /> Delete all
              </button>
              <button onClick={() => refresh()} className="rounded-lg bg-white/5 px-4 py-2 font-semibold hover:bg-white/10">Refresh</button>
            </div>

            <div className="text-sm text-muted-foreground">
              <Users className="inline h-4 w-4 mr-1" /> {participants.length} participants · {participants.filter((p) => p.has_won).length} winners marked
            </div>

            <div className="max-h-[60vh] overflow-auto rounded-xl border border-white/10">
              <table className="w-full text-sm">
                <thead className="bg-white/5 sticky top-0">
                  <tr><th className="px-3 py-2 text-left">#</th><th className="px-3 py-2 text-left">Name</th><th className="px-3 py-2 text-left">Department</th><th className="px-3 py-2">Won</th></tr>
                </thead>
                <tbody>
                  {participants.slice(0, 500).map((p) => (
                    <tr key={p.id} className="border-t border-white/5">
                      <td className="px-3 py-1.5 font-mono">{p.number}</td>
                      <td className="px-3 py-1.5">{p.name ?? <span className="text-muted-foreground italic">—</span>}</td>
                      <td className="px-3 py-1.5">{p.department ?? <span className="text-muted-foreground italic">—</span>}</td>
                      <td className="px-3 py-1.5 text-center">{p.has_won ? "🏆" : ""}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {participants.length > 500 && <div className="p-3 text-xs text-muted-foreground text-center">Showing first 500 of {participants.length}.</div>}
            </div>

            <p className="text-xs text-muted-foreground">Excel/CSV import, manual add, and per-row edit/delete arrive in the next phase. For now use Auto-generate.</p>
          </section>
        )}

        {tab === "theme" && (
          <section className="glass rounded-2xl p-6 space-y-4">
            <ColorField label="Primary (Safety Blue)" value={settings.theme.primary}
              onChange={(v) => setSettings((s) => ({ ...s, theme: { ...s.theme, primary: v } }))} />
            <ColorField label="Accent (Safety Yellow)" value={settings.theme.accent}
              onChange={(v) => setSettings((s) => ({ ...s, theme: { ...s.theme, accent: v } }))} />
            <ColorField label="Secondary (Safety Orange)" value={settings.theme.secondary}
              onChange={(v) => setSettings((s) => ({ ...s, theme: { ...s.theme, secondary: v } }))} />
            <p className="text-xs text-muted-foreground">Colors are passed to the spinning wheel immediately.</p>
          </section>
        )}

        {tab === "text" && (
          <section className="glass rounded-2xl p-6 space-y-4">
            <p className="text-sm text-muted-foreground">
              Edit Indonesian and Mandarin once — the home page shows them stacked automatically
              (Indonesian on top, Mandarin below) when the language mode is combined.
              Leave a field empty to use the built-in default.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-[180px_1fr_1fr] gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">
              <div>Key</div><div>Indonesian</div><div>Mandarin (中文)</div>
            </div>
            {TEXT_KEYS.map((k) => (
              <div key={k} className="grid grid-cols-1 md:grid-cols-[180px_1fr_1fr] gap-2 items-center">
                <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">{k}</label>
                <input
                  placeholder={DEFAULT_TEXTS.id[k as TextKey]}
                  value={settings.texts?.id?.[k as TextKey] ?? ""}
                  onChange={(e) => setSettings((s) => ({
                    ...s,
                    texts: { ...s.texts, id: { ...(s.texts?.id ?? {}), [k]: e.target.value } },
                  }))}
                  className="rounded-lg bg-black/40 border border-white/15 px-3 py-2"
                />
                <input
                  placeholder={DEFAULT_TEXTS.zh[k as TextKey]}
                  value={settings.texts?.zh?.[k as TextKey] ?? ""}
                  onChange={(e) => setSettings((s) => ({
                    ...s,
                    texts: { ...s.texts, zh: { ...(s.texts?.zh ?? {}), [k]: e.target.value } },
                  }))}
                  className="rounded-lg bg-black/40 border border-white/15 px-3 py-2"
                  lang="zh"
                />
              </div>
            ))}
          </section>
        )}

        {tab === "wheel" && (
          <section className="glass rounded-2xl p-6 space-y-5">
            <Slider label="Spin duration" min={5} max={10} value={settings.wheel.spinDurationSec}
              onChange={(v) => setSettings((s) => ({ ...s, wheel: { ...s.wheel, spinDurationSec: v } }))} suffix="s" />
            <Field label="Winners per round">
              <select value={settings.wheel.winnersPerRound}
                onChange={(e) => setSettings((s) => ({ ...s, wheel: { ...s.wheel, winnersPerRound: Number(e.target.value) as any } }))}
                className="rounded-lg bg-black/40 border border-white/15 px-3 py-2">
                {[1, 5, 10, 15, 20].map((n) => <option key={n} value={n}>{n}</option>)}
              </select>
            </Field>
            <Field label="Winner display mode">
              <select value={settings.wheel.displayMode}
                onChange={(e) => setSettings((s) => ({ ...s, wheel: { ...s.wheel, displayMode: e.target.value as any } }))}
                className="rounded-lg bg-black/40 border border-white/15 px-3 py-2">
                <option value="number">Number only</option>
                <option value="name">Name only</option>
                <option value="number_name">Number + Name</option>
                <option value="number_department">Number + Department</option>
                <option value="number_name_department">Number + Name + Department</option>
                <option value="number_name_photo">Number + Name + Photo</option>
              </select>
            </Field>
            <Link to="/" className="inline-flex items-center gap-2 rounded-full bg-[var(--safety-yellow)] px-5 py-2 font-semibold text-black hover:brightness-110">
              <Eye className="h-4 w-4" /> View live draw
            </Link>
          </section>
        )}

        {tab === "sound" && (
          <section className="glass rounded-2xl p-6 space-y-5">
            <h3 className="font-display text-lg font-bold">Background Music</h3>
            <p className="text-xs text-muted-foreground">
              Upload an MP3 / OGG / WAV file. It is stored in the cloud database and will play automatically on every device that opens this app. Keep the file under 8 MB for fast sync.
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <input
                ref={bgmInputRef}
                type="file"
                accept="audio/*"
                className="hidden"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) void handleBgmUpload(f); e.currentTarget.value = ""; }}
              />
              <button
                onClick={() => bgmInputRef.current?.click()}
                disabled={uploading}
                className="inline-flex items-center gap-2 rounded-lg bg-[var(--safety-yellow)] px-4 py-2 font-semibold text-black hover:brightness-110 disabled:opacity-60"
              >
                <Upload className="h-4 w-4" /> {uploading ? "Uploading…" : (settings.sound.bgmUrl ? "Replace music" : "Upload music")}
              </button>
              {settings.sound.bgmUrl && (
                <button
                  onClick={() => { if (confirm("Remove background music?")) setSettings((s) => ({ ...s, sound: { ...s.sound, bgmUrl: null } })); }}
                  className="inline-flex items-center gap-2 rounded-lg bg-destructive/80 px-4 py-2 font-semibold hover:bg-destructive"
                >
                  <Trash className="h-4 w-4" /> Remove
                </button>
              )}
              <button
                onClick={() => setSettings((s) => ({ ...s, sound: { ...s.sound, muted: !s.sound.muted } }))}
                className="inline-flex items-center gap-2 rounded-lg bg-white/5 px-4 py-2 font-semibold hover:bg-white/10"
              >
                {settings.sound.muted ? <><VolumeX className="h-4 w-4" /> Unmute</> : <><Volume2 className="h-4 w-4" /> Mute</>}
              </button>
            </div>

            {settings.sound.bgmUrl && (
              <div className="space-y-2">
                <div className="text-xs text-muted-foreground">Preview:</div>
                <audio src={settings.sound.bgmUrl} controls className="w-full max-w-md" />
              </div>
            )}

            <Slider label="Master volume" min={0} max={100} value={settings.sound.master}
              onChange={(v) => setSettings((s) => ({ ...s, sound: { ...s.sound, master: v } }))} suffix="%" />
            <Slider label="Music volume" min={0} max={100} value={settings.sound.music}
              onChange={(v) => setSettings((s) => ({ ...s, sound: { ...s.sound, music: v } }))} suffix="%" />
            <Slider label="Effects volume" min={0} max={100} value={settings.sound.effects}
              onChange={(v) => setSettings((s) => ({ ...s, sound: { ...s.sound, effects: v } }))} suffix="%" />

            <h3 className="font-display text-lg font-bold pt-4">Sound Effects</h3>
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={settings.sound.spinSfxEnabled}
                onChange={(e) => setSettings((s) => ({ ...s, sound: { ...s.sound, spinSfxEnabled: e.target.checked } }))}
                className="h-4 w-4 accent-[var(--safety-yellow)]" />
              <span className="text-sm">Wheel ticking sound while spinning</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={settings.sound.winnerSfxEnabled}
                onChange={(e) => setSettings((s) => ({ ...s, sound: { ...s.sound, winnerSfxEnabled: e.target.checked } }))}
                className="h-4 w-4 accent-[var(--safety-yellow)]" />
              <span className="text-sm">Fanfare sound when a winner is revealed</span>
            </label>
          </section>
        )}
      </main>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1 block text-xs font-bold uppercase tracking-widest text-muted-foreground">{label}</label>
      {children}
    </div>
  );
}

function Slider({ label, min, max, value, onChange, suffix }: { label: string; min: number; max: number; value: number; onChange: (v: number) => void; suffix?: string }) {
  return (
    <div>
      <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1">
        <span>{label}</span><span>{value}{suffix ?? ""}</span>
      </div>
      <input type="range" min={min} max={max} value={value} onChange={(e) => onChange(Number(e.target.value))} className="w-full accent-[var(--safety-yellow)]" />
    </div>
  );
}

function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <Field label={label}>
      <div className="flex items-center gap-3">
        <input type="color" value={value} onChange={(e) => onChange(e.target.value)} className="h-10 w-16 cursor-pointer rounded-lg bg-transparent" />
        <input value={value} onChange={(e) => onChange(e.target.value)} className="rounded-lg bg-black/40 border border-white/15 px-3 py-2 w-40 font-mono text-sm" />
      </div>
    </Field>
  );
}
