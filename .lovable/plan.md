# BULAN KESELAMATAN PRODUKSI 2026 – Safety Lucky Draw

A cinematic, enterprise-grade K3-themed lucky draw web app with a circular spinning wheel, full admin customization, and Supabase-backed cloud sync.

## Scope & approach

This is a very large build. I'll deliver it in **3 phases** so you can review and steer between each. Each phase ends in a working, testable app.

### Phase 1 — Foundation, design system, wheel, core draw flow (this turn)
- Enable Lovable Cloud (Supabase) for auth, data, storage, realtime.
- Design system in `src/styles.css`: Safety Blue `#0B5ED7`, Safety Yellow `#FFC107`, Safety Orange `#FF7A00`, white, black, metallic gray — oklch tokens, glass/metal/glow utilities, industrial typography pair (display + body), cinematic shadows.
- Schema + RLS:
  - `app_settings` (singleton JSON: theme colors, background config, logos, language mode, text strings, wheel config, sound config, decoration toggles, animation speed)
  - `participants` (number, name, department, photo_url)
  - `draw_history` (round, winners jsonb, operator, created_at)
  - `winners_state` (already-won participant ids for current cycle)
  - `user_roles` + `has_role()` (admin role; default admin/admin123 seeded)
  - Storage buckets: `logos`, `backgrounds`, `participant-photos`, `audio`
- Realtime subscription on `app_settings` so every device updates instantly; localStorage used only as offline cache with sync-on-reconnect.
- **Circular wheel** (Canvas-rendered for perf with 1000+ participants):
  - Equal segments, auto-sized text, number-only mode when crowded
  - Fixed top pointer, mechanical easing (accel → cruise → decel), mathematically precise stop on pre-computed winner
  - 5–10s configurable spin, default 7s
  - Multi-winner: pick N unique winners up front, single spin, reveal all simultaneously after stop
- Home screen: company logo, event logo, editable titles, live stats (total / remaining / winners / round / date / time), background layer with brightness/blur/overlay/zoom controls applied via CSS vars.
- Winner reveal: glass cards with glow, 2×5 layout for 10 winners on desktop; display modes (Number / Name / Number+Name / +Dept / +Photo).
- Default avatar: yellow safety helmet (generated asset).

### Phase 2 — Admin panel, participants, i18n, history
- Auth: Supabase email/password; seed `admin@lucky.local` / `admin123` with admin role on first boot. Login screen accepts username "admin" mapped to that email.
- Admin panel (gated under `_authenticated/admin`):
  - Auto-save on every change (debounced) → `app_settings`, no Save button
  - Text editor for ALL visible strings across 4 language modes (ID, ZH, ID+ZH, ZH+ID)
  - Theme editor (all colors), background manager (built-in presets + upload to Storage, brightness/blur/overlay/zoom/position), logo manager (size/position/opacity)
  - Wheel config (spin duration, winners per round 1/5/10/15/20, display mode)
  - Decoration toggles (gears, helmets, hazard stripes, APAR, cones, smoke, dust, sparkles, stage lights) + speed (Slow/Normal/Fast) + Reduced Motion
  - Sound config: master/music/effects volumes, mute, upload custom MP3
  - Change password, logout, confirm dialogs on destructive actions
- Participants:
  - Import .xlsx / .csv (SheetJS + papaparse), manual add/edit/delete, search, sort, bulk delete, export
  - Auto-generate N participants: sequential numbers `001..N`, empty name/department
  - "Unknown/N/A" never rendered — fall back to number only
- Draw history: round, winners, date/time, operator; search; export to xlsx/csv
- Reset current round / Reset all winners (confirm dialogs)

### Phase 3 — Sound, celebrations, decorations, presentation mode, polish
- Sound system: click, machine start, spin loop, gears, siren, countdown, applause, cheer, fireworks, announcement, celebration, BGM with the volume controls above
- Celebration FX on stop: confetti, fireworks, sparkles, gold particles, moving spotlights, glow overlay, camera flashes (canvas-based, GPU-friendly; respects Reduced Motion)
- Industrial decoration layer (each toggleable, speed-controlled)
- Presentation Mode route: hides admin chrome, enlarges typography/cards, fullscreen, shortcuts (Space spin, Enter next round, Esc exit fullscreen)
- Responsive QA: desktop, laptop, tablet, mobile, projector/LED (1920×1080, 3840×2160)
- Performance pass: Canvas wheel, throttled realtime, lazy audio, image format conversion

## Technical notes

- Stack stays on the template: React 19 + TanStack Start + Tailwind v4 + shadcn + Framer Motion + GSAP + Lucide. Supabase via Lovable Cloud.
- Wheel rendered with HTML Canvas (handles 1000+ segments smoothly); pointer is a separate SVG overlay that never rotates.
- Winner selection is deterministic before the spin; final wheel angle is computed so the chosen segment lands exactly under the pointer (no jitter/overshoot).
- Realtime: a single root subscription to `app_settings` updates a Zustand-style store; components read from the store. Offline writes queue in IndexedDB and flush on reconnect.
- All admin-editable strings live in `app_settings.i18n[lang_mode][key]` — components read via `t(key)`; nothing hardcoded in the UI layer.
- RLS: `app_settings` and `participants` writable only by admin role; readable by anon (public display devices don't need login). `user_roles` checked via `has_role()` security-definer fn.
- Default admin seeded via migration calling Supabase Auth Admin API in a one-shot bootstrap server fn protected by an env-gated guard.

## What I need from you before I start

1. **Confirm the 3-phase rollout** (vs trying to one-shot everything — one-shot risks an unreviewable mega-diff).
2. **Public viewing**: should the lucky-draw display screen be viewable without login (so projectors/LED walls just open the URL), or require login? I'll default to **public read, admin-only write** unless you say otherwise.
3. **Default admin email**: I'll use `admin@lucky.local` / `admin123` (Supabase requires an email). The login UI will accept username `admin` and map it to that email. OK?
4. Anything you want me to **drop or simplify** to keep scope sane?

Reply "go" (with any answers to 2–4) and I'll start Phase 1.