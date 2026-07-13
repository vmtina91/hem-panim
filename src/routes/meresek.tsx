import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/hem/AppShell";
import { projects, rules } from "@/lib/hem-data";
import { baselineMeasurements, postMeasurements, savingCalcs, evidenceStatusStamp, ruleVersion, type MeasurementRecord, type MeasurementUnit } from "@/lib/hem-measurements";
import { useI18n } from "@/lib/i18n";
import { FileText } from "lucide-react";

export const Route = createFileRoute("/meresek")({
  head: () => ({ meta: [{ title: "Mérési adatok – HEM PANIM" }] }),
  component: MeasurementsPage,
});

type Tab = "baseline" | "post" | "saving";

function formatNumber(n: number): string {
  return n.toLocaleString("hu-HU");
}

function MeasurementsPage() {
  const { t } = useI18n();
  const [projectId, setProjectId] = useState(projects[0].id);
  const [tab, setTab] = useState<Tab>("baseline");
  const project = projects.find((p) => p.id === projectId)!;

  const baseRows = baselineMeasurements.filter((m) => m.projectId === projectId);
  const postRows = postMeasurements.filter((m) => m.projectId === projectId);
  const saving = savingCalcs.find((s) => s.projectId === projectId);

  const tabs: { key: Tab; label: string }[] = [
    { key: "baseline", label: t("meas.tab.baseline") },
    { key: "post", label: t("meas.tab.post") },
    { key: "saving", label: t("meas.tab.saving") },
  ];

  return (
    <AppShell title={t("meas.title")} subtitle={`${project.id} · ${project.name}`}>
      <div className="flex items-center gap-3 mb-4">
        <label className="text-sm" style={{ color: "var(--ink-2)" }}>{t("meas.project")}</label>
        <select
          value={projectId}
          onChange={(e) => setProjectId(e.target.value)}
          className="border rounded-md px-3 py-2 text-sm bg-white"
          style={{ borderColor: "var(--line)" }}
        >
          {projects.map((p) => (
            <option key={p.id} value={p.id}>{p.id} – {p.name}</option>
          ))}
        </select>
      </div>

      <div className="flex flex-wrap items-center gap-2 mb-4">
        {tabs.map((tb) => {
          const active = tab === tb.key;
          return (
            <button
              key={tb.key}
              onClick={() => setTab(tb.key)}
              className={`tab-pill ${active ? "is-active" : ""}`}
            >
              {tb.label}
            </button>
          );
        })}
      </div>

      {tab === "baseline" && <MeasurementTable rows={baseRows} />}
      {tab === "post" && <MeasurementTable rows={postRows} />}
      {tab === "saving" && saving && (
        <div className="paper-card p-6">
          <div className="mono text-[10px] uppercase tracking-[0.2em] mb-2" style={{ color: "var(--accent)" }}>{t("meas.formula")}</div>
          <div className="mono text-[14px] mb-6 flex flex-wrap items-baseline gap-2 tabular-nums" style={{ color: "var(--ink)" }}>
            <span>{formatNumber(saving.baselineValue)} {saving.unit}</span>
            <span style={{ color: "var(--ink-2)" }}>−</span>
            <span>{formatNumber(saving.postValue)} {saving.unit}</span>
            <span style={{ color: "var(--ink-2)" }}>=</span>
            <span className="font-semibold" style={{ color: "var(--accent)" }}>
              {formatNumber(saving.savingValue)} {saving.unit}
            </span>
            <span className="text-[11px] mono uppercase tracking-[0.14em] ml-2" style={{ color: "var(--ink-2)" }}>{t("meas.saving")}</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="mono text-[10px] uppercase tracking-[0.16em] mb-1" style={{ color: "var(--ink-2)" }}>{t("meas.method")}</div>
              <div className="text-sm">{saving.method}</div>
              {saving.note && <div className="text-xs mt-2 italic" style={{ color: "var(--ink-2)" }}>{saving.note}</div>}
            </div>
            <div>
              <div className="mono text-[10px] uppercase tracking-[0.16em] mb-1" style={{ color: "var(--ink-2)" }}>{t("meas.rules")}</div>
              <ul className="space-y-1">
                {saving.ruleIds.map((rid) => {
                  const r = rules.find((x) => x.id === rid);
                  return (
                    <li key={rid} className="text-sm flex items-center gap-2">
                      <span className="mono text-[12px] font-medium" style={{ color: "var(--accent)" }}>{rid}</span>
                      <span className="mono text-[10px] px-1.5 py-0.5 cut-xs" style={{ background: "var(--paper-2)", boxShadow: "inset 0 0 0 1px var(--line)", color: "var(--ink-2)" }}>{ruleVersion(rid)}</span>
                      <span style={{ color: "var(--ink-2)" }}>{r?.name ?? ""}</span>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}

function MeasurementTable({ rows }: { rows: MeasurementRecord[] }) {
  const { t } = useI18n();
  if (rows.length === 0) {
    return <div className="paper-card p-6 text-sm" style={{ color: "var(--ink-2)" }}>—</div>;
  }
  return (
    <div className="paper-card overflow-hidden">
      <table className="data-table">
        <thead>
          <tr>
            <th>{t("meas.col.periodStart")}</th>
            <th>{t("meas.col.periodEnd")}</th>
            <th className="text-right">{t("meas.col.value")}</th>
            <th>{t("meas.col.unit")}</th>
            <th>{t("meas.col.source")}</th>
            <th>{t("meas.col.evidence")}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => <Row key={i} r={r} />)}
        </tbody>
      </table>
    </div>
  );
}

function Row({ r }: { r: MeasurementRecord }) {
  const { t } = useI18n();
  return (
    <tr>
      <td className="px-4 py-3 mono text-[12px] tabular-nums">{r.periodStart}</td>
      <td className="px-4 py-3 mono text-[12px] tabular-nums">{r.periodEnd}</td>
      <td className="px-4 py-3 mono text-[13px] font-semibold text-right tabular-nums" style={{ color: "var(--ink)" }}>{formatNumber(r.value)}</td>
      <td className="px-4 py-3 mono text-[12px]" style={{ color: "var(--ink-2)" }}>{r.unit as MeasurementUnit}</td>
      <td className="px-4 py-3">
        {r.sourceDocId ? (
          <Link to="/dokumentumok" className="inline-flex items-center gap-1.5 mono text-[12px]" style={{ color: "var(--accent)" }}>
            <FileText className="w-3.5 h-3.5" /> {r.sourceDocName}
          </Link>
        ) : (
          <span className="mono text-[12px] italic" style={{ color: "var(--fail)" }}>{t("meas.noSource")}</span>
        )}
      </td>
      <td className="px-4 py-3">
        <span className={evidenceStatusStamp(r.evidenceStatus)}>{r.evidenceStatus}</span>
        {r.note && <div className="text-[11px] mt-1 italic" style={{ color: "var(--ink-2)" }}>{r.note}</div>}
      </td>
    </tr>
  );
}
