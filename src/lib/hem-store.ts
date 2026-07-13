// Lightweight reactive store for HEM demo — enables human-in-the-loop review,
// gap lifecycle, and live audit-log appends across pages.
import { useSyncExternalStore } from "react";
import { gaps as seedGaps, auditLog as seedAudit, claims as seedClaims, extractedFields as seedFields, ruleOutcomes as seedOutcomes, type Gap, type AuditEntry } from "./hem-data";

// -------- Rule catalog version --------
export const CATALOG_VERSION = "0.9";
export const CATALOG_LABEL = `HEM ontológia- és szabálykatalógus v${CATALOG_VERSION}`;

// -------- Gap lifecycle --------
export type GapStatus = "Nyitott" | "Folyamatban" | "Pótlásra vár" | "Pótolva";
export interface GapItem extends Gap {
  key: string;
  status: GapStatus;
  assignee?: string;
  resolutionDate?: string;
  resolutionComment?: string;
}

// -------- Review queue --------
export type ReviewStatus = "Nyitott" | "Jóváhagyva" | "Elutasítva" | "Javítva";
export type ReviewKind = "field" | "claim" | "outcome";
export interface ReviewItem {
  id: string;
  kind: ReviewKind;
  projectId: string;
  itemLabel: string;
  source: string;
  confidence: number;
  reason: string;
  ruleId?: string;
  status: ReviewStatus;
  decidedBy?: string;
  decidedAt?: string;
  comment?: string;
  correctedValue?: string;
}

// -------- Seed review items --------
function seedReviewItems(): ReviewItem[] {
  const items: ReviewItem[] = [];
  // Low-confidence extracted fields
  Object.entries(seedFields).forEach(([docId, fields]) => {
    fields.forEach((f, i) => {
      if (f.confidence < 75) {
        items.push({
          id: `RF-${docId}-${i}`,
          kind: "field",
          projectId: docId.startsWith("D-0") && Number(docId.slice(2)) <= 5 ? "P-001" : docId === "D-04" ? "P-001" : "P-002",
          itemLabel: `${f.name}: ${f.value}`,
          source: `${docId} · ${f.source}`,
          confidence: f.confidence,
          reason: "Alacsony konfidencia – HEM-R-AI-001",
          ruleId: "HEM-R-AI-001",
          status: "Nyitott",
        });
      }
    });
  });
  // Uncertain / low-confidence claims
  seedClaims.forEach((c) => {
    if (c.status === "Bizonytalan" || c.confidence < 75) {
      items.push({
        id: `RC-${c.id}`,
        kind: "claim",
        projectId: c.projectId,
        itemLabel: c.text,
        source: `Állítás ${c.id} · ${c.ruleId}`,
        confidence: c.confidence,
        reason: c.status === "Bizonytalan" ? "Bizonytalan állítás – emberi review szükséges" : "Alacsony konfidencia – HEM-R-AI-001",
        ruleId: c.ruleId,
        status: "Nyitott",
      });
    }
  });
  // Rule outcomes with warnings (review-required)
  seedOutcomes.forEach((o, i) => {
    if (o.status === "Warning") {
      items.push({
        id: `RO-${o.projectId}-${o.ruleId}-${i}`,
        kind: "outcome",
        projectId: o.projectId,
        itemLabel: `${o.ruleId} – ${o.note ?? "Review szükséges"}`,
        source: `Szabálykiértékelés · ${o.projectId}`,
        confidence: 60,
        reason: "ReviewRequired – Warning státusz",
        ruleId: o.ruleId,
        status: "Nyitott",
      });
    }
  });
  return items;
}

// -------- Store implementation --------
type Listener = () => void;
class Store<T> {
  private listeners = new Set<Listener>();
  constructor(private state: T) {}
  get = (): T => this.state;
  set = (updater: (s: T) => T): void => {
    this.state = updater(this.state);
    this.listeners.forEach((l) => l());
  };
  subscribe = (l: Listener): (() => void) => {
    this.listeners.add(l);
    return () => this.listeners.delete(l);
  };
}

const gapsStore = new Store<GapItem[]>(
  seedGaps.map((g, i) => {
    // Seed a couple in mid-lifecycle for realism
    let status: GapStatus = "Nyitott";
    let assignee: string | undefined;
    if (g.projectId === "P-001" && g.ruleId === "SZ-05") { status = "Folyamatban"; assignee = "Nagy Péter"; }
    if (g.projectId === "P-002" && g.ruleId === "SZ-02") { status = "Pótlásra vár"; assignee = "Kovács Anna"; }
    return { ...g, key: `${g.projectId}-${g.ruleId}-${i}`, status, assignee };
  }),
);

const reviewStore = new Store<ReviewItem[]>(seedReviewItems());
const auditStore = new Store<AuditEntry[]>([...seedAudit]);

// -------- Public hooks --------
export function useGaps(): GapItem[] {
  return useSyncExternalStore(gapsStore.subscribe, gapsStore.get, gapsStore.get);
}
export function useReviewItems(): ReviewItem[] {
  return useSyncExternalStore(reviewStore.subscribe, reviewStore.get, reviewStore.get);
}
export function useAuditLog(): AuditEntry[] {
  return useSyncExternalStore(auditStore.subscribe, auditStore.get, auditStore.get);
}
export function useOpenReviewCount(): number {
  const items = useReviewItems();
  return items.filter((r) => r.status === "Nyitott").length;
}
export function useOpenGapCount(): number {
  const items = useGaps();
  return items.filter((g) => g.status !== "Pótolva").length;
}

// -------- Actions --------
function nowStamp(): string {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}.${p(d.getMonth() + 1)}.${p(d.getDate())}. ${p(d.getHours())}:${p(d.getMinutes())}`;
}
function logAudit(entry: Omit<AuditEntry, "time"> & { time?: string }): void {
  auditStore.set((s) => [{ time: entry.time ?? nowStamp(), user: entry.user, action: entry.action, object: entry.object, details: entry.details }, ...s]);
}

export function assignGap(key: string, assignee: string, actor: string): void {
  gapsStore.set((s) => s.map((g) => (g.key === key ? { ...g, assignee, status: g.status === "Nyitott" ? "Folyamatban" : g.status } : g)));
  const g = gapsStore.get().find((x) => x.key === key);
  if (g) logAudit({ user: actor, action: "Hiánypótlás – felelős kijelölve", object: `${g.projectId} / ${g.ruleId}`, details: `Felelős: ${assignee}, státusz: Folyamatban` });
}
export function requestReplacement(key: string, actor: string): void {
  gapsStore.set((s) => s.map((g) => (g.key === key ? { ...g, status: "Pótlásra vár" } : g)));
  const g = gapsStore.get().find((x) => x.key === key);
  if (g) logAudit({ user: actor, action: "Hiánypótlás – pótlás kérve", object: `${g.projectId} / ${g.ruleId}`, details: "Státusz: Pótlásra vár" });
}
export function closeGap(key: string, comment: string, actor: string): void {
  const now = nowStamp();
  gapsStore.set((s) => s.map((g) => (g.key === key ? { ...g, status: "Pótolva", resolutionDate: now, resolutionComment: comment } : g)));
  const g = gapsStore.get().find((x) => x.key === key);
  if (g) logAudit({ user: actor, action: "Hiánypótlás – lezárva", object: `${g.projectId} / ${g.ruleId}`, details: `Pótolva: ${comment}` });
}

export function decideReview(id: string, decision: "Jóváhagyva" | "Elutasítva" | "Javítva", actor: string, comment?: string, correctedValue?: string): void {
  const at = nowStamp();
  reviewStore.set((s) => s.map((r) => (r.id === id ? { ...r, status: decision, decidedBy: actor, decidedAt: at, comment, correctedValue } : r)));
  const r = reviewStore.get().find((x) => x.id === id);
  if (r) logAudit({ user: actor, action: `Felülvizsgálat – ${decision}`, object: `${r.projectId} · ${r.itemLabel.slice(0, 60)}`, details: `${r.reason}${comment ? ` · Megjegyzés: ${comment}` : ""}${correctedValue ? ` · Új érték: ${correctedValue}` : ""}` });
}
