import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { AppShell } from "@/components/hem/AppShell";
import { documents as initialDocs, extractedFields, auditLog, confidenceColor, projects, type DocFile, type DocType, type ExtractedField } from "@/lib/hem-data";
import { classifyDocument, formatFromFilename } from "@/lib/doc-classify";
import { useAuth, roleLabel } from "@/lib/auth";
import { useI18n } from "@/lib/i18n";
import { Upload, X, CheckCircle2, Loader2, CheckCheck, FileText, Lock, Sparkles } from "lucide-react";

export const Route = createFileRoute("/dokumentumok")({
  head: () => ({ meta: [{ title: "Dokumentumok – HEM PANIM" }] }),
  component: DocsPage,
});

const docTypes = ["Energetikai audit", "Mérési jegyzőkönyv", "Számla", "Kivitelezői nyilatkozat", "SCADA-napló", "Szerződés", "Számítási munkalap"] as const;

const statusBadge = (s: DocFile["status"]) => {
  if (s === "Jóváhagyva") return "bg-emerald-100 text-emerald-800 border-emerald-300";
  if (s === "Feldolgozás") return "bg-[color:var(--paper-2)] text-[color:var(--ink)] border-[color:var(--line-2)]";
  return "bg-blue-50 text-blue-700 border-blue-200";
};

function nowStamp() {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}.${pad(d.getMonth() + 1)}.${pad(d.getDate())}. ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

interface PendingDoc {
  name: string;
  format: DocFile["format"];
  type: DocType;
  confidence: number;
  autoDetected: boolean;
}

function DocsPage() {
  const { user, permissions } = useAuth();
  const { t } = useI18n();
  const [docs, setDocs] = useState<DocFile[]>(initialDocs);
  const [uploading, setUploading] = useState(false);
  const [filter, setFilter] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [pending, setPending] = useState<PendingDoc[] | null>(null);
  const [pendingProject, setPendingProject] = useState(projects[0].id);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const selected = docs.find((d) => d.id === selectedId) ?? null;

  // 1. lépés: fájlkiválasztás után automatikus kategorizálás, majd megerősítő ablak
  const handleFilesChosen = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const items: PendingDoc[] = Array.from(files).map((f) => {
      const c = classifyDocument(f.name);
      return {
        name: f.name,
        format: formatFromFilename(f.name),
        type: c.type,
        confidence: c.confidence,
        autoDetected: c.matchedKeyword !== null,
      };
    });
    setPending(items);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // 2. lépés: megerősítés után a dokumentumok bekerülnek a listába
  const confirmUpload = () => {
    if (!pending) return;
    setPending(null);
    setUploading(true);
    setTimeout(() => {
      const newDocs: DocFile[] = pending.map((p, i) => ({
        id: `D-${Math.floor(Math.random() * 900 + 100) + i}`,
        name: p.name,
        projectId: pendingProject,
        type: p.type,
        format: p.format,
        fields: Math.floor(Math.random() * 15 + 5),
        confidence: p.confidence,
        status: "Feldolgozva",
      }));
      setDocs((d) => [...newDocs, ...d]);
      for (const nd of newDocs) {
        auditLog.unshift({
          time: nowStamp(),
          user: user?.name ?? "Rendszer",
          action: "Dokumentum feltöltés",
          object: nd.name,
          details: `Projekt: ${nd.projectId} · Típus: ${nd.type}`,
        });
      }
      setUploading(false);
    }, 1200);
  };

  const filtered = docs.filter((d) =>
    d.name.toLowerCase().includes(filter.toLowerCase()) || d.type.toLowerCase().includes(filter.toLowerCase())
  );

  const handleApproveAll = (doc: DocFile, count: number) => {
    setDocs((prev) => prev.map((d) => (d.id === doc.id ? { ...d, status: "Jóváhagyva" } : d)));
    auditLog.unshift({
      time: nowStamp(),
      user: user?.name ?? "Rendszer",
      action: "Dokumentum jóváhagyása",
      object: doc.name,
      details: `${count} mező jóváhagyva, státusz: Jóváhagyva`,
    });
  };

  return (
    <AppShell title={t("documents.title")}>
      {permissions.canUpload ? (
        <div
          onClick={() => !uploading && fileInputRef.current?.click()}
          className="bg-white border-2 border-dashed border-[color:var(--line-2)] rounded-lg p-8 text-center mb-4 cursor-pointer hover:border-[color:var(--ink)] transition-colors"
        >
          {uploading ? (
            <div className="flex flex-col items-center gap-2 text-[color:var(--ink-2)]">
              <Loader2 className="w-8 h-8 animate-spin text-[color:var(--ink)]" />
              <div className="text-sm font-medium">{t("documents.processing")}</div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 text-[color:var(--ink-2)]">
              <Upload className="w-8 h-8 text-[color:var(--ink-2)]/70" />
              <div className="text-sm font-medium">{t("documents.dropzone")}</div>
              <div className="text-xs text-[color:var(--ink-2)]">{t("documents.formats")}</div>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-[color:var(--paper-2)] border border-[color:var(--line)] rounded-lg p-4 mb-4 flex items-center gap-3 text-sm text-[color:var(--ink-2)]">
          <Lock className="w-4 h-4 text-[color:var(--ink-2)]/70" />
          {t("documents.readonly", { role: user ? roleLabel(user.role, t) : t("documents.guest") })}
        </div>
      )}

      <div className="mb-3">
        <input
          type="text"
          placeholder={t("documents.filter")}
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-3 py-2 text-sm border border-[color:var(--line)] rounded-md w-72"
        />
      </div>

      <div className="paper-card overflow-hidden">
        <table className="data-table">
          <thead>
            <tr>
              <th>{t("documents.col.name")}</th>
              <th>{t("documents.col.project")}</th>
              <th>{t("documents.col.type")}</th>
              <th>{t("documents.col.format")}</th>
              <th className="text-right">{t("documents.col.fields")}</th>
              <th className="text-right">{t("documents.col.confidence")}</th>
              <th>{t("documents.col.status")}</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((d) => (
              <tr key={d.id} className="cursor-pointer" onClick={() => setSelectedId(d.id)}>
                <td className="font-medium text-[color:var(--ink)]">{d.name}</td>
                <td className="mono text-[color:var(--ink-2)]">{d.projectId}</td>
                <td><span className="chip chip-neutral">{d.type}</span></td>
                <td className="text-[color:var(--ink-2)]">{d.format}</td>
                <td className="mono tabular-nums text-right text-[color:var(--ink-2)]">{d.fields}</td>
                <td className={`mono tabular-nums text-right font-medium ${confidenceColor(d.confidence)}`}>{d.confidence}%</td>
                <td>
                  <span className={`chip inline-flex items-center gap-1 ${statusBadge(d.status)}`}>
                    <CheckCircle2 className="w-3 h-3" /> {t(`docStatus.${d.status}`)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept=".pdf,.doc,.docx,.xls,.xlsx,.xlsm,.csv,.tsv"
        className="hidden"
        onChange={(e) => handleFilesChosen(e.target.files)}
      />

      {pending && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setPending(null)}>
          <div className="bg-white rounded-lg w-[560px] max-w-full p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-semibold">{t("documents.classify.title")}</h3>
              <button onClick={() => setPending(null)} aria-label={t("btn.close")}>
                <X className="w-4 h-4 text-[color:var(--ink-2)]" />
              </button>
            </div>
            <p className="text-xs mb-4" style={{ color: "var(--ink-2)" }}>{t("documents.classify.subtitle")}</p>

            <div className="mb-4">
              <label className="block text-xs mb-1.5" style={{ color: "var(--ink-2)" }}>{t("documents.classify.project")}</label>
              <select
                value={pendingProject}
                onChange={(e) => setPendingProject(e.target.value)}
                className="w-full border rounded-md px-3 py-2 text-sm bg-white"
                style={{ borderColor: "var(--line)" }}
              >
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>{p.id} – {p.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-3 max-h-[320px] overflow-y-auto pr-1">
              {pending.map((p, i) => (
                <div key={i} className="border rounded-md p-3" style={{ borderColor: "var(--line)" }}>
                  <div className="flex items-center gap-2 text-sm font-medium mb-2 min-w-0">
                    <FileText className="w-4 h-4 shrink-0" style={{ color: "var(--ink-2)" }} />
                    <span className="truncate">{p.name}</span>
                    <span className="chip chip-neutral ml-auto shrink-0">{p.format}</span>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <select
                      value={p.type}
                      onChange={(e) =>
                        setPending((prev) =>
                          prev ? prev.map((x, j) => (j === i ? { ...x, type: e.target.value as DocType, autoDetected: false, confidence: 99 } : x)) : prev
                        )
                      }
                      className="flex-1 min-w-[200px] border rounded-md px-2 py-1.5 text-sm bg-white"
                      style={{ borderColor: "var(--line)" }}
                    >
                      {docTypes.map((ty) => (
                        <option key={ty} value={ty}>{ty}</option>
                      ))}
                    </select>
                    {p.autoDetected ? (
                      <span className="inline-flex items-center gap-1 text-[11px] px-2 py-1 rounded border bg-blue-50 text-blue-700 border-blue-200">
                        <Sparkles className="w-3 h-3" /> {t("documents.classify.auto", { c: p.confidence })}
                      </span>
                    ) : (
                      <span className={`text-[11px] px-2 py-1 rounded border ${p.confidence >= 99 ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-amber-50 text-amber-800 border-amber-200"}`}>
                        {p.confidence >= 99 ? t("documents.classify.manual") : t("documents.classify.uncertain")}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-2 mt-5">
              <button onClick={() => setPending(null)} className="text-sm px-4 py-2 rounded-md border" style={{ borderColor: "var(--line)", color: "var(--ink-2)" }}>
                {t("btn.cancel")}
              </button>
              <button onClick={confirmUpload} className="btn-signal text-sm px-4 py-2">
                <Upload className="w-3.5 h-3.5" /> {t("documents.classify.confirm", { n: pending.length })}
              </button>
            </div>
          </div>
        </div>
      )}

      {selected && (
        <DocDrawer
          doc={selected}
          onClose={() => setSelectedId(null)}
          onApproveAll={handleApproveAll}
          canApprove={permissions.canApprove}
        />
      )}
    </AppShell>
  );
}

function getFieldsFor(doc: DocFile): ExtractedField[] {
  return (
    extractedFields[doc.id] ?? [
      { name: "Azonosító", value: doc.id, confidence: 90, source: "1. oldal, fejléc" },
      { name: "Dokumentum típusa", value: doc.type, confidence: 95, source: "1. oldal" },
      { name: "Projektazonosító", value: doc.projectId, confidence: 88, source: "1. oldal" },
      { name: "Kinyert mezők száma", value: String(doc.fields), confidence: 82, source: "összesítés" },
      { name: "Átlagos konfidencia", value: `${doc.confidence}%`, confidence: doc.confidence, source: "rendszer" },
    ]
  );
}

function DocDrawer({
  doc,
  onClose,
  onApproveAll,
  canApprove,
}: {
  doc: DocFile;
  onClose: () => void;
  onApproveAll: (doc: DocFile, count: number) => void;
  canApprove: boolean;
}) {
  const { t } = useI18n();
  const fields = getFieldsFor(doc);
  const [approved, setApproved] = useState<Record<number, boolean>>(() =>
    doc.status === "Jóváhagyva" ? Object.fromEntries(fields.map((_, i) => [i, true])) : {}
  );
  const [activeIdx, setActiveIdx] = useState<number | null>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  const approvedCount = Object.values(approved).filter(Boolean).length;
  const total = fields.length;
  const allApproved = approvedCount === total;

  useEffect(() => {
    if (allApproved && doc.status !== "Jóváhagyva") {
      onApproveAll(doc, total);
    }
  }, [allApproved]); // eslint-disable-line react-hooks/exhaustive-deps

  const scrollToField = (i: number) => {
    setActiveIdx(i);
    const el = previewRef.current?.querySelector(`#snip-${i}`);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  const approveOne = (i: number) => setApproved((s) => ({ ...s, [i]: true }));
  const approveAll = () => setApproved(Object.fromEntries(fields.map((_, i) => [i, true])));

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex justify-end" onClick={onClose}>
      <div className="bg-white w-[1100px] max-w-full h-full flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-start px-6 py-4 border-b border-[color:var(--line)]">
          <div>
            <h2 className="font-semibold text-[color:var(--ink)]">{doc.name}</h2>
            <div className="text-xs text-[color:var(--ink-2)] mt-1">{doc.type} · {doc.format} · {doc.projectId}</div>
          </div>
          <div className="flex items-center gap-3">
            <span className={`text-xs px-2 py-1 rounded border inline-flex items-center gap-1 ${statusBadge(doc.status)}`}>
              <CheckCircle2 className="w-3 h-3" /> {t(`docStatus.${doc.status}`)}
            </span>
            <button onClick={onClose} className="text-[color:var(--ink-2)] hover:text-[color:var(--ink)]" aria-label={t("btn.close")}>
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="px-6 py-3 border-b border-[color:var(--line)] bg-[color:var(--paper-2)]">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm text-[color:var(--ink)]">
              {t("documents.drawer.approvedCount", { a: approvedCount, b: total })}
            </div>
            {canApprove ? (
              <button
                onClick={approveAll}
                disabled={allApproved}
                className="text-xs px-3 py-1.5 rounded-md bg-[color:var(--ink)] text-white hover:opacity-90 disabled:bg-slate-300 disabled:cursor-not-allowed inline-flex items-center gap-1.5"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                {t("btn.approveAll")}
              </button>
            ) : (
              <span className="text-xs text-[color:var(--ink-2)] inline-flex items-center gap-1">
                <Lock className="w-3 h-3" /> {t("documents.drawer.readonly")}
              </span>
            )}
          </div>
          <div className="h-2 bg-[color:var(--paper-2)] rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500 transition-all" style={{ width: `${(approvedCount / total) * 100}%` }} />
          </div>
        </div>

        <div className="flex-1 grid grid-cols-2 overflow-hidden">
          <div className="border-r border-[color:var(--line)] overflow-auto bg-[color:var(--paper-2)] p-6" ref={previewRef}>
            <div className="bg-white shadow-sm border border-[color:var(--line)] rounded-md p-8 mx-auto max-w-[520px] font-serif text-[color:var(--ink)] text-sm leading-relaxed">
              <div className="flex items-center gap-2 mb-6 pb-3 border-b border-[color:var(--line)] not-italic">
                <FileText className="w-5 h-5 text-[color:var(--ink-2)]/70" />
                <div className="text-xs uppercase tracking-wider text-[color:var(--ink-2)] font-sans">{doc.type}</div>
              </div>
              <h3 className="text-base font-semibold mb-4">{doc.name}</h3>
              <p className="mb-4 text-[color:var(--ink-2)] text-xs">
                {t("documents.preview.projectFormat", { p: doc.projectId, f: doc.format })}
              </p>

              {fields.map((f, i) => (
                <p
                  key={i}
                  id={`snip-${i}`}
                  className={`mb-4 scroll-mt-6 rounded transition-all ${
                    activeIdx === i ? "ring-2 ring-[color:var(--accent)] ring-offset-2 p-2 -m-2" : ""
                  }`}
                >
                  {t("documents.preview.recorded")} <span className="font-medium">{f.name.toLowerCase()}</span> {t("documents.preview.value")}{" "}
                  <mark className="bg-yellow-200 px-1 rounded">{f.value}</mark>. {t("documents.preview.sourceIs")}{" "}
                  <span className="text-xs text-[color:var(--ink-2)]">{f.source}</span>.
                </p>
              ))}

              <div className="mt-6 pt-4 border-t border-[color:var(--line)] text-xs text-[color:var(--ink-2)] font-sans">
                {t("documents.preview.end")}
              </div>
            </div>
          </div>

          <div className="overflow-auto p-6">
            <h3 className="font-semibold text-sm mb-3">{t("documents.drawer.fields")}</h3>
            <div className="space-y-2">
              {fields.map((f, i) => {
                const isApproved = !!approved[i];
                const isActive = activeIdx === i;
                return (
                  <div
                    key={i}
                    onClick={() => scrollToField(i)}
                    className={`border rounded-md p-3 cursor-pointer transition-all ${
                      isActive ? "border-[color:var(--ink)] bg-blue-50/40" : "border-[color:var(--line)] hover:border-[color:var(--line-2)] hover:bg-[color:var(--paper-2)]"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="text-xs text-[color:var(--ink-2)]">{f.name}</div>
                        <div className="font-medium text-sm text-[color:var(--ink)] truncate">{f.value}</div>
                        <div className="text-[11px] text-[color:var(--ink-2)] mt-1">{t("documents.drawer.source", { s: f.source })}</div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className={`text-xs font-semibold ${confidenceColor(f.confidence)}`}>{f.confidence}%</div>
                      </div>
                    </div>
                    <div className="mt-2 flex justify-end">
                      {isApproved ? (
                        <span className="text-xs text-emerald-700 inline-flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> {t("documents.drawer.approved")}
                        </span>
                      ) : canApprove ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            approveOne(i);
                          }}
                          className="text-xs px-2 py-1 bg-emerald-50 text-emerald-700 rounded hover:bg-emerald-100"
                        >
                          {t("btn.approve")}
                        </button>
                      ) : (
                        <span className="text-[11px] text-[color:var(--ink-2)]/70 inline-flex items-center gap-1">
                          <Lock className="w-3 h-3" /> {t("documents.drawer.noRight")}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="text-[11px] text-[color:var(--ink-2)] mt-4">{t("documents.drawer.hint")}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
