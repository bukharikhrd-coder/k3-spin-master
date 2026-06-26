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
