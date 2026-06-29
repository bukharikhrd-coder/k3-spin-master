import confetti from "canvas-confetti";

export function fireCelebration() {
  const end = Date.now() + 2500;
  const colors = ["#FFC107", "#FF7A00", "#0B5ED7", "#ffffff"];
  (function frame() {
    confetti({ particleCount: 6, angle: 60, spread: 65, origin: { x: 0, y: 0.7 }, colors });
    confetti({ particleCount: 6, angle: 120, spread: 65, origin: { x: 1, y: 0.7 }, colors });
    if (Date.now() < end) requestAnimationFrame(frame);
  })();
  confetti({ particleCount: 150, spread: 100, startVelocity: 45, origin: { y: 0.6 }, colors });
  setTimeout(() => confetti({ particleCount: 200, spread: 160, startVelocity: 55, origin: { y: 0.5 }, colors }), 400);
}

// ---------------- Web Audio sound effects ----------------
// Synthesized so they need no extra uploads. Volume is master*effects/10000.

let _ctx: AudioContext | null = null;
function ctx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (_ctx) return _ctx;
  const Ctor: typeof AudioContext | undefined =
    (window as any).AudioContext || (window as any).webkitAudioContext;
  if (!Ctor) return null;
  _ctx = new Ctor();
  return _ctx;
}

function effVolume(master: number, effects: number, muted: boolean) {
  if (muted) return 0;
  return Math.max(0, Math.min(1, (master / 100) * (effects / 100)));
}

/** A single short "tick" click — used while wheel spins. */
function tick(c: AudioContext, vol: number) {
  const t = c.currentTime;
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = "square";
  osc.frequency.value = 1800;
  gain.gain.setValueAtTime(vol * 0.18, t);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.06);
  osc.connect(gain).connect(c.destination);
  osc.start(t);
  osc.stop(t + 0.07);
}

/**
 * Schedule a stream of ticks that start fast and gradually slow down over
 * `durationSec`, mirroring the wheel's deceleration. Returns a stop fn.
 */
export function startSpinSfx(opts: { durationSec: number; master: number; effects: number; muted: boolean; url?: string | null }) {
  // If an uploaded SFX is provided, play it once (looped) for the duration.
  if (opts.url) {
    const vol = effVolume(opts.master, opts.effects, opts.muted);
    if (vol <= 0) return () => {};
    const a = new Audio(opts.url);
    a.loop = true;
    a.volume = vol;
    a.play().catch(() => {});
    return () => { try { a.pause(); a.src = ""; } catch {} };
  }
  const c = ctx();
  if (!c) return () => {};
  const vol = effVolume(opts.master, opts.effects, opts.muted);
  if (vol <= 0) return () => {};
  if (c.state === "suspended") void c.resume();

  let stopped = false;
  const start = performance.now();
  const total = opts.durationSec * 1000;

  const loop = () => {
    if (stopped) return;
    const t = Math.min(1, (performance.now() - start) / total);
    tick(c, vol);
    // interval grows from 40ms → 320ms (cubic-out, matches wheel ease)
    const ease = 1 - Math.pow(1 - t, 3);
    const interval = 40 + ease * 280;
    if (t < 1) setTimeout(loop, interval);
  };
  loop();
  return () => { stopped = true; };
}

/** Triumphant fanfare on a winner reveal. */
export function playWinnerSfx(opts: { master: number; effects: number; muted: boolean }) {
  const c = ctx();
  if (!c) return;
  const vol = effVolume(opts.master, opts.effects, opts.muted);
  if (vol <= 0) return;
  if (c.state === "suspended") void c.resume();

  const t0 = c.currentTime;
  const notes = [
    { f: 523.25, t: 0.00, d: 0.18 }, // C5
    { f: 659.25, t: 0.14, d: 0.18 }, // E5
    { f: 783.99, t: 0.28, d: 0.22 }, // G5
    { f: 1046.5, t: 0.46, d: 0.55 }, // C6 — sustain
  ];
  for (const n of notes) {
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = "triangle";
    osc.frequency.value = n.f;
    const start = t0 + n.t;
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(vol * 0.32, start + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + n.d);
    osc.connect(gain).connect(c.destination);
    osc.start(start);
    osc.stop(start + n.d + 0.05);
  }
  // shimmer
  const shimmer = c.createOscillator();
  const sg = c.createGain();
  shimmer.type = "sine";
  shimmer.frequency.setValueAtTime(1568, t0 + 0.5);
  shimmer.frequency.exponentialRampToValueAtTime(2637, t0 + 1.1);
  sg.gain.setValueAtTime(0.0001, t0 + 0.5);
  sg.gain.exponentialRampToValueAtTime(vol * 0.18, t0 + 0.55);
  sg.gain.exponentialRampToValueAtTime(0.0001, t0 + 1.2);
  shimmer.connect(sg).connect(c.destination);
  shimmer.start(t0 + 0.5);
  shimmer.stop(t0 + 1.25);
}
