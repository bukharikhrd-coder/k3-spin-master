import bgIndustrial from "@/assets/bg-industrial.jpg";
import type { AppSettings } from "@/lib/settings-defaults";

const PRESET_URLS: Record<string, string> = {
  industrial: bgIndustrial,
};

export function HomeBackground({ settings }: { settings: AppSettings }) {
  const b = settings.background;
  const url = b.customUrl || PRESET_URLS[b.preset] || bgIndustrial;

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center transition-all duration-700"
        style={{
          backgroundImage: `url(${url})`,
          filter: `brightness(${b.brightness}%) blur(${b.blur}px)`,
          transform: `scale(${b.zoom / 100}) translate(${b.positionX}%, ${b.positionY}%)`,
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at top, rgba(11,94,215,0.35), transparent 65%), linear-gradient(180deg, rgba(0,0,0,0.2), rgba(0,0,0,0.8))",
          opacity: b.overlayOpacity / 100,
        }}
      />
      {settings.decorations.hazardStripes && (
        <>
          <div className="hazard-stripes absolute inset-x-0 top-0 h-2 opacity-70" />
          <div className="hazard-stripes absolute inset-x-0 bottom-0 h-2 opacity-70" />
        </>
      )}
      {settings.decorations.stageLights && (
        <>
          <div className="pointer-events-none absolute -left-32 top-1/3 h-[80vh] w-[80vh] rounded-full" style={{ background: "radial-gradient(circle, rgba(11,94,215,0.18), transparent 60%)" }} />
          <div className="pointer-events-none absolute -right-32 top-1/4 h-[80vh] w-[80vh] rounded-full" style={{ background: "radial-gradient(circle, rgba(255,193,7,0.15), transparent 60%)" }} />
        </>
      )}
    </div>
  );
}
