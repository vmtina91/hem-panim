import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/hem/AppShell";
import { projects, documents, statusColor } from "@/lib/hem-data";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/projektek/")({
  head: () => ({ meta: [{ title: "Projektek – HEM PANIM" }] }),
  component: Projects,
});

function Projects() {
  const { t } = useI18n();
  return (
    <AppShell title={t("projects.title")}>
      <div className="paper-card overflow-hidden">
        <table className="data-table">
          <thead>
            <tr>
              <th>{t("projects.col.id")}</th>
              <th>{t("projects.col.name")}</th>
              <th>{t("projects.col.site")}</th>
              <th>{t("projects.col.measure")}</th>
              <th className="text-right">{t("projects.col.docs")}</th>
              <th>{t("projects.col.status")}</th>
              <th>{t("projects.col.lastEval")}</th>
            </tr>
          </thead>
          <tbody>
            {projects.map((p) => {
              const docCount = documents.filter((d) => d.projectId === p.id).length;
              return (
                <tr key={p.id}>
                  <td>
                    <Link to="/projektek/$id" params={{ id: p.id }} className="mono text-[color:var(--accent)] font-medium hover:underline">
                      {p.id}
                    </Link>
                  </td>
                  <td className="font-medium text-[color:var(--ink)]">{p.name}</td>
                  <td className="text-[color:var(--ink-2)]">{p.site}</td>
                  <td className="text-[color:var(--ink-2)]">{p.measure}</td>
                  <td className="text-[color:var(--ink-2)] text-right mono tabular-nums">{docCount}</td>
                  <td><span className={`chip ${statusColor(p.status)}`}>{t(`status.${p.status}`)}</span></td>
                  <td className="mono text-[color:var(--ink-2)]">{p.lastEval}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </AppShell>
  );
}
