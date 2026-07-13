import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/hem/AppShell";
import { reports, projects, claims, documents, rules, ruleOutcomes, statusColor, severityColor, outcomeColor, type Report } from "@/lib/hem-data";
import { useGaps, CATALOG_VERSION, CATALOG_LABEL } from "@/lib/hem-store";
import { ruleVersion } from "@/lib/hem-measurements";
import { useAuth } from "@/lib/auth";
import { useI18n } from "@/lib/i18n";
import { RatingBadge } from "@/components/hem/energy";
import { FileDown, Eye, X, Lock } from "lucide-react";

export const Route = createFileRoute("/riportok")({
  head: () => ({ meta: [{ title: "Riportok – HEM PANIM" }] }),
  component: ReportsPage,
});

function ReportsPage() {
  const { permissions, user } = useAuth();
  const { t } = useI18n();
  const [preview, setPreview] = useState<Report | null>(null);

  return (
    <AppShell title={t("reports.title")}>
      {!permissions.canGenerateReport && (
        <div className="paper-card p-3 mb-4 flex items-center gap-3 text-sm" style={{ color: "var(--ink-2)" }}>
          <Lock className="w-4 h-4" />
          {t("reports.readonly", { role: user ? t(`topbar.role.${user.role}`) : "-" })}
        </div>
      )}
      <div className="paper-card overflow-hidden">
        <table className="w-full text-sm">
          <thead style={{ background: "var(--paper-2)" }}>
            <tr className="mono text-[10px] uppercase tracking-[0.14em]" style={{ color: "var(--ink-2)" }}>
              <th className="text-left px-4 py-3">{t("reports.col.id")}</th>
              <th className="text-left px-4 py-3">{t("reports.col.title")}</th>
              <th className="text-left px-4 py-3">{t("reports.col.project")}</th>
              <th className="text-left px-4 py-3">{t("reports.col.created")}</th>
              <th className="text-right px-4 py-3">{t("reports.col.actions")}</th>
            </tr>
          </thead>
          <tbody>
            {reports.map((r) => (
              <tr key={r.id} className="border-t" style={{ borderColor: "var(--line)" }}>
                <td className="px-4 py-3 mono text-[12px] font-medium" style={{ color: "var(--accent)" }}>{r.id}</td>
                <td className="px-4 py-3">{r.title}</td>
                <td className="px-4 py-3 mono text-[12px]" style={{ color: "var(--ink-2)" }}>{r.projectId}</td>
                <td className="px-4 py-3 mono text-[12px]" style={{ color: "var(--ink-2)" }}>{r.createdAt}</td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => setPreview(r)} className="btn-outline-ink mr-2">
                    <Eye className="w-3 h-3" /> {t("btn.preview")}
                  </button>
                  {permissions.canGenerateReport && (
                    <button onClick={() => { setPreview(r); setTimeout(() => window.print(), 300); }} className="btn-signal">
                      <FileDown className="w-3 h-3" /> {t("reports.downloadPdf")}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {preview && <PreviewModal report={preview} onClose={() => setPreview(null)} />}
    </AppShell>
  );
}

function PreviewModal({ report, onClose }: { report: Report; onClose: () => void }) {
  const { t } = useI18n();
  const allGaps = useGaps();
  const project = projects.find((p) => p.id === report.projectId)!;
  const projClaims = claims.filter((c) => c.projectId === project.id);
  const projGaps = allGaps.filter((g) => g.projectId === project.id && g.status !== "Pótolva");
  const projOutcomes = ruleOutcomes.filter((o) => o.projectId === project.id);
  // Appendix B: union of rule ids used
  const usedRuleIds = Array.from(new Set([...projClaims.map((c) => c.ruleId), ...projOutcomes.map((o) => o.ruleId)]));

  return (
    <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 print:bg-transparent print:static print:p-0" onClick={onClose}>
      <div className="bg-[color:var(--paper-2)] max-w-3xl w-full max-h-[90vh] overflow-auto rounded-lg print:bg-white print:max-h-none print:overflow-visible" onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 bg-white border-b border-[color:var(--line)] p-4 flex justify-between items-center print:hidden">
          <div className="font-semibold">{t("reports.previewTitle", { id: report.id })}</div>
          <button onClick={onClose} aria-label={t("btn.close")}><X className="w-5 h-5" /></button>
        </div>
        <div className="p-6 md:p-10 print:p-0">
          <div className="bg-white shadow-sm border border-[color:var(--line)] print:shadow-none print:border-0 rounded-md p-8 md:p-10">
            <div className="flex items-start justify-between gap-6 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 cut-xs text-white grid place-items-center mono font-semibold" style={{ background: "var(--ink)" }}>HP</div>
                <div>
                  <div className="mono text-[11px] uppercase tracking-[0.16em] font-semibold">HEM · PANIM</div>
                  <div className="mono text-[9px] uppercase tracking-[0.14em]" style={{ color: "var(--ink-2)" }}>PANIM Innováció Menedzsment Kft.</div>
                </div>
              </div>
              <div className="text-right mono text-[10px] uppercase tracking-[0.14em]" style={{ color: "var(--ink-2)" }}>
                <div>{t("reports.reportId")} <span style={{ color: "var(--ink)" }}>{report.id}</span></div>
                <div>{t("reports.createdAt")} <span style={{ color: "var(--ink)" }}>{report.createdAt}</span></div>
                <div>{t("reports.catalogUsed", { cat: CATALOG_LABEL })}</div>
              </div>
            </div>
            <div className="h-[2px] mb-6 w-16" style={{ background: "var(--accent)" }} />

            <div className="mb-6">
              <div className="mono text-[10px] uppercase tracking-[0.22em]" style={{ color: "var(--accent)" }}>{t("reports.section")}</div>
              <h1 className="text-2xl font-semibold mt-1">{report.title}</h1>
              <div className="mono text-[11px] uppercase tracking-[0.14em] mt-2" style={{ color: "var(--ink-2)" }}>
                {project.id} · {project.site} · {project.measure}
              </div>
            </div>

            <div className="flex items-center justify-between gap-4 mb-6 p-5 cut-sm" style={{ background: "var(--paper-2)", boxShadow: "inset 0 0 0 1px var(--line)" }}>
              <div>
                <div className="mono text-[10px] uppercase tracking-[0.16em] mb-2" style={{ color: "var(--ink-2)" }}>{t("reports.overall")}</div>
                <div className={`stamp stamp-lg stamp-rotate ${project.status === "Megfelelt" ? "stamp-ok" : project.status === "Bizonytalan" ? "stamp-warn" : "stamp-fail"}`}>
                  {t(`status.${project.status}`)}
                </div>
                <div className="mono text-[10px] uppercase tracking-[0.14em] mt-4" style={{ color: "var(--ink-2)" }}>
                  {t("reports.claimsEvaluated")} <span style={{ color: "var(--ink)" }}>{projClaims.length}</span>
                </div>
              </div>
              <RatingBadge score={project.score} />
            </div>

            <h2 className="font-semibold mb-2">{t("reports.claims")}</h2>
            <table className="w-full text-sm mb-6 border border-[color:var(--line)]">
              <thead className="bg-[color:var(--paper-2)] text-xs">
                <tr>
                  <th className="text-left px-3 py-2">{t("prequal.chain.claim")}</th>
                  <th className="text-left px-3 py-2">{t("prequal.chain.rule")}</th>
                  <th className="text-left px-3 py-2">{t("documents.col.status")}</th>
                </tr>
              </thead>
              <tbody>
                {projClaims.map((c) => (
                  <tr key={c.id} className="border-t border-[color:var(--line)]">
                    <td className="px-3 py-2">{c.text}</td>
                    <td className="px-3 py-2 mono text-[11px] text-[color:var(--ink-2)]">{c.ruleId} <span style={{ color: "var(--accent)" }}>{ruleVersion(c.ruleId)}</span></td>
                    <td className="px-3 py-2">
                      <span className={`text-xs px-2 py-1 rounded border ${statusColor(c.status)}`}>{t(`status.${c.status}`)}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <h2 className="font-semibold mb-2">{t("reports.gaps")}</h2>
            {projGaps.length === 0 ? (
              <div className="text-sm text-[color:var(--ink-2)] mb-6">{t("reports.noGaps")}</div>
            ) : (
              <ul className="text-sm mb-6 space-y-1">
                {projGaps.map((g) => (
                  <li key={g.key}>
                    <span className={`text-xs px-2 py-0.5 rounded border ${severityColor(g.severity)} mr-2`}>{t(`severity.${g.severity}`)}</span>
                    <span className="mono text-[11px]">{g.ruleId} {ruleVersion(g.ruleId)}</span> – {g.text}
                    <span className="ml-2 stamp stamp-neutral">{t(`gap.status.${g.status}`)}</span>
                  </li>
                ))}
              </ul>
            )}

            {/* Appendix A */}
            <h2 className="font-semibold mb-2 mt-8 pt-4 border-t" style={{ borderColor: "var(--line)" }}>{t("reports.appendixA")}</h2>
            <table className="w-full text-xs mb-6 border" style={{ borderColor: "var(--line)" }}>
              <thead style={{ background: "var(--paper-2)" }}>
                <tr className="mono text-[10px] uppercase tracking-[0.12em]" style={{ color: "var(--ink-2)" }}>
                  <th className="text-left px-3 py-2">{t("reports.appendix.col.claim")}</th>
                  <th className="text-left px-3 py-2">{t("reports.appendix.col.evidence")}</th>
                  <th className="text-left px-3 py-2">{t("reports.appendix.col.source")}</th>
                  <th className="text-left px-3 py-2">{t("reports.appendix.col.rule")}</th>
                  <th className="text-left px-3 py-2">{t("reports.appendix.col.status")}</th>
                </tr>
              </thead>
              <tbody>
                {projClaims.map((c) => {
                  const evs = documents.filter((d) => c.evidenceDocIds.includes(d.id));
                  return (
                    <tr key={c.id} className="border-t" style={{ borderColor: "var(--line)" }}>
                      <td className="px-3 py-2 align-top">{c.text}</td>
                      <td className="px-3 py-2 align-top">
                        {evs.map((d) => (
                          <div key={d.id} className="mono text-[11px]">{d.name}</div>
                        ))}
                      </td>
                      <td className="px-3 py-2 align-top mono text-[11px]" style={{ color: "var(--ink-2)" }}>
                        {evs.map((d) => (
                          <div key={d.id}>{d.id} · {d.type}</div>
                        ))}
                      </td>
                      <td className="px-3 py-2 align-top mono text-[11px]">
                        {c.ruleId} <span style={{ color: "var(--accent)" }}>{ruleVersion(c.ruleId)}</span>
                      </td>
                      <td className="px-3 py-2 align-top">
                        <span className={`text-[11px] px-1.5 py-0.5 rounded border ${statusColor(c.status)}`}>{t(`status.${c.status}`)}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Appendix B */}
            <h2 className="font-semibold mb-2">{t("reports.appendixB")}</h2>
            <table className="w-full text-xs mb-6 border" style={{ borderColor: "var(--line)" }}>
              <thead style={{ background: "var(--paper-2)" }}>
                <tr className="mono text-[10px] uppercase tracking-[0.12em]" style={{ color: "var(--ink-2)" }}>
                  <th className="text-left px-3 py-2">{t("rules.col.id")}</th>
                  <th className="text-left px-3 py-2">{t("rules.col.version")}</th>
                  <th className="text-left px-3 py-2">{t("rules.col.name")}</th>
                  <th className="text-left px-3 py-2">{t("reports.appendix.col.result")}</th>
                </tr>
              </thead>
              <tbody>
                {usedRuleIds.map((rid) => {
                  const r = rules.find((x) => x.id === rid);
                  const outcome = projOutcomes.find((o) => o.ruleId === rid);
                  const claimForRule = projClaims.find((c) => c.ruleId === rid);
                  const derived = outcome ? outcome.status : claimForRule ? (claimForRule.status === "Megfelelt" ? "Pass" : claimForRule.status === "Bizonytalan" ? "Warning" : "Fail") : "Pass";
                  return (
                    <tr key={rid} className="border-t" style={{ borderColor: "var(--line)" }}>
                      <td className="px-3 py-2 mono text-[11px] font-medium" style={{ color: "var(--accent)" }}>{rid}</td>
                      <td className="px-3 py-2 mono text-[11px]">{ruleVersion(rid)}</td>
                      <td className="px-3 py-2">{r?.name ?? "—"}</td>
                      <td className="px-3 py-2">
                        <span className={`text-[11px] px-1.5 py-0.5 rounded border ${outcomeColor(derived as "Pass" | "Warning" | "Fail")}`}>{t(`outcome.${derived}`)}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            <div className="border-t pt-4 space-y-1" style={{ borderColor: "var(--line)" }}>
              <div className="mono text-[10px] uppercase tracking-[0.14em]" style={{ color: "var(--ink-2)" }}>
                {t("reports.catalogUsed", { cat: `v${CATALOG_VERSION}` })}
              </div>
              <div className="text-xs italic" style={{ color: "var(--ink-2)" }}>
                {t("reports.footer.reproducible")}
              </div>
              <div className="text-xs italic" style={{ color: "var(--ink-2)" }}>
                {t("reports.generatedBy")}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
