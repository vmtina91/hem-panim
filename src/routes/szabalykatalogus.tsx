import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AppShell } from "@/components/hem/AppShell";
import {
  rules,
  claims,
  projects,
  ruleOutcomes,
  severityColor,
  outcomeColor,
  type Rule,
} from "@/lib/hem-data";
import { ruleVersion, ruleHistory } from "@/lib/hem-measurements";
import { useI18n } from "@/lib/i18n";
import { X, AlertOctagon } from "lucide-react";

export const Route = createFileRoute("/szabalykatalogus")({
  head: () => ({ meta: [{ title: "Szabálykatalógus – HEM PANIM" }] }),
  component: RulesPage,
});

function RulesPage() {
  const { t } = useI18n();
  const [selected, setSelected] = useState<Rule | null>(null);

  const filtered = useMemo(() => rules, []);

  return (
    <AppShell title={t("rules.title")}>
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <div className="ml-auto text-xs text-[color:var(--ink-2)]">
          {t("rules.total")} <span className="font-semibold text-[color:var(--ink)]">{rules.length}</span>
        </div>
      </div>

      <div className="paper-card overflow-hidden">
        <table className="data-table">
          <thead>
            <tr>
              <th>{t("rules.col.id")}</th>
              <th>{t("rules.col.name")}</th>
              <th>{t("rules.col.version")}</th>
              <th>{t("rules.col.source")}</th>
              <th>{t("rules.col.type")}</th>
              <th>{t("rules.col.severity")}</th>
              <th>{t("rules.col.status")}</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => (
              <tr key={r.id} className="cursor-pointer" onClick={() => setSelected(r)}>
                <td className="mono font-medium">{r.id}</td>
                <td>{r.name}</td>
                <td><span className="chip-mono">{ruleVersion(r.id)}</span></td>
                <td className="text-[color:var(--ink-2)] text-xs">{r.source}</td>
                <td><span className="chip chip-neutral">{t(`ruleType.${r.type}`)}</span></td>
                <td><span className={`chip ${severityColor(r.severity)}`}>{t(`severity.${r.severity}`)}</span></td>
                <td><span className="stamp stamp-ok">{t("rules.active")}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selected && <RuleDrawer rule={selected} onClose={() => setSelected(null)} />}
    </AppShell>
  );
}

function RuleDrawer({ rule, onClose }: { rule: Rule; onClose: () => void }) {
  const { t } = useI18n();
  const relatedClaims = claims.filter((c) => c.ruleId === rule.id);
  const relatedOutcomes = ruleOutcomes.filter((o) => o.ruleId === rule.id);

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex justify-end" onClick={onClose}>
      <div className="bg-white w-[620px] max-w-full h-full overflow-auto p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-start mb-4">
          <div className="pr-4">
            <div className="text-xs text-[color:var(--ink-2)]">{rule.id}</div>
            <h2 className="font-semibold text-lg">{rule.name}</h2>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <span className="mono text-[12px] px-1.5 py-0.5 cut-xs" style={{ background: "var(--paper-2)", boxShadow: "inset 0 0 0 1px var(--line)", color: "var(--ink)" }}>{ruleVersion(rule.id)}</span>
              <span className={`text-[12px] px-2 py-0.5 rounded border ${severityColor(rule.severity)}`}>{t(`severity.${rule.severity}`)}</span>
              <span className="text-[12px] px-2 py-0.5 rounded bg-[color:var(--paper-2)] text-[color:var(--ink)] border border-[color:var(--line)]">{t(`ruleType.${rule.type}`)}</span>
            </div>
            <div className="text-xs text-[color:var(--ink-2)] mt-2">{rule.source}</div>
          </div>
          <button onClick={onClose} aria-label={t("btn.close")}>
            <X className="w-5 h-5 text-[color:var(--ink-2)]" />
          </button>
        </div>

        <section className="mb-4">
          <h3 className="font-semibold text-sm mb-2">{t("rules.detail.text")}</h3>
          <p className="text-sm text-[color:var(--ink)] leading-relaxed">{rule.text}</p>
        </section>

        {rule.ontologyClass && (
          <section className="mb-4 grid grid-cols-2 gap-3 text-sm">
            <div>
              <div className="text-[12px] uppercase tracking-wide text-[color:var(--ink-2)] mb-1">{t("rules.detail.class")}</div>
              <div className="font-medium text-[color:var(--ink)]">{rule.ontologyClass}</div>
            </div>
            <div>
              <div className="text-[12px] uppercase tracking-wide text-[color:var(--ink-2)] mb-1">{t("rules.detail.evidence")}</div>
              <div className="text-[color:var(--ink)]">{rule.evidence}</div>
            </div>
          </section>
        )}

        {rule.errorMessage && (
          <section className="mb-4">
            <div className="flex items-start gap-2 border border-[#D64545]/40 bg-[#FBE6E6] text-[#7A1D1D] rounded-md p-3">
              <AlertOctagon className="w-4 h-4 mt-0.5 shrink-0" />
              <div className="text-sm">
                <div className="text-[12px] uppercase tracking-wide font-semibold mb-0.5">{t("rules.detail.errorMsg")}</div>
                <div>{rule.errorMessage}</div>
              </div>
            </div>
          </section>
        )}

        {rule.implementation && (
          <section className="mb-4">
            <h3 className="font-semibold text-sm mb-2">{t("rules.detail.impl")}</h3>
            <div className="text-sm text-[color:var(--ink)]">{rule.implementation}</div>
          </section>
        )}

        {rule.testCase && (
          <section className="mb-4">
            <h3 className="font-semibold text-sm mb-2">{t("rules.detail.test")}</h3>
            <pre className="text-xs bg-slate-900 text-slate-100 p-3 rounded overflow-x-auto whitespace-pre-wrap">
{rule.testCase}
            </pre>
          </section>
        )}

        {!rule.ontologyClass && (
          <section className="mb-4">
            <h3 className="font-semibold text-sm mb-2">{t("rules.detail.pseudo")}</h3>
            <pre className="text-xs bg-slate-900 text-slate-100 p-3 rounded overflow-x-auto">
{`IF projekt.dokumentumok CONTAINS (${rule.evidence.split(" ").slice(0, 3).join("_")})
   AND mezők.teljesek == TRUE
THEN status := MEGFELELT
ELSE status := HIÁNYOS`}
            </pre>
          </section>
        )}

        <section className="mb-4">
          <h3 className="font-semibold text-sm mb-2">{t("rules.detail.versionHistory")}</h3>
          <ul className="space-y-1.5">
            {ruleHistory(rule.id).map((v) => (
              <li key={v.version} className="flex items-start gap-3 text-sm">
                <span className={`mono text-[12px] px-1.5 py-0.5 cut-xs shrink-0 ${v.version === ruleVersion(rule.id) ? "font-semibold" : ""}`} style={{ background: v.version === ruleVersion(rule.id) ? "var(--accent)" : "var(--paper-2)", color: v.version === ruleVersion(rule.id) ? "white" : "var(--ink)", boxShadow: v.version === ruleVersion(rule.id) ? "none" : "inset 0 0 0 1px var(--line)" }}>{v.version}</span>
                <span className="mono text-[12px] shrink-0" style={{ color: "var(--ink-2)" }}>{v.date}</span>
                <span className="text-[13px]" style={{ color: "var(--ink)" }}>{v.note}</span>
              </li>
            ))}
          </ul>
        </section>



        <section>
          <h3 className="font-semibold text-sm mb-2">{t("rules.detail.relatedProjects")}</h3>
          {relatedOutcomes.length === 0 && relatedClaims.length === 0 ? (
            <div className="text-sm text-[color:var(--ink-2)]">{t("rules.detail.noRelated")}</div>
          ) : (
            <ul className="space-y-2">
              {relatedOutcomes.map((o, i) => {
                const p = projects.find((x) => x.id === o.projectId);
                return (
                  <li key={`o-${i}`} className="text-sm border border-[color:var(--line)] rounded p-2 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="font-medium text-[color:var(--ink)]">{p?.id} – {p?.name}</div>
                      {o.note && <div className="text-xs text-[color:var(--ink-2)] truncate">{o.note}</div>}
                    </div>
                    <span className={`text-[12px] px-2 py-0.5 rounded border shrink-0 ${outcomeColor(o.status)}`}>{t(`outcome.${o.status}`)}</span>
                  </li>
                );
              })}
              {relatedClaims.map((c) => {
                const p = projects.find((x) => x.id === c.projectId);
                return (
                  <li key={c.id} className="text-sm border border-[color:var(--line)] rounded p-2 flex items-center justify-between gap-3">
                    <span className="min-w-0 truncate">
                      <span className="font-medium">{p?.id}</span> – {c.text}
                    </span>
                    <span className="text-xs text-[color:var(--ink-2)] shrink-0">{t(`status.${c.status}`)}</span>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
