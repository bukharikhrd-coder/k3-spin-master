import { motion } from "framer-motion";
import type { AppSettings, OrnamentPosition } from "@/lib/settings-defaults";

/**
 * Decorative overlay layer for the home/draw screen.
 * - Built-in SVG ornaments themed for K3 (safety) + Juara (champion).
 * - User-uploaded ornaments positioned at chosen corners.
 * Pointer-events disabled so they never interfere with the wheel.
 */
export function SafetyOrnaments({ settings, compact = false }: { settings: AppSettings; compact?: boolean }) {
  const d = settings.decorations;
  // In fullscreen (compact) we actually want LARGER, MORE ornaments to fill
  // the empty side-columns around the wheel — not smaller ones.
  const scale = compact ? 1.15 : 1;
  const base = 96 * scale;

  return (
    <div className="pointer-events-none fixed inset-0 z-[5] overflow-hidden">
      {/* Top-left: gear (continuous rotation) */}
      {d.gears && (
        <motion.div
          className="absolute -left-6 -top-6"
          style={{ width: base * 1.6, height: base * 1.6 }}
          animate={{ rotate: 360 }}
          transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
        >
          <Gear color="#FFC107" opacity={0.22} />
        </motion.div>
      )}
      {/* Second smaller gear, counter-rotating, lower-mid-left */}
      {d.gears && (
        <motion.div
          className="absolute left-[6%] top-[55%]"
          style={{ width: base * 1.0, height: base * 1.0 }}
          animate={{ rotate: -360 }}
          transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
        >
          <Gear color="#FF7A00" opacity={0.18} />
        </motion.div>
      )}

      {/* Top-right: shield — floating + gentle pulse */}
      {d.shield && (
        <motion.div
          className="absolute -right-4 top-4"
          style={{ width: base * 1.3, height: base * 1.3 }}
          animate={{ y: [0, -12, 0], rotate: [-4, 4, -4], scale: [1, 1.05, 1] }}
          transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
        >
          <Shield />
        </motion.div>
      )}

      {/* Bottom-left: hard hat — bouncing & tilting */}
      {d.helmets && (
        <motion.div
          className="absolute bottom-4 left-4"
          style={{ width: base * 1.2, height: base * 1.2 }}
          animate={{ rotate: [-8, 8, -8], y: [0, -8, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        >
          <HardHat />
        </motion.div>
      )}

      {/* Bottom-right: trophy — celebratory bounce + glow */}
      {d.trophy && (
        <motion.div
          className="absolute bottom-6 right-6"
          style={{ width: base * 1.4, height: base * 1.4, filter: "drop-shadow(0 0 18px rgba(255,193,7,0.6))" }}
          animate={{ y: [0, -14, 0], rotate: [-6, 6, -6], scale: [1, 1.08, 1] }}
          transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
        >
          <Trophy />
        </motion.div>
      )}

      {/* Left middle: APAR — subtle sway */}
      {d.apar && (
        <motion.div
          className="absolute left-2 top-1/2 -translate-y-1/2"
          style={{ width: base * 0.9, height: base * 1.4 }}
          animate={{ rotate: [-3, 3, -3], y: [0, -4, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        >
          <Apar />
        </motion.div>
      )}

      {/* Right middle: traffic cones — bobbing */}
      {d.cones && (
        <motion.div
          className="absolute right-2 top-1/2 -translate-y-1/2"
          style={{ width: base * 0.9, height: base * 1.2 }}
          animate={{ y: [0, -6, 0], rotate: [-2, 2, -2] }}
          transition={{ duration: 3.6, repeat: Infinity, ease: "easeInOut" }}
        >
          <Cone />
        </motion.div>
      )}

      {/* Floating sparkles */}
      {d.sparkles && (
        <>
          {[0, 1, 2, 3, 4].map((i) => (
            <motion.div
              key={i}
              className="absolute"
              style={{
                left: `${15 + i * 17}%`,
                top: `${20 + (i % 2) * 50}%`,
                width: 14,
                height: 14,
              }}
              animate={{ opacity: [0.2, 1, 0.2], scale: [0.8, 1.2, 0.8] }}
              transition={{ duration: 2.4 + i * 0.4, repeat: Infinity, delay: i * 0.3 }}
            >
              <Spark />
            </motion.div>
          ))}
        </>
      )}

      {/* Extra fullscreen fillers — occupy the empty side columns around the wheel */}
      {compact && (
        <>
          {/* Upper-left stacked gear */}
          <motion.div
            className="absolute left-[3%] top-[22%]"
            style={{ width: base * 1.1, height: base * 1.1 }}
            animate={{ rotate: 360 }}
            transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
          >
            <Gear color="#0B5ED7" opacity={0.22} />
          </motion.div>
          {/* Upper-right shield accent */}
          <motion.div
            className="absolute right-[4%] top-[26%]"
            style={{ width: base * 1.1, height: base * 1.1 }}
            animate={{ y: [0, -10, 0], rotate: [-3, 3, -3] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          >
            <Shield />
          </motion.div>
          {/* Bottom-left mini trophy */}
          <motion.div
            className="absolute left-[10%] bottom-[8%]"
            style={{ width: base * 1.0, height: base * 1.0, filter: "drop-shadow(0 0 14px rgba(255,193,7,0.55))" }}
            animate={{ y: [0, -10, 0], rotate: [-5, 5, -5], scale: [1, 1.06, 1] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          >
            <Trophy />
          </motion.div>
          {/* Bottom-right hard hat */}
          <motion.div
            className="absolute right-[10%] bottom-[10%]"
            style={{ width: base * 1.0, height: base * 0.9 }}
            animate={{ rotate: [-6, 6, -6], y: [0, -6, 0] }}
            transition={{ duration: 3.4, repeat: Infinity, ease: "easeInOut" }}
          >
            <HardHat />
          </motion.div>
          {/* Bottom-center hazard stripe bar */}
          <motion.div
            className="absolute left-1/2 -translate-x-1/2 bottom-2"
            style={{ width: "40vw", height: 14, opacity: 0.35 }}
            animate={{ opacity: [0.25, 0.5, 0.25] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          >
            <HazardStripe />
          </motion.div>
          {/* Extra floating sparkles for atmosphere */}
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <motion.div
              key={`fs-spark-${i}`}
              className="absolute"
              style={{
                left: `${5 + i * 15}%`,
                top: `${40 + (i % 3) * 15}%`,
                width: 12,
                height: 12,
              }}
              animate={{ opacity: [0.15, 0.9, 0.15], scale: [0.7, 1.3, 0.7] }}
              transition={{ duration: 2.6 + i * 0.3, repeat: Infinity, delay: i * 0.25 }}
            >
              <Spark />
            </motion.div>
          ))}
        </>
      )}



      {/* Uploaded ornaments — each gently floats/rotates so they don't feel stiff */}
      {settings.ornaments
        ?.filter((o) => o.enabled && o.url)
        .map((o, i) => {
          const dur = 4 + (i % 3) * 0.7;
          const rot = 4 + (i % 2) * 2;
          return (
            <motion.img
              key={o.id}
              src={o.url!}
              alt=""
              style={{
                ...positionToStyle(o.position),
                width: o.size,
                height: "auto",
                opacity: o.opacity / 100,
                maxWidth: "30vw",
                maxHeight: "30vh",
              }}
              animate={{ y: [0, -10, 0], rotate: [-rot, rot, -rot], scale: [1, 1.04, 1] }}
              transition={{ duration: dur, repeat: Infinity, ease: "easeInOut", delay: i * 0.4 }}
              className="absolute object-contain drop-shadow-[0_4px_20px_rgba(0,0,0,0.5)]"
            />
          );
        })}
    </div>
  );
}

function positionToStyle(p: OrnamentPosition): React.CSSProperties {
  const v = p[0]; // t/m/b
  const h = p[1]; // l/c/r
  const s: React.CSSProperties = {};
  if (v === "t") s.top = 16;
  else if (v === "b") s.bottom = 16;
  else { s.top = "50%"; s.transform = "translateY(-50%)"; }
  if (h === "l") s.left = 16;
  else if (h === "r") s.right = 16;
  else {
    s.left = "50%";
    s.transform = (s.transform ? s.transform + " " : "") + "translateX(-50%)";
  }
  return s;
}

/* ---------- SVG building blocks ---------- */

function Gear({ color = "#FFC107", opacity = 0.2 }: { color?: string; opacity?: number }) {
  return (
    <svg viewBox="0 0 100 100" fill="none" style={{ opacity }}>
      <path
        fill={color}
        d="M50 5l5 10 11-3 2 11 11 3-3 11 8 8-8 8 3 11-11 3-2 11-11-3-5 10-5-10-11 3-2-11-11-3 3-11-8-8 8-8-3-11 11-3 2-11 11 3z"
      />
      <circle cx="50" cy="50" r="14" fill="#0a1024" />
      <circle cx="50" cy="50" r="6" fill={color} />
    </svg>
  );
}

function Shield() {
  return (
    <svg viewBox="0 0 100 110" fill="none">
      <defs>
        <linearGradient id="shieldG" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#0B5ED7" />
          <stop offset="1" stopColor="#072c66" />
        </linearGradient>
      </defs>
      <path d="M50 5l40 12v32c0 28-19 48-40 56-21-8-40-28-40-56V17z" fill="url(#shieldG)" stroke="#FFC107" strokeWidth="2.5" opacity="0.85" />
      <text x="50" y="58" textAnchor="middle" fontFamily="Arial Black, sans-serif" fontSize="28" fontWeight="900" fill="#FFC107">K3</text>
      <path d="M30 70l14 12 26-28" stroke="#FFC107" strokeWidth="3" fill="none" opacity="0.5" />
    </svg>
  );
}

function HardHat() {
  return (
    <svg viewBox="0 0 110 80" fill="none">
      <path d="M10 60 Q10 25 55 22 Q100 25 100 60 Z" fill="#FFC107" stroke="#b88a00" strokeWidth="2" />
      <rect x="5" y="58" width="100" height="8" rx="2" fill="#FF7A00" />
      <path d="M50 22 Q55 8 60 22" stroke="#b88a00" strokeWidth="2" fill="none" />
      <circle cx="35" cy="40" r="3" fill="#0B5ED7" />
      <text x="55" y="46" textAnchor="middle" fontSize="10" fontWeight="900" fill="#0B5ED7">SAFETY</text>
    </svg>
  );
}

function Trophy() {
  return (
    <svg viewBox="0 0 100 120" fill="none">
      <defs>
        <linearGradient id="trG" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#FFE082" />
          <stop offset="0.5" stopColor="#FFC107" />
          <stop offset="1" stopColor="#FF7A00" />
        </linearGradient>
      </defs>
      <path d="M30 10h40v25c0 18-9 30-20 30S30 53 30 35z" fill="url(#trG)" stroke="#8b5a00" strokeWidth="1.5" />
      <path d="M30 18c-12 0-18 6-18 14 0 8 6 14 18 14" stroke="#FFC107" strokeWidth="4" fill="none" />
      <path d="M70 18c12 0 18 6 18 14 0 8-6 14-18 14" stroke="#FFC107" strokeWidth="4" fill="none" />
      <rect x="42" y="65" width="16" height="14" fill="url(#trG)" />
      <rect x="32" y="78" width="36" height="8" rx="2" fill="url(#trG)" />
      <rect x="25" y="86" width="50" height="10" rx="2" fill="#8b5a00" />
      <text x="50" y="46" textAnchor="middle" fontSize="14" fontWeight="900" fill="#8b5a00">★</text>
    </svg>
  );
}

function Apar() {
  return (
    <svg viewBox="0 0 60 100" fill="none">
      <rect x="22" y="8" width="16" height="10" rx="2" fill="#222" />
      <rect x="12" y="18" width="36" height="60" rx="6" fill="#d32f2f" stroke="#7a1818" strokeWidth="1.5" />
      <rect x="18" y="30" width="24" height="14" fill="#fff" opacity="0.85" />
      <text x="30" y="41" textAnchor="middle" fontSize="9" fontWeight="900" fill="#d32f2f">APAR</text>
      <rect x="24" y="78" width="12" height="14" fill="#222" />
    </svg>
  );
}

function Cone() {
  return (
    <svg viewBox="0 0 60 80" fill="none">
      <path d="M30 8l20 60H10z" fill="#FF7A00" stroke="#8b3f00" strokeWidth="1.5" />
      <rect x="14" y="32" width="32" height="6" fill="#fff" opacity="0.9" />
      <rect x="11" y="46" width="38" height="6" fill="#fff" opacity="0.9" />
      <rect x="6" y="66" width="48" height="8" rx="2" fill="#222" />
    </svg>
  );
}

function Spark() {
  return (
    <svg viewBox="0 0 20 20" fill="none">
      <path d="M10 0l2 8 8 2-8 2-2 8-2-8-8-2 8-2z" fill="#FFC107" />
    </svg>
  );
}

function HazardStripe() {
  return (
    <svg viewBox="0 0 200 14" preserveAspectRatio="none" width="100%" height="100%">
      <defs>
        <pattern id="hz" width="16" height="14" patternUnits="userSpaceOnUse" patternTransform="skewX(-30)">
          <rect width="8" height="14" fill="#FFC107" />
          <rect x="8" width="8" height="14" fill="#111" />
        </pattern>
      </defs>
      <rect width="200" height="14" fill="url(#hz)" rx="3" />
    </svg>
  );
}
