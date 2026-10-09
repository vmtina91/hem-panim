import type { LucideIcon } from "lucide-react";
import { useCountUp } from "@/hooks/use-count-up";
import { Sparkline } from "@/components/hem/energy";

interface KpiCardProps {
  label: string;
  value: number;
  suffix?: string;
  icon: LucideIcon;
  iconClass?: string;
  sparkline?: number[];
  sparklineColor?: string;
  caption?: string;
}

export function KpiCard({
  label,
  value,
  suffix = "",
  icon: Icon,
  sparkline,
  sparklineColor = "#0E1B33",
  caption,
}: KpiCardProps) {
  const animated = useCountUp(value);
  const shown = value >= 1000 ? Math.round(animated).toLocaleString("hu-HU") : Math.round(animated);

  return (
    <div className="paper-card paper-card-hover p-6 fade-slide relative">
      <div className="flex items-start justify-between gap-3">
        <div className="mono text-[12px] uppercase tracking-[0.08em] font-semibold" style={{ color: "var(--ink-2)" }}>
          {label}
        </div>
        <Icon className="w-4 h-4" style={{ color: "var(--ink-2)" }} />
      </div>
      <div
        className="mono tabular-nums font-semibold leading-none mt-4"
        style={{ fontSize: 28, color: "var(--ink)" }}
      >
        {shown}
        {suffix && (
          <span className="ml-1 text-[13px] font-medium" style={{ color: "var(--ink-2)" }}>
            {suffix}
          </span>
        )}
      </div>
      {caption && (
        <div className="text-[12px] mt-2" style={{ color: "var(--ink-2)", lineHeight: 1.5 }}>
          {caption}
        </div>
      )}
      {sparkline && (
        <div className="mt-3">
          <Sparkline data={sparkline} width={160} height={28} color={sparklineColor} />
        </div>
      )}
    </div>
  );
}

