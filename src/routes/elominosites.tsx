import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/hem/AppShell";
import {
  projects,
  claims,
  rules,
  documents,
  ruleOutcomes,
  statusColor,
  severityColor,
  confidenceColor,
  outcomeColor,
} from "@/lib/hem-data";
import { useAuth } from "@/lib/auth";
import { useI18n } from "@/lib/i18n";
import { Ruler, SchematicConnector } from "@/components/hem/energy";
import { ChevronDown, ChevronRight, Lock, Play, CheckCircle2, X, CheckCheck } from "lucide-react";
import { CATALOG_VERSION, useGaps, useAuditLog, assignGap, requestReplacement, closeGap } from "@/lib/hem-store";
import { ruleVersion } from "@/lib/hem-measurements";

export const Route = createFileRoute("/elominosites")({
  head: () => ({ meta: [{ title: "Előminősítés – HEM PANIM" }] }),
  component: PreQual,
});

function PreQual() {
  const { user, permissions } = useAuth();
  const { t } = useI18n();
  const [projectId, setProjectId] = useState(projects[0].id);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [runOpen, setRunOpen] = useState(false);
  const [runStep, setRunStep] = useState(0);
  const [runAt, setRunAt] = useState<string | null>(null);
  const [showClosed, setShowClosed] = useState(false);
  const [closeState, setCloseState] = useState<Record<string, string>>({});
  const [assigneeDraft, setAssigneeDraft] = useState<Record<string, string>>({});

  const allGaps = useGaps();
  useAuditLog(); // ensures re-render when audit updates
  const project = projects.find((p) => p.id === projectId)!;
  const projClaims = claims.filter((c) => c.projectId === projectId);
  const projGaps = allGaps.filter((g) => g.projectId === projectId);
  const openGaps = projGaps.filter((g) => g.status !== "Pótolva");
  const closedGaps = projGaps.filter((g) => g.status === "Pótolva");
  const projOutcomes = ruleOutcomes.filter((o) => o.projectId === projectId);
  const actor = user?.name ?? "Ismeretlen felhasználó";

  const RUN_STEPS = [
    t("prequal.steps.load"),
    t("prequal.steps.extract"),
    t("prequal.steps.evidence"),
    t("prequal.steps.eval", { n: rules.length }),
  ];

  const score = project.score;

  const startRun = () => {
    setRunOpen(true);
    setRunStep(0);
    let s = 0;
    const tick = () => {
      s += 1;
      setRunStep(s);
      if (s < RUN_STEPS.length) setTimeout(tick, 650);
      else {
        const d = new Date();
        const p = (n: number) => String(n).padStart(2, "0");
        setRunAt(`${d.getFullYear()}.${p(d.getMonth() + 1)}.${p(d.getDate())}. ${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`);
      }
    };
    setTimeout(tick, 650);
  };

  return (
    <AppShell title={t("prequal.title")}>
      <div className="flex items-center gap-3 mb-4">
        <label className="text-sm text-[color:var(--ink-2)]">{t("prequal.projectLabel")}</label>
        <select
          value={projectId}
          onChange={(e) => setProjectId(e.target.value)}
          className="border border-[color:var(--line)] rounded-md px-3 py-2 text-sm bg-white"
        >
          {projects.map((p) => (
            <option key={p.id} value={p.id}>{p.id} – {p.name}</option>
          ))}
        </select>
        <button onClick={startRun} className="ml-auto btn-signal">
          <Play className="w-3.5 h-3.5" /> {t("prequal.run")}
        </button>
      </div>

      <div className="paper-card p-6 mb-4">
        <div className="flex items-baseline justify-between mb-3">
          <div>
            <div className="mono text-[11px] uppercase tracking-[0.2em]" style={{ color: "var(--accent)" }}>{t("prequal.summary")}</div>
            <div className="mono tabular-nums font-semibold leading-none mt-2" style={{ fontSize: 48, color: "var(--ink)" }}>
              {score}<span className="text-[20px] font-normal" style={{ color: "var(--ink-2)" }}>%</span>
            </div>
          </div>
          <span className={statusColor(project.status)}>{t(`status.${project.status}`)}</span>
        </div>
        <div className="mono text-[11px] uppercase tracking-[0.14em] mb-4 flex flex-wrap gap-x-4 gap-y-1" style={{ color: "var(--ink-2)" }}>
          <span>{t("prequal.runMeta", { cat: CATALOG_VERSION })}</span>
          {runAt && <span>{t("prequal.runAt", { when: runAt })}</span>}
        </div>
        <Ruler value={score} showValue={false} label={t("prequal.gauge")} />
      </div>

      <div className="paper-card p-5 mb-4">
        <h2 className="font-semibold mb-3">{t("prequal.claims")}</h2>
        <div className="space-y-2">
          {projClaims.map((c) => {
            const rule = rules.find((r) => r.id === c.ruleId);
            const evs = documents.filter((d) => c.evidenceDocIds.includes(d.id));
            const isOpen = expanded === c.id;
            return (
              <div key={c.id} className="border border-[color:var(--line)] rounded-md">
                <button
                  onClick={() => setExpanded(isOpen ? null : c.id)}
                  className="w-full flex items-center gap-3 p-3 text-left hover:bg-[color:var(--paper-2)]"
                >
                  {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                  <div className="flex-1">
                    <div className="text-sm font-medium">{c.text}</div>
                    <div className="text-xs text-[color:var(--ink-2)] flex items-center gap-2">
                      <span>{rule?.id} · {t("prequal.evidenceCount", { n: c.evidenceDocIds.length })}</span>
                    </div>
                  </div>
                  <div className={`text-xs font-medium ${confidenceColor(c.confidence)}`}>{c.confidence}%</div>
                  <span className={`text-xs px-2 py-1 rounded border ${statusColor(c.status)}`}>{t(`status.${c.status}`)}</span>
                </button>
                {isOpen && (
                  <div className="p-4 border-t" style={{ borderColor: "var(--line)", background: "var(--paper-2)" }}>
                    <div className="flex items-stretch gap-1 overflow-x-auto pb-2">
                      <div className="min-w-[200px] p-3 cut-xs bg-white text-xs" style={{ boxShadow: "inset 0 0 0 1px var(--line)" }}>
                        <div className="mono uppercase tracking-[0.16em] text-[11px] mb-1" style={{ color: "var(--accent)" }}>{t("prequal.chain.claim")}</div>
                        <div>{c.text}</div>
                      </div>
                      <SchematicConnector label={t("prequal.chain.support")} width={110} />
                      <div className="min-w-[220px] p-3 cut-xs bg-white text-xs" style={{ boxShadow: "inset 0 0 0 1px var(--line)" }}>
                        <div className="mono uppercase tracking-[0.16em] text-[11px] mb-1" style={{ color: "var(--accent)" }}>{t("prequal.chain.evidence")}</div>
                        {evs.map((d) => (
                          <div key={d.id} className="mono text-[12px]">{d.name}</div>
                        ))}
                      </div>
                      <SchematicConnector label={t("prequal.chain.applies")} width={110} />
                      <div className="min-w-[220px] p-3 cut-xs text-xs" style={{ boxShadow: "inset 0 0 0 1px var(--line)", background: "var(--paper)" }}>
                        <div className="mono uppercase tracking-[0.16em] text-[11px] mb-1" style={{ color: "var(--accent)" }}>{t("prequal.chain.rule")}</div>
                        <div className="mono text-[12px] font-medium">{rule?.id} – {rule?.name}</div>
                      </div>
                    </div>
                    <p className="text-xs text-[color:var(--ink-2)] mt-3 italic">{c.explanation}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {projOutcomes.length > 0 && (
        <div className="paper-card p-5 mb-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold">{t("prequal.ontology")}</h2>
          </div>
          <table className="w-full text-sm">
            <thead className="text-xs text-[color:var(--ink-2)] uppercase">
              <tr>
                <th className="text-left py-2 font-medium">{t("prequal.ontology.col.rule")}</th>
                <th className="text-left py-2 font-medium">{t("prequal.ontology.col.class")}</th>
                <th className="text-left py-2 font-medium">{t("prequal.ontology.col.note")}</th>
                <th className="text-right py-2 font-medium">{t("prequal.ontology.col.result")}</th>
              </tr>
            </thead>
            <tbody>
              {projOutcomes.map((o, i) => {
                const r = rules.find((x) => x.id === o.ruleId);
                return (
                  <tr key={i} className="border-t border-[color:var(--line)]">
                    <td className="py-2 pr-3">
                      <div className="font-medium text-[color:var(--ink)]">{o.ruleId}</div>
                      <div className="text-xs text-[color:var(--ink-2)]">{r?.name}</div>
                    </td>
                    <td className="py-2 pr-3 text-xs text-[color:var(--ink-2)]">{r?.ontologyClass ?? "–"}</td>
                    <td className="py-2 pr-3 text-xs text-[color:var(--ink-2)]">{o.note ?? "–"}</td>
                    <td className="py-2 text-right">
                      <span className={`text-xs px-2 py-1 rounded border ${outcomeColor(o.status)}`}>{t(`outcome.${o.status}`)}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <div className="paper-card p-5">
        <h2 className="font-semibold mb-3">{t("prequal.gaps")}</h2>
        {openGaps.length === 0 ? (
          <div className="text-sm text-[color:var(--ink-2)]">{t("prequal.gaps.none")}</div>
        ) : (
          <ul className="space-y-2">
            {openGaps.map((g) => {
              const r = rules.find((x) => x.id === g.ruleId);
              const draft = assigneeDraft[g.key] ?? g.assignee ?? "";
              const closingComment = closeState[g.key] ?? "";
              return (
                <li key={g.key} className="p-3 border rounded-md" style={{ borderColor: "var(--line)" }}>
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className={`text-xs px-2 py-1 rounded border ${severityColor(g.severity)}`}>{t(`severity.${g.severity}`).toUpperCase()}</span>
                    <span className="stamp stamp-neutral">{t(`gap.status.${g.status}`)}</span>
                    <div className="flex-1 text-sm min-w-[240px]">
                      <span className="font-medium mono text-[12px]" style={{ color: "var(--accent)" }}>{g.ruleId}</span>
                      <span className="mono text-[11px] ml-1" style={{ color: "var(--ink-2)" }}>{ruleVersion(g.ruleId)}</span>
                      <span className="ml-2">– {g.text}</span>
                      {g.assignee && (
                        <div className="text-[12px] mt-1" style={{ color: "var(--ink-2)" }}>{t("gap.assignee")} <span style={{ color: "var(--ink)" }}>{g.assignee}</span></div>
                      )}
                    </div>
                    {permissions.canApprove ? (
                      <div className="flex items-center gap-2 flex-wrap">
                        <select
                          value={draft}
                          onChange={(e) => {
                            const v = e.target.value;
                            setAssigneeDraft((s) => ({ ...s, [g.key]: v }));
                            if (v) assignGap(g.key, v, actor);
                          }}
                          className="text-xs border rounded px-2 py-1"
                          style={{ borderColor: "var(--line)" }}
                        >
                          <option value="">{t("prequal.assignPlaceholder")}</option>
                          <option>Kovács Anna</option>
                          <option>Nagy Péter</option>
                          <option>Szabó Kata</option>
                        </select>
                        <button
                          onClick={() => requestReplacement(g.key, actor)}
                          className="text-xs px-3 py-1.5 btn-signal"
                          disabled={g.status === "Pótlásra vár"}
                        >
                          {t("prequal.replacement")}
                        </button>
                      </div>
                    ) : (
                      <span className="text-xs text-[color:var(--ink-2)]/70 inline-flex items-center gap-1">
                        <Lock className="w-3 h-3" /> {t("documents.drawer.readonly")}
                      </span>
                    )}
                  </div>
                  {permissions.canApprove && (
                    <div className="mt-2 flex items-center gap-2">
                      <input
                        value={closingComment}
                        onChange={(e) => setCloseState((s) => ({ ...s, [g.key]: e.target.value }))}
                        placeholder={t("gap.closeCommentPh")}
                        className="flex-1 text-xs border rounded px-2 py-1.5 bg-white"
                        style={{ borderColor: "var(--line)" }}
                      />
                      <button
                        onClick={() => {
                          if (!closingComment.trim()) return;
                          closeGap(g.key, closingComment.trim(), actor);
                          setCloseState((s) => ({ ...s, [g.key]: "" }));
                        }}
                        disabled={!closingComment.trim()}
                        className="text-xs px-3 py-1.5 rounded-md"
                        style={{ background: "var(--ok)", color: "white", opacity: closingComment.trim() ? 1 : 0.5 }}
                      >
                        <CheckCheck className="w-3 h-3 inline mr-1" /> {t("gap.close")}
                      </button>
                    </div>
                  )}
                  {r?.errorMessage && (
                    <div className="mt-2 text-xs text-[#7A1D1D] bg-[#FBE6E6] border border-[#D64545]/40 rounded px-2 py-1 inline-block">
                      {r.errorMessage}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
        {closedGaps.length > 0 && (
          <div className="mt-4 border-t pt-3" style={{ borderColor: "var(--line)" }}>
            <button onClick={() => setShowClosed((v) => !v)} className="text-xs mono uppercase tracking-[0.14em]" style={{ color: "var(--ink-2)" }}>
              {showClosed ? "▾" : "▸"} {t("gap.closedSection")} ({closedGaps.length})
            </button>
            {showClosed && (
              <ul className="mt-2 space-y-1">
                {closedGaps.map((g) => (
                  <li key={g.key} className="text-xs flex items-center gap-2 py-1" style={{ color: "var(--ink-2)" }}>
                    <span className="stamp stamp-ok">{t("gap.status.Pótolva")}</span>
                    <span className="mono">{g.ruleId}</span>
                    <span>– {g.text}</span>
                    {g.resolutionDate && <span className="mono ml-auto">{t("gap.resolvedAt", { when: g.resolutionDate })}</span>}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>


      {runOpen && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setRunOpen(false)}>
          <div className="bg-white rounded-lg w-[480px] max-w-full p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">{t("prequal.modal.title", { id: project.id })}</h3>
              <button onClick={() => setRunOpen(false)} aria-label={t("btn.close")}>
                <X className="w-4 h-4 text-[color:var(--ink-2)]" />
              </button>
            </div>
            <ol className="space-y-3">
              {RUN_STEPS.map((label, i) => {
                const done = i < runStep;
                const active = i === runStep;
                return (
                  <li key={i} className="flex items-center gap-3 text-sm">
                    <div
                      className={`w-6 h-6 cut-xs flex items-center justify-center mono text-[12px] border ${
                        done
                          ? "bg-[color:var(--ink)] border-[color:var(--ink)] text-white"
                          : active
                          ? "border-[color:var(--accent)] text-[color:var(--accent)]"
                          : "border-[color:var(--line)] text-[color:var(--ink-2)]"
                      }`}
                    >
                      {done ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
                    </div>
                    <span className={done ? "text-[color:var(--ink)]" : active ? "text-[color:var(--ink)] font-medium" : "text-[color:var(--ink-2)]/70"}>{label}</span>
                  </li>
                );
              })}
            </ol>
            {runStep >= RUN_STEPS.length && (
              <button onClick={() => setRunOpen(false)} className="mt-5 w-full text-sm px-3 py-2 btn-signal">
                {t("btn.done")}
              </button>
            )}
          </div>
        </div>
      )}
    </AppShell>
  );
}
