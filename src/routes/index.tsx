import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/hem/AppShell";
import { projects, documents, claims, rules, statusColor, severityColor } from "@/lib/hem-data";
import { useGaps, useAuditLog } from "@/lib/hem-store";
import { AlertTriangle, Zap, Gauge, ScanText } from "lucide-react";
import { KpiCard } from "@/components/hem/KpiCard";
import { HeroInstrument } from "@/components/hem/energy";
import { useI18n } from "@/lib/i18n";


export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Irányítópult – HEM PANIM" },
      { name: "description", content: "Energetikai megfelelési előminősítő rendszer irányítópultja." },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const { t } = useI18n();
  const allGaps = useGaps();
  const openGaps = allGaps.filter((g) => g.status !== "Pótolva");
  const auditLog = useAuditLog();
  const totalDocs = documents.length;
  const compliant = claims.filter((c) => c.status === "Megfelelt").length;
  const uncertain = claims.filter((c) => c.status === "Bizonytalan").length;
  const failed = claims.filter((c) => c.status === "Nem megfelelt").length;
  const total = compliant + uncertain + failed;
  const rate = Math.round((compliant / total) * 100);
  const trend = [58, 61, 63, 62, 66, 68, 65, 69, 71, 70, 73, rate];

  return (
    <AppShell title={t("dashboard.title")} subtitle={t("dashboard.subtitle")}>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mb-6">
        <div className="lg:col-span-8 fade-slide">
          <HeroInstrument
            value={rate}
            label={t("dashboard.complianceIndex")}
            ruleCount={rules.length}
            ok={compliant}
            warn={uncertain}
            fail={failed}
            okLabel={t("status.Megfelelt")}
            warnLabel={t("status.Bizonytalan")}
            failLabel={t("status.Nem megfelelt")}
          />
        </div>

        <div className="lg:col-span-4 grid grid-cols-1 gap-4">
          <KpiCard label={t("dashboard.activeProjects")} value={projects.length} icon={Zap} caption={t("dashboard.activeProjectsCap")} />
          <KpiCard label={t("dashboard.documents")} value={totalDocs} icon={ScanText} caption={t("dashboard.documentsCap")} />
        </div>
      </div>


      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mb-6">
        <div className="lg:col-span-4">
          <KpiCard label={t("dashboard.rate")} value={rate} suffix="%" icon={Gauge} sparkline={trend} sparklineColor="#0E1B33" />
        </div>
        <div className="lg:col-span-4">
          <KpiCard label={t("dashboard.openGaps")} value={openGaps.length} icon={AlertTriangle} caption={t("dashboard.openGapsCap")} />
        </div>

        <div className="lg:col-span-4 paper-card p-5 fade-slide">
          <div className="flex items-center justify-between mb-3">
            <div className="mono text-[11px] uppercase tracking-[0.18em]" style={{ color: "var(--ink-2)" }}>
              {t("dashboard.risks")}
            </div>
            <AlertTriangle className="w-4 h-4" style={{ color: "var(--accent)" }} />
          </div>
          <ul className="space-y-2.5">
            {openGaps.slice(0, 5).map((g, i) => (
              <li key={i} className="text-[13px] flex items-start gap-2">
                <span className={severityColor(g.severity)}>{t(`severity.${g.severity}`)}</span>
                <div className="flex-1 min-w-0">
                  <span className="mono text-[12px] tracking-[0.06em] font-medium">{g.projectId}</span>
                  <span style={{ color: "var(--ink-2)" }}> · {g.text.toLowerCase()}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-7 paper-card p-5 fade-slide">
          <div className="mono text-[11px] uppercase tracking-[0.18em] mb-4" style={{ color: "var(--ink-2)" }}>
            {t("dashboard.projectsOverview")}
          </div>
          <div className="space-y-2">
            {projects.map((p) => (
              <Link
                key={p.id}
                to="/projektek/$id"
                params={{ id: p.id }}
                className="flex items-center justify-between p-3 hover:bg-[color:var(--paper-2)] transition-colors group cut-xs"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="mono text-[12px] font-medium tracking-[0.08em]" style={{ color: "var(--accent)" }}>{p.id}</span>
                    <span className="font-medium text-sm truncate">{p.name}</span>
                  </div>
                  <div className="mono text-[11px] uppercase tracking-[0.12em] mt-1" style={{ color: "var(--ink-2)" }}>
                    {p.site} · {p.measure}
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <div className="mono tabular-nums text-[14px] font-semibold" style={{ color: "var(--ink)" }}>{p.score}%</div>
                  <span className={statusColor(p.status)}>{t(`status.${p.status}`)}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="lg:col-span-5 paper-card p-5 fade-slide">
          <div className="mono text-[11px] uppercase tracking-[0.18em] mb-4" style={{ color: "var(--ink-2)" }}>
            {t("dashboard.recent")}
          </div>
          <ul className="space-y-3">
            {auditLog.slice(0, 6).map((a, i) => (
              <li key={i} className="text-[13px] flex gap-3">
                <div className="mono text-[11px] uppercase tracking-[0.06em] w-28 shrink-0" style={{ color: "var(--ink-2)" }}>
                  {a.time}
                </div>
                <div className="min-w-0">
                  <span className="font-medium">{a.action}</span>
                  <span className="mono text-[12px]" style={{ color: "var(--ink-2)" }}> · {a.object}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </AppShell>
  );
}
