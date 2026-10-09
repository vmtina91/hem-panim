import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { AppShell } from "@/components/hem/AppShell";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/lib/auth";
import { useReviewItems, decideReview, type ReviewItem, type ReviewStatus } from "@/lib/hem-store";
import { confidenceColor } from "@/lib/hem-data";
import { Check, X, Wrench, Lock } from "lucide-react";

export const Route = createFileRoute("/felulvizsgalat")({
  head: () => ({ meta: [{ title: "Felülvizsgálat – HEM PANIM" }] }),
  component: ReviewPage,
});

const reviewStamp = (s: ReviewStatus): string => {
  if (s === "Jóváhagyva" || s === "Javítva") return "stamp stamp-ok";
  if (s === "Elutasítva") return "stamp stamp-fail";
  return "stamp stamp-warn";
};

function ReviewPage() {
  const { t } = useI18n();
  const { user, permissions } = useAuth();
  const items = useReviewItems();
  const [filter, setFilter] = useState<"open" | "all">("open");
  const [activeId, setActiveId] = useState<string | null>(null);
  const [comment, setComment] = useState("");
  const [corrected, setCorrected] = useState("");
  const [error, setError] = useState("");

  const filtered = useMemo(
    () => (filter === "open" ? items.filter((r) => r.status === "Nyitott") : items),
    [items, filter],
  );

  const canDecide = permissions?.canApprove ?? true;
  const reviewer = user?.name ?? "Ismeretlen felhasználó";

  const submit = (id: string, decision: "Jóváhagyva" | "Elutasítva" | "Javítva") => {
    if (decision === "Elutasítva" && comment.trim().length === 0) {
      setError(t("review.needComment"));
      return;
    }
    if (decision === "Javítva" && corrected.trim().length === 0) {
      setError(t("review.correctedPh"));
      return;
    }
    setError("");
    decideReview(id, decision, reviewer, comment.trim() || undefined, corrected.trim() || undefined);
    setActiveId(null);
    setComment("");
    setCorrected("");
  };

  return (
    <AppShell title={t("review.title")} subtitle={t("review.subtitle")}>
      <div className="flex items-center gap-2 mb-4">
        {(["open", "all"] as const).map((k) => {
          const active = filter === k;
          const count = k === "open" ? items.filter((r) => r.status === "Nyitott").length : items.length;
          return (
            <button
              key={k}
              onClick={() => setFilter(k)}
              className={`tab-pill ${active ? "is-active" : ""}`}
            >
              {t(`review.filter.${k}`)}
              <span className="tab-count">{count}</span>
            </button>
          );
        })}
      </div>

      {filtered.length === 0 ? (
        <div className="paper-card p-6 text-sm" style={{ color: "var(--ink-2)" }}>{t("review.empty")}</div>
      ) : (
        <div className="paper-card overflow-hidden">
          <table className="data-table">
            <thead>
              <tr>
                <th>{t("review.col.item")}</th>
                <th>{t("review.col.project")}</th>
                <th>{t("review.col.source")}</th>
                <th className="text-right">{t("review.col.confidence")}</th>
                <th>{t("review.col.reason")}</th>
                <th>{t("review.col.status")}</th>
                <th className="text-right">{t("review.col.actions")}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <ReviewRow
                  key={r.id}
                  r={r}
                  isActive={activeId === r.id}
                  canDecide={canDecide}
                  comment={comment}
                  corrected={corrected}
                  error={activeId === r.id ? error : ""}
                  onOpen={() => { setActiveId(r.id); setComment(""); setCorrected(""); setError(""); }}
                  onClose={() => { setActiveId(null); setError(""); }}
                  onComment={setComment}
                  onCorrected={setCorrected}
                  onDecide={(d) => submit(r.id, d)}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AppShell>
  );
}

interface ReviewRowProps {
  r: ReviewItem;
  isActive: boolean;
  canDecide: boolean;
  comment: string;
  corrected: string;
  error: string;
  onOpen: () => void;
  onClose: () => void;
  onComment: (v: string) => void;
  onCorrected: (v: string) => void;
  onDecide: (d: "Jóváhagyva" | "Elutasítva" | "Javítva") => void;
}

function ReviewRow({ r, isActive, canDecide, comment, corrected, error, onOpen, onClose, onComment, onCorrected, onDecide }: ReviewRowProps) {
  const { t } = useI18n();
  const isOpen = r.status === "Nyitott";
  return (
    <>
      <tr className="border-t align-top" style={{ borderColor: "var(--line)" }}>
        <td className="px-4 py-3">
          <div className="text-sm">{r.itemLabel}</div>
          <div className="mono text-[11px] uppercase tracking-[0.14em] mt-1" style={{ color: "var(--ink-2)" }}>{r.kind === "field" ? "Mező" : r.kind === "claim" ? "Állítás" : "Szabályeredmény"}</div>
        </td>
        <td className="px-4 py-3 mono text-[12px]" style={{ color: "var(--accent)" }}>{r.projectId}</td>
        <td className="px-4 py-3 mono text-[12px]" style={{ color: "var(--ink-2)" }}>{r.source}</td>
        <td className={`px-4 py-3 text-right mono tabular-nums text-[13px] font-semibold ${confidenceColor(r.confidence)}`}>{r.confidence}%</td>
        <td className="px-4 py-3 text-[12px]" style={{ color: "var(--ink-2)" }}>{r.reason}</td>
        <td className="px-4 py-3">
          <span className={reviewStamp(r.status)}>{r.status}</span>
          {!isOpen && r.decidedBy && (
            <div className="text-[11px] mt-1" style={{ color: "var(--ink-2)" }}>{t("review.decidedBy", { who: r.decidedBy, when: r.decidedAt ?? "" })}</div>
          )}
        </td>
        <td className="px-4 py-3 text-right">
          {isOpen && canDecide && !isActive && (
            <button onClick={onOpen} className="btn-outline-ink text-xs">{t("review.btn.approve")} / {t("review.btn.reject")}</button>
          )}
          {!canDecide && (
            <span className="text-xs inline-flex items-center gap-1" style={{ color: "var(--ink-2)" }}><Lock className="w-3 h-3" /> {t("documents.drawer.readonly")}</span>
          )}
          {r.comment && !isOpen && (
            <div className="text-[12px] italic mt-1" style={{ color: "var(--ink-2)" }}>„{r.comment}”</div>
          )}
        </td>
      </tr>
      {isActive && (
        <tr style={{ background: "var(--paper-2)" }}>
          <td colSpan={7} className="px-4 py-4">
            <div className="flex flex-wrap items-start gap-3">
              <textarea
                value={comment}
                onChange={(e) => onComment(e.target.value)}
                placeholder={t("review.commentPh")}
                rows={2}
                className="flex-1 min-w-[240px] text-sm border rounded-md px-3 py-2 bg-white"
                style={{ borderColor: "var(--line)" }}
              />
              <input
                value={corrected}
                onChange={(e) => onCorrected(e.target.value)}
                placeholder={t("review.correctedPh")}
                className="text-sm border rounded-md px-3 py-2 bg-white w-56"
                style={{ borderColor: "var(--line)" }}
              />
              <div className="flex items-center gap-2">
                <button onClick={() => onDecide("Jóváhagyva")} className="btn-signal text-xs"><Check className="w-3 h-3" /> {t("review.btn.approve")}</button>
                <button onClick={() => onDecide("Javítva")} className="btn-outline-ink text-xs"><Wrench className="w-3 h-3" /> {t("review.btn.fix")}</button>
                <button onClick={() => onDecide("Elutasítva")} className="text-xs px-3 py-1.5 rounded-md border" style={{ background: "var(--fail)", color: "white", borderColor: "var(--fail)" }}><X className="w-3 h-3 inline" /> {t("review.btn.reject")}</button>
                <button onClick={onClose} className="text-xs px-2 py-1.5" style={{ color: "var(--ink-2)" }}>{t("btn.cancel")}</button>
              </div>
            </div>
            {error && <div className="mt-2 text-xs" style={{ color: "var(--fail)" }}>{error}</div>}
          </td>
        </tr>
      )}
    </>
  );
}
