import { motion, AnimatePresence } from "framer-motion";
import type { Participant } from "@/lib/participants-store";
import type { WinnerDisplayMode } from "@/lib/settings-defaults";
import defaultAvatar from "@/assets/default-avatar.png";

interface Props {
  winners: Participant[];
  mode: WinnerDisplayMode;
  open: boolean;
  onClose: () => void;
  titleText: string;
  congratsText: string;
  closeText: string;
}

function cardCols(n: number) {
  if (n <= 1) return "grid-cols-1";
  if (n <= 5) return "grid-cols-2 sm:grid-cols-3 lg:grid-cols-5";
  if (n <= 10) return "grid-cols-2 sm:grid-cols-3 lg:grid-cols-5";
  if (n <= 15) return "grid-cols-2 sm:grid-cols-3 lg:grid-cols-5";
  return "grid-cols-2 sm:grid-cols-4 lg:grid-cols-5";
}

export function WinnerReveal({ winners, mode, open, onClose, titleText, congratsText, closeText }: Props) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "radial-gradient(circle at center, rgba(11,94,215,0.35), rgba(0,0,0,0.85))" }}
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.85, y: 30 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", stiffness: 180, damping: 22 }}
            className="glass-strong relative w-full max-w-7xl rounded-3xl p-8 md:p-12"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-2 text-center text-sm font-semibold tracking-[0.4em] text-[var(--safety-yellow)] whitespace-pre-line">
              {congratsText.toUpperCase()}
            </div>
            <h2 className="mb-8 text-center font-display text-4xl md:text-6xl font-extrabold grad-text-gold text-glow-yellow whitespace-pre-line">
              {titleText}
            </h2>

            <div className={`grid gap-4 md:gap-6 ${cardCols(winners.length)}`}>
              {winners.map((w, i) => (
                <motion.div
                  key={w.id}
                  initial={{ opacity: 0, y: 30, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ delay: 0.08 * i, type: "spring", stiffness: 220, damping: 20 }}
                  className="glass relative overflow-hidden rounded-2xl p-4 md:p-5"
                  style={{ boxShadow: "0 0 30px rgba(255,193,7,0.35), inset 0 1px 0 rgba(255,255,255,0.1)" }}
                >
                  <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[var(--safety-yellow)] via-[var(--safety-orange)] to-[var(--safety-yellow)]" />
                  {(mode === "number_name_photo") && (
                    <div className="mb-3 flex justify-center">
                      <img
                        src={w.photo_url || defaultAvatar}
                        alt=""
                        className="h-20 w-20 rounded-full border-2 border-[var(--safety-yellow)] object-cover"
                        loading="lazy"
                      />
                    </div>
                  )}
                  <div className="text-center font-mono text-xs uppercase tracking-widest text-[var(--safety-yellow)]/80">
                    No.
                  </div>
                  <div className="text-center font-display text-3xl md:text-4xl font-extrabold grad-text-gold leading-none">
                    {w.number}
                  </div>
                  {(mode === "name" || mode === "number_name" || mode === "number_name_department" || mode === "number_name_photo") && w.name && (
                    <div className="mt-2 truncate text-center text-base md:text-lg font-semibold text-foreground">
                      {w.name}
                    </div>
                  )}
                  {(mode === "number_department" || mode === "number_name_department") && w.department && (
                    <div className="mt-1 truncate text-center text-xs md:text-sm text-muted-foreground">
                      {w.department}
                    </div>
                  )}
                </motion.div>
              ))}
            </div>

            <div className="mt-8 flex justify-center">
              <button
                onClick={onClose}
                className="rounded-full bg-gradient-to-r from-[var(--safety-yellow)] to-[var(--safety-orange)] px-8 py-3 font-display text-sm font-bold uppercase tracking-widest text-black shadow-lg transition hover:brightness-110"
              >
                {closeText}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
