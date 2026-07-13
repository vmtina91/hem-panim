import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { AppShell } from "@/components/hem/AppShell";
import { projects, documents, claims, rules, statusColor, confidenceColor } from "@/lib/hem-data";
import { Ruler } from "@/components/hem/energy";
import { ArrowLeft } from "lucide-react";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/projektek/$id")({
  head: ({ params }) => ({ meta: [{ title: `${params.id} – HEM PANIM` }] }),
  loader: ({ params }) => {
    const project = projects.find((p) => p.id === params.id);
    if (!project) throw notFound();
    return { project };
  },
  component: ProjectDetail,
});

function ProjectDetail() {
  const { project } = Route.useLoaderData();
  const { t } = useI18n();
  const docs = documents.filter((d) => d.projectId === project.id);
  const projectClaims = claims.filter((c) => c.projectId === project.id);

  return (
    <AppShell title={t("project.title", { id: project.id })}>
      <Link to="/projektek" className="inline-flex items-center gap-1 text-sm text-[color:var(--ink-2)] hover:text-[color:var(--ink)] mb-4">
        <ArrowLeft className="w-4 h-4" /> {t("project.back")}
      </Link>

      <div className="paper-card p-6 mb-4">
        <div className="flex items-start justify-between gap-6 mb-6">
          <div>
            <div className="mono text-[10px] uppercase tracking-[0.2em] mb-2" style={{ color: "var(--accent)" }}>{project.id}</div>
            <h2 className="text-xl font-semibold">{project.name}</h2>
            <div className="mono text-[11px] uppercase tracking-[0.14em] mt-2" style={{ color: "var(--ink-2)" }}>
              {project.site} · {project.measure}
            </div>
            <div className="mt-3">
              <span className={statusColor(project.status)}>{t(`status.${project.status}`)}</span>
            </div>
          </div>
        </div>
        <Ruler value={project.score} label={t("project.score")} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="paper-card p-5">
          <div className="mono text-[10px] uppercase tracking-[0.18em] mb-3" style={{ color: "var(--ink-2)" }}>
            {t("project.docs")} ({docs.length})
          </div>
          <ul className="space-y-2">
            {docs.map((d) => (
              <li key={d.id} className="text-sm flex justify-between border-b pb-2" style={{ borderColor: "var(--line)" }}>
                <div className="min-w-0">
                  <div className="mono text-[12px] truncate">{d.name}</div>
                  <div className="mono text-[10px] uppercase tracking-[0.12em] mt-0.5" style={{ color: "var(--ink-2)" }}>{d.type} · {d.format}</div>
                </div>
                <div className={`mono text-[12px] font-semibold shrink-0 ml-3 ${confidenceColor(d.confidence)}`}>{d.confidence}%</div>
              </li>
            ))}
          </ul>
        </div>

        <div className="paper-card p-5">
          <div className="mono text-[10px] uppercase tracking-[0.18em] mb-3" style={{ color: "var(--ink-2)" }}>
            {t("project.claims")}
          </div>
          <ul className="space-y-3">
            {projectClaims.map((c) => {
              const rule = rules.find((r) => r.id === c.ruleId);
              return (
                <li key={c.id} className="text-sm border-b pb-3" style={{ borderColor: "var(--line)" }}>
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex-1">
                      <div>{c.text}</div>
                      <div className="mono text-[10px] uppercase tracking-[0.12em] mt-1" style={{ color: "var(--ink-2)" }}>{rule?.id} – {rule?.name}</div>
                    </div>
                    <span className={statusColor(c.status)}>{t(`status.${c.status}`)}</span>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </AppShell>
  );
}
