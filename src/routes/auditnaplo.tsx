import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/hem/AppShell";
import { useAuditLog } from "@/lib/hem-store";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/auditnaplo")({
  head: () => ({ meta: [{ title: "Auditnapló – HEM PANIM" }] }),
  component: AuditPage,
});

function AuditPage() {
  const { t } = useI18n();
  const auditLog = useAuditLog();
  const [filter, setFilter] = useState("");
  const filtered = auditLog.filter((e) =>
    [e.user, e.action, e.object, e.details].join(" ").toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <AppShell title={t("audit.title")}>
      <div className="mb-3">
        <input
          type="text"
          placeholder={t("audit.filter")}
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-3 py-2 text-sm border border-[color:var(--line)] rounded-md w-96"
        />
      </div>

      <div className="paper-card overflow-hidden">
        <table className="data-table">
          <thead>
            <tr>
              <th>{t("audit.col.time")}</th>
              <th>{t("audit.col.user")}</th>
              <th>{t("audit.col.action")}</th>
              <th>{t("audit.col.object")}</th>
              <th>{t("audit.col.details")}</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((e, i) => (
              <tr key={i}>
                <td className="mono text-[color:var(--ink-2)] whitespace-nowrap">{e.time}</td>
                <td>{e.user}</td>
                <td>{e.action}</td>
                <td className="text-[color:var(--ink-2)]">{e.object}</td>
                <td className="text-[color:var(--ink-2)]">{e.details}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AppShell>
  );
}
