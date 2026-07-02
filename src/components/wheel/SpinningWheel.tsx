import { useEffect, useImperativeHandle, useRef, forwardRef } from "react";
import type { Participant } from "@/lib/participants-store";

export interface SpinningWheelHandle {
  spinTo: (winnerIds: string[], durationSec: number) => Promise<void>;
}

interface Props {
  participants: Participant[];
  size?: number;
  showNumbersOnly?: boolean;
  colors?: { primary: string; accent: string; secondary: string };
  centerImageUrl?: string | null;
}

/**
 * Cinematic spinning wheel rendered to Canvas for performance with 1000+ segments.
 * - Mechanically precise stop: easing reaches exactly the angle where the
 *   first winnerId sits under the fixed top pointer (12 o'clock).
 * - Equal-angle segments, alternating premium colors, auto-sized labels.
 */
export const SpinningWheel = forwardRef<SpinningWheelHandle, Props>(function SpinningWheel(
  { participants, size = 720, showNumbersOnly, colors, centerImageUrl }, ref,
) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const angleRef = useRef(0);                  // current rotation, radians
  const animatingRef = useRef(false);
  const centerImgRef = useRef<HTMLImageElement | null>(null);

  const palette = colors ?? { primary: "#0B5ED7", accent: "#FFC107", secondary: "#FF7A00" };

  // Load center image whenever the URL changes; redraw when it becomes available.
  useEffect(() => {
    if (!centerImageUrl) { centerImgRef.current = null; return; }
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => { centerImgRef.current = img; draw(angleRef.current); };
    img.onerror = () => { centerImgRef.current = null; };
    img.src = centerImageUrl;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [centerImageUrl]);

  const draw = (angle: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const w = size, h = size;
    if (canvas.width !== w * dpr || canvas.height !== h * dpr) {
      canvas.width = w * dpr; canvas.height = h * dpr;
      canvas.style.width = `${w}px`; canvas.style.height = `${h}px`;
    }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);

    const cx = w / 2, cy = h / 2;
    const outerR = w / 2 - 10;
    const innerR = outerR * 0.18;
    const n = Math.max(1, participants.length);
    const seg = (Math.PI * 2) / n;
    const forceNumbersOnly = showNumbersOnly && n > 60;

    // outer metal ring
    ctx.save();
    const ringGrad = ctx.createRadialGradient(cx, cy, outerR - 4, cx, cy, outerR + 6);
    ringGrad.addColorStop(0, "#8a93a8");
    ringGrad.addColorStop(0.5, "#d8dde6");
    ringGrad.addColorStop(1, "#3a4150");
    ctx.fillStyle = ringGrad;
    ctx.beginPath(); ctx.arc(cx, cy, outerR + 6, 0, Math.PI * 2); ctx.fill();
    ctx.restore();

    // hazard outer band
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(angle * 0.3);
    for (let i = 0; i < 60; i++) {
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, outerR + 2, (i / 60) * Math.PI * 2, ((i + 1) / 60) * Math.PI * 2);
      ctx.closePath();
      ctx.fillStyle = i % 2 === 0 ? palette.accent : "#1a1f2e";
      ctx.fill();
    }
    ctx.restore();

    // segments
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(angle - Math.PI / 2); // 0 at top
    for (let i = 0; i < n; i++) {
      const a0 = i * seg;
      const a1 = a0 + seg;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, outerR - 6, a0, a1);
      ctx.closePath();
      // alternating gradient
      const isAccent = i % 3 === 0;
      const isSecond = i % 3 === 1;
      const c1 = isAccent ? palette.accent : isSecond ? palette.secondary : palette.primary;
      const c2 = isAccent ? "#c98f00" : isSecond ? "#c45c00" : "#073b88";
      const g = ctx.createLinearGradient(0, 0, Math.cos((a0 + a1) / 2) * outerR, Math.sin((a0 + a1) / 2) * outerR);
      g.addColorStop(0, c1);
      g.addColorStop(1, c2);
      ctx.fillStyle = g;
      ctx.fill();
      ctx.lineWidth = 1.2;
      ctx.strokeStyle = "rgba(0,0,0,0.35)";
      ctx.stroke();
    }
    ctx.restore();

    // labels (skip if too many to be legible)
    const labelable = n <= 240;
    if (labelable) {
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(angle - Math.PI / 2);
      const fontSize = Math.max(8, Math.min(22, (outerR * 0.9 * seg)));
      ctx.font = `700 ${fontSize}px Oswald, Inter, sans-serif`;
      ctx.fillStyle = "#0a0f1e";
      ctx.textAlign = "right";
      ctx.textBaseline = "middle";
      for (let i = 0; i < n; i++) {
        const p = participants[i];
        const mid = i * seg + seg / 2;
        ctx.save();
        ctx.rotate(mid);
        const label = forceNumbersOnly || !p.name ? p.number : `${p.number}`;
        ctx.fillText(label, outerR - 22, 0);
        ctx.restore();
      }
      ctx.restore();
    }

    // center hub
    ctx.save();
    const hubGrad = ctx.createRadialGradient(cx - 6, cy - 6, 2, cx, cy, innerR + 8);
    hubGrad.addColorStop(0, "#f5f7fa");
    hubGrad.addColorStop(0.6, "#9aa3b5");
    hubGrad.addColorStop(1, "#2a2f3d");
    ctx.fillStyle = hubGrad;
    ctx.beginPath(); ctx.arc(cx, cy, innerR + 8, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = palette.accent;
    ctx.beginPath(); ctx.arc(cx, cy, innerR, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#1a1f2e";
    ctx.font = "900 22px Oswald, Inter, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("K3", cx, cy);
    ctx.restore();

    // inner highlight
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy - outerR * 0.3, outerR * 0.6, 0, Math.PI * 2);
    const sheen = ctx.createRadialGradient(cx, cy - outerR * 0.5, 0, cx, cy - outerR * 0.5, outerR * 0.6);
    sheen.addColorStop(0, "rgba(255,255,255,0.18)");
    sheen.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = sheen;
    ctx.fill();
    ctx.restore();
  };

  // initial + on-data render
  useEffect(() => { draw(angleRef.current); /* eslint-disable-next-line */ }, [participants, size, showNumbersOnly]);

  useImperativeHandle(ref, () => ({
    spinTo: (winnerIds, durationSec) =>
      new Promise<void>((resolve) => {
        if (animatingRef.current || winnerIds.length === 0) return resolve();
        const winnerIdx = participants.findIndex((p) => p.id === winnerIds[0]);
        if (winnerIdx < 0) return resolve();

        const n = participants.length;
        const seg = (Math.PI * 2) / n;
        // target: center of winnerIdx at top (angle 0 in our wheel-rotated frame)
        // We render with rotate(angle - Math.PI/2) and segments start at 0 → so to align
        // the winner mid with the pointer at top, final angle = -((winnerIdx + 0.5) * seg)
        const startAngle = angleRef.current;
        const fullTurns = 6 + Math.floor(Math.random() * 3); // 6..8 turns
        const target = -((winnerIdx + 0.5) * seg);
        // Normalize current angle into [-2PI, 0]
        const startMod = ((startAngle % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
        const endAngle = startAngle - startMod + (target - Math.PI * 2 * fullTurns);

        const dur = durationSec * 1000;
        const t0 = performance.now();
        animatingRef.current = true;

        // cubic-out easing for natural deceleration; precise endpoint guaranteed
        const ease = (t: number) => 1 - Math.pow(1 - t, 3);
        const step = (now: number) => {
          const t = Math.min(1, (now - t0) / dur);
          const a = startAngle + (endAngle - startAngle) * ease(t);
          angleRef.current = a;
          draw(a);
          if (t < 1) {
            requestAnimationFrame(step);
          } else {
            angleRef.current = endAngle;
            draw(endAngle);
            animatingRef.current = false;
            resolve();
          }
        };
        requestAnimationFrame(step);
      }),
  }), [participants]);

  return (
    <div className="relative" style={{ width: size, height: size }}>
      {/* glow */}
      <div
        className="pointer-events-none absolute inset-0 rounded-full glow-yellow"
        style={{ animation: "pulse-glow 3s ease-in-out infinite" }}
      />
      <canvas ref={canvasRef} className="relative block rounded-full" />
      {/* fixed top pointer */}
      <svg
        className="pointer-events-none absolute left-1/2 -translate-x-1/2"
        style={{ top: -18, filter: "drop-shadow(0 6px 10px rgba(0,0,0,0.6))" }}
        width="64" height="80" viewBox="0 0 64 80"
      >
        <defs>
          <linearGradient id="ptr" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#fff3a0" />
            <stop offset="0.5" stopColor="#ffc107" />
            <stop offset="1" stopColor="#ff7a00" />
          </linearGradient>
        </defs>
        <path d="M32 78 L4 12 Q32 0 60 12 Z" fill="url(#ptr)" stroke="#1a1f2e" strokeWidth="2" />
        <circle cx="32" cy="14" r="6" fill="#1a1f2e" />
      </svg>
    </div>
  );
});
