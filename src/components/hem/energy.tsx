import type { ReactNode } from "react";

/**
 * Ruler — signature horizontal measurement strip with tick marks and a needle.
 * Replaces circular gauges: this IS the product's signature component.
 */
export function Ruler({
  value,
  label,
  height = 84,
  showValue = true,
  accent = "#2563EB",
}: {
  value: number;
  label?: string;
  height?: number;
  showValue?: boolean;
  accent?: string;
}) {
  const clamped = Math.max(0, Math.min(100, value));
  const ticks = [0, 25, 50, 75, 100];

  return (
    <div className="w-full" style={{ fontFamily: "'Manrope', system-ui, sans-serif" }}>
      {(label || showValue) && (
        <div className="flex items-end justify-between mb-3">
          {label && (
            <div className="text-[11px] uppercase tracking-[0.16em]" style={{ color: "var(--ink-2)" }}>
              {label}
            </div>
          )}
          {showValue && (
            <div className="mono tabular-nums leading-none font-semibold" style={{ fontSize: 40, color: "var(--ink)" }}>
              {clamped}
              <span className="ml-1 text-[16px] font-normal" style={{ color: "var(--ink-2)" }}>%</span>
            </div>
          )}
        </div>
      )}

      <div className="relative" style={{ height }}>
        {/* Track */}
        <div
          className="absolute left-0 right-0"
          style={{
            top: height / 2 - 4,
            height: 8,
            background: "var(--paper-2)",
            boxShadow: "inset 0 0 0 1px var(--line)",
          }}
        />
        {/* Filled portion up to needle */}
        <div
          className="absolute left-0"
          style={{
            top: height / 2 - 4,
            height: 8,
            width: `${clamped}%`,
            background: "var(--ink)",
          }}
        />
        {/* Tick marks + labels */}
        {ticks.map((t) => (
          <div
            key={t}
            className="absolute flex flex-col items-center"
            style={{ left: `${t}%`, top: 0, transform: "translateX(-50%)", height }}
          >
            <div style={{ width: 1, height: height / 2 - 6, background: "var(--line-2)" }} />
            <div style={{ width: 1, height: 6, background: "var(--ink-2)" }} />
            <div style={{ width: 1, height: height / 2 - 12, background: "var(--line-2)" }} />
            <div
              className="mono absolute text-[11px] uppercase tracking-[0.1em]"
              style={{ bottom: -18, color: "var(--ink-2)" }}
            >
              {t}
            </div>
          </div>
        ))}
        {/* Needle marker */}
        <div
          className="absolute needle-anim"
          style={
            {
              left: 0,
              top: 0,
              height,
              width: 0,
              "--needle-x": `calc(${clamped}% - 0px)`,
            } as React.CSSProperties
          }
        >
          <div
            className="absolute"
            style={{
              left: -8,
              top: height / 2 - 18,
              width: 16,
              height: 36,
              background: accent,
              clipPath: "polygon(50% 0, 100% 25%, 100% 75%, 50% 100%, 0 75%, 0 25%)",
              boxShadow: "0 1px 0 rgba(14,27,51,0.15)",
            }}
          />
          <div
            className="mono absolute text-[11px] uppercase tracking-[0.12em] font-medium"
            style={{ top: -14, transform: "translateX(-50%)", color: accent, whiteSpace: "nowrap" }}
          >
            {clamped}%
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Stamp — inspection-stamp status pill (mono uppercase, cut corner).
 */
export function Stamp({
  status,
  children,
  large = false,
  rotate = false,
}: {
  status: "ok" | "warn" | "fail" | "ink" | "neutral" | "accent";
  children: ReactNode;
  large?: boolean;
  rotate?: boolean;
}) {
  const cls = `stamp stamp-${status} ${large ? "stamp-lg" : ""} ${rotate ? "stamp-rotate" : ""}`.trim();
  return <span className={cls}>{children}</span>;
}

/**
 * Backward-compatible circular gauge (kept for legacy screens if needed).
 */
export function EnergyGauge({ value, size = 180, label }: { value: number; size?: number; label?: string }) {
  return (
    <div style={{ width: size }}>
      <Ruler value={value} label={label} height={72} />
    </div>
  );
}

/**
 * Backward-compatible sparkline — simple, single-line ink.
 */
export function Sparkline({
  data,
  width = 120,
  height = 32,
  color = "#0E1B33",
}: {
  data: number[];
  width?: number;
  height?: number;
  color?: string;
}) {
  if (data.length < 2) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const step = width / (data.length - 1);
  const pts = data.map((v, i) => `${i * step},${height - ((v - min) / range) * (height - 4) - 2}`).join(" ");
  return (
    <svg width={width} height={height} aria-hidden className="overflow-visible">
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.2" strokeLinecap="square" strokeLinejoin="miter" />
      {/* Final dot */}
      <circle
        cx={(data.length - 1) * step}
        cy={height - ((data[data.length - 1] - min) / range) * (height - 4) - 2}
        r="2.5"
        fill="#2563EB"
      />
    </svg>
  );
}

/**
 * Schematic connector — right-angled with junction dots + arrow + mono edge label.
 * Renders as an inline block sized to fit between chain nodes.
 */
export function SchematicConnector({ label, width = 96 }: { label?: string; width?: number }) {
  const h = 40;
  return (
    <div className="flex items-center px-1" aria-hidden>
      <svg width={width} height={h} viewBox={`0 0 ${width} ${h}`} className="overflow-visible">
        <polyline
          className="schematic-line"
          points={`0,${h / 2} ${width * 0.3},${h / 2} ${width * 0.35},${h / 2 - 6} ${width * 0.65},${h / 2 - 6} ${width * 0.7},${h / 2} ${width - 6},${h / 2}`}
        />
        <circle className="schematic-dot" cx={width * 0.3} cy={h / 2} r="2" />
        <circle className="schematic-dot" cx={width * 0.7} cy={h / 2} r="2" />
        <path d={`M ${width - 8} ${h / 2 - 4} L ${width} ${h / 2} L ${width - 8} ${h / 2 + 4}`} className="schematic-line" />
        {/* Traveling cyan light dot */}
        <circle r="2.5" fill="#22D3EE" style={{ filter: "drop-shadow(0 0 4px #22D3EE)" }}>
          <animateMotion
            dur="4s"
            repeatCount="indefinite"
            path={`M 0 ${h / 2} L ${width * 0.3} ${h / 2} L ${width * 0.35} ${h / 2 - 6} L ${width * 0.65} ${h / 2 - 6} L ${width * 0.7} ${h / 2} L ${width - 6} ${h / 2}`}
          />
        </circle>
        {label && (
          <text x={width / 2} y={h / 2 - 12} textAnchor="middle" className="schematic-label">
            {label}
          </text>
        )}
      </svg>
    </div>
  );
}

/**
 * HeroInstrument — signature dashboard centerpiece.
 * Dark navy card with a large horizontal precision scale, cyan needle,
 * huge mono percentage, and a stacked compliance distribution bar.
 */
export function HeroInstrument({
  value,
  label,
  ruleCount,
  ok,
  warn,
  fail,
  okLabel,
  warnLabel,
  failLabel,
}: {
  value: number;
  label: string;
  ruleCount: number;
  ok: number;
  warn: number;
  fail: number;
  okLabel: string;
  warnLabel: string;
  failLabel: string;
}) {
  const clamped = Math.max(0, Math.min(100, value));
  const total = ok + warn + fail || 1;
  const okPct = (ok / total) * 100;
  const warnPct = (warn / total) * 100;
  const failPct = (fail / total) * 100;
  const ticks = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100];

  return (
    <div className="hero-instrument p-8">
      <div className="flex items-start justify-between mb-8 relative z-10">
        <div>
          <div className="mono text-[11px] uppercase tracking-[0.22em]" style={{ color: "#22D3EE" }}>
            {label}
          </div>
          <div className="mono text-[11px] uppercase tracking-[0.14em] mt-2" style={{ color: "rgba(255,255,255,0.55)" }}>
            N = {ruleCount}
          </div>
        </div>
        <div className="mono tabular-nums font-semibold leading-none text-right" style={{ fontSize: 72, letterSpacing: "-0.03em", color: "#fff" }}>
          {Math.round(clamped)}
          <span className="ml-1 text-[24px] font-normal" style={{ color: "rgba(255,255,255,0.55)" }}>%</span>
        </div>
      </div>

      {/* Precision scale */}
      <div className="relative z-10" style={{ height: 72 }}>
        {/* Track */}
        <div className="absolute left-0 right-0" style={{ top: 30, height: 4, background: "rgba(255,255,255,0.08)", borderRadius: 2 }} />
        {/* Fill */}
        <div
          className="absolute left-0"
          style={{
            top: 30, height: 4,
            width: `${clamped}%`,
            background: "linear-gradient(90deg, #2563EB 0%, #22D3EE 100%)",
            borderRadius: 2,
            boxShadow: "0 0 12px rgba(34,211,238,0.5)",
          }}
        />
        {/* Ticks */}
        {ticks.map((tk) => (
          <div
            key={tk}
            className="absolute"
            style={{ left: `${tk}%`, top: 22, transform: "translateX(-50%)" }}
          >
            <div style={{ width: 1, height: tk % 50 === 0 ? 20 : 12, background: tk % 50 === 0 ? "rgba(255,255,255,0.5)" : "rgba(255,255,255,0.18)" }} />
            {tk % 50 === 0 && (
              <div className="mono absolute text-[11px] uppercase tracking-[0.1em]" style={{ top: 24, transform: "translateX(-50%)", color: "rgba(255,255,255,0.5)" }}>
                {tk}
              </div>
            )}
          </div>
        ))}
        {/* Needle */}
        <div
          className="absolute needle-anim"
          style={{ left: 0, top: 0, height: 60, "--needle-x": `${clamped}%` } as React.CSSProperties}
        >
          <div
            style={{
              position: "absolute",
              left: -1,
              top: 12,
              width: 2,
              height: 40,
              background: "#22D3EE",
              boxShadow: "0 0 12px #22D3EE, 0 0 4px #fff",
            }}
          />
          <div
            style={{
              position: "absolute",
              left: -5,
              top: 6,
              width: 10,
              height: 10,
              background: "#22D3EE",
              borderRadius: "50%",
              boxShadow: "0 0 14px #22D3EE",
            }}
          />
        </div>
      </div>

      {/* Distribution stacked bar */}
      <div className="mt-8 relative z-10">
        <div className="flex items-center justify-between mb-2">
          <div className="mono text-[11px] uppercase tracking-[0.16em]" style={{ color: "rgba(255,255,255,0.55)" }}>
            Megoszlás
          </div>
          <div className="mono text-[11px]" style={{ color: "rgba(255,255,255,0.55)" }}>
            {total}
          </div>
        </div>
        <div className="flex h-2.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
          <div style={{ width: `${okPct}%`, background: "#1E9E5A" }} />
          <div style={{ width: `${warnPct}%`, background: "#E8A013" }} />
          <div style={{ width: `${failPct}%`, background: "#D64545" }} />
        </div>
        <div className="mt-3 grid grid-cols-3 gap-4 text-[12px]" style={{ color: "rgba(255,255,255,0.75)" }}>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full" style={{ background: "#1E9E5A" }} />
            <span className="mono uppercase tracking-[0.08em]">{okLabel}</span>
            <span className="mono ml-auto tabular-nums font-semibold" style={{ color: "#fff" }}>{ok}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full" style={{ background: "#E8A013" }} />
            <span className="mono uppercase tracking-[0.08em]">{warnLabel}</span>
            <span className="mono ml-auto tabular-nums font-semibold" style={{ color: "#fff" }}>{warn}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full" style={{ background: "#D64545" }} />
            <span className="mono uppercase tracking-[0.08em]">{failLabel}</span>
            <span className="mono ml-auto tabular-nums font-semibold" style={{ color: "#fff" }}>{fail}</span>
          </div>
        </div>
      </div>
    </div>
  );
}


// Legacy alias so existing imports keep working.
export const FlowConnector = () => <SchematicConnector label="LÁNC" width={80} />;

/**
 * Empty state.
 */
export function EmptyState({
  icon,
  title,
  description,
}: {
  icon?: ReactNode;
  title: string;
  description?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-10 text-center">
      {icon && <div className="mb-3" style={{ color: "var(--line-2)" }}>{icon}</div>}
      <div className="text-sm font-medium">{title}</div>
      {description && (
        <div className="text-xs mt-1 max-w-xs" style={{ color: "var(--ink-2)" }}>{description}</div>
      )}
    </div>
  );
}

/**
 * RatingBadge — big score stamp used on reports.
 */
export function RatingBadge({ score }: { score: number }) {
  const tier =
    score >= 90 ? { letter: "A", label: "Kiváló", status: "ok" as const }
    : score >= 75 ? { letter: "B", label: "Jó", status: "ok" as const }
    : score >= 60 ? { letter: "C", label: "Megfelelő", status: "warn" as const }
    : score >= 40 ? { letter: "D", label: "Gyenge", status: "warn" as const }
    : { letter: "E", label: "Elégtelen", status: "fail" as const };

  return (
    <div className="inline-flex items-center gap-4">
      <div className={`stamp stamp-lg stamp-${tier.status}`} style={{ minWidth: 72, justifyContent: "center" }}>
        {tier.letter}
      </div>
      <div>
        <div className="mono tabular-nums font-semibold leading-none" style={{ fontSize: 36, color: "var(--ink)" }}>
          {score}<span className="text-[16px] font-normal" style={{ color: "var(--ink-2)" }}>%</span>
        </div>
        <div className="mono text-[11px] uppercase tracking-[0.16em] mt-1" style={{ color: "var(--ink-2)" }}>
          {tier.label}
        </div>
      </div>
    </div>
  );
}

/**
 * Deprecated banner — kept as no-op alias.
 */
export function GridHeroBanner({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="paper-card px-5 py-4 mb-6">
      <div className="mono text-[11px] uppercase tracking-[0.2em]" style={{ color: "var(--accent)" }}>Panel</div>
      <div className="text-[16px] font-semibold mt-1">{title}</div>
      {subtitle && <div className="text-xs mt-1" style={{ color: "var(--ink-2)" }}>{subtitle}</div>}
    </div>
  );
}

/**
 * Deprecated wave — no-op.
 */
export function EnergyWave() {
  return null;
}

/**
 * Deprecated topo — no-op.
 */
export function TopoBackground() {
  return null;
}
