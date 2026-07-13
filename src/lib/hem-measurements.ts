// Measurement data model per project — Baseline, Utómérés, Megtakarítás.
export type MeasurementUnit = "kWh" | "MWh";
export type EvidenceStatus = "Igazolt" | "Hiányzik" | "Bizonytalan";

export interface MeasurementRecord {
  projectId: string;
  periodStart: string;
  periodEnd: string;
  value: number;
  unit: MeasurementUnit;
  sourceDocId: string | null;
  sourceDocName: string | null;
  evidenceStatus: EvidenceStatus;
  note?: string;
}

export interface SavingCalc {
  projectId: string;
  baselineValue: number;
  postValue: number;
  savingValue: number;
  unit: MeasurementUnit;
  method: string;
  ruleIds: string[];
  note?: string;
}

// P-001 (Bizonytalan): baseline igazolt, utómérés részleges
// P-002 (Nem megfelelt): baseline forrás HIÁNYZIK (HEM-R-BASE-002 Fail)
// P-003 (Megfelelt): teljes lánc
export const baselineMeasurements: MeasurementRecord[] = [
  {
    projectId: "P-001",
    periodStart: "2024.11.01.",
    periodEnd: "2025.10.31.",
    value: 184320,
    unit: "kWh",
    sourceDocId: "D-02",
    sourceDocName: "MJ-2025-11.pdf",
    evidenceStatus: "Igazolt",
    note: "Mérési jegyzőkönyv, 12 hónap.",
  },
  {
    projectId: "P-002",
    periodStart: "2024.10.01.",
    periodEnd: "2025.09.30.",
    value: 312500,
    unit: "kWh",
    sourceDocId: null,
    sourceDocName: null,
    evidenceStatus: "Hiányzik",
    note: "Kézi bevitel – forrásdokumentum hiányzik (HEM-R-BASE-002 Fail).",
  },
  {
    projectId: "P-003",
    periodStart: "2024.07.01.",
    periodEnd: "2025.06.30.",
    value: 96.4,
    unit: "MWh",
    sourceDocId: "D-11",
    sourceDocName: "MJ-hoszivattyu-2026.pdf",
    evidenceStatus: "Igazolt",
    note: "12 hónapot lefedő mérési jegyzőkönyv, kalibráció érvényes.",
  },
];

export const postMeasurements: MeasurementRecord[] = [
  {
    projectId: "P-001",
    periodStart: "2025.11.01.",
    periodEnd: "2026.05.31.",
    value: 143120,
    unit: "kWh",
    sourceDocId: "D-05",
    sourceDocName: "SCADA_export_2025.csv",
    evidenceStatus: "Bizonytalan",
    note: "Nem szabványos mértékegység a SCADA-exportban (HEM-R-MEAS-001 Warning).",
  },
  {
    projectId: "P-002",
    periodStart: "2025.10.01.",
    periodEnd: "2026.03.31.",
    value: 268100,
    unit: "kWh",
    sourceDocId: "D-07",
    sourceDocName: "Gazszamla_2025.pdf",
    evidenceStatus: "Bizonytalan",
    note: "Számla-alapú becslés, mérési jegyzőkönyv nincs.",
  },
  {
    projectId: "P-003",
    periodStart: "2025.07.01.",
    periodEnd: "2026.06.30.",
    value: 57.7,
    unit: "MWh",
    sourceDocId: "D-12",
    sourceDocName: "Szamitasi_munkalap_HMV.xlsx",
    evidenceStatus: "Igazolt",
  },
];

export const savingCalcs: SavingCalc[] = [
  {
    projectId: "P-001",
    baselineValue: 184320,
    postValue: 143120,
    savingValue: 41200,
    unit: "kWh",
    method: "Közvetlen mérésalapú különbség, HDD-korrekció nélkül.",
    ruleIds: ["HEM-R-SAVE-001", "HEM-R-SAVE-002"],
    note: "Normálévi korrekció nem dokumentált (SZ-07 Magas figyelmeztetés).",
  },
  {
    projectId: "P-002",
    baselineValue: 312500,
    postValue: 268100,
    savingValue: 44400,
    unit: "kWh",
    method: "Számla-alapú különbségszámítás.",
    ruleIds: ["HEM-R-SAVE-001", "HEM-R-SAVE-002"],
    note: "Baseline forrásdokumentum hiányzik – a számítás nem minősíthető (HEM-R-SAVE-001 Fail).",
  },
  {
    projectId: "P-003",
    baselineValue: 96.4,
    postValue: 57.7,
    savingValue: 38.7,
    unit: "MWh",
    method: "Mérésalapú különbség, kalibrált mérőeszközzel, teljes 12 hónap.",
    ruleIds: ["HEM-R-SAVE-001", "HEM-R-SAVE-002"],
  },
];

export const evidenceStatusStamp = (s: EvidenceStatus): string => {
  if (s === "Igazolt") return "stamp stamp-ok";
  if (s === "Bizonytalan") return "stamp stamp-warn";
  return "stamp stamp-fail";
};

// -------- Rule versioning --------
export interface RuleVersionEntry {
  version: string;
  date: string;
  note: string;
}
// Default v1.0 for all rules unless overridden here.
export const ruleVersionMap: Record<string, { current: string; history: RuleVersionEntry[] }> = {
  "SZ-07": {
    current: "v1.1",
    history: [
      { version: "v1.0", date: "2025.09.01.", note: "Első kiadás – HDD-alapú normálévi korrekció kötelezővé tétele." },
      { version: "v1.1", date: "2026.04.15.", note: "Pontosítás: HDD-forrás megjelölése (OMSZ/EUR) kötelező." },
    ],
  },
  "HEM-R-MEAS-001": {
    current: "v1.1",
    history: [
      { version: "v1.0", date: "2025.11.10.", note: "Első kiadás – kWh, MWh, GJ, m3, tCO2e." },
      { version: "v1.1", date: "2026.05.20.", note: "„kw/h” és „KWH” formák Warning helyett Fail, normalizálás után Pass." },
    ],
  },
};
export const ruleVersion = (ruleId: string): string => ruleVersionMap[ruleId]?.current ?? "v1.0";
export const ruleHistory = (ruleId: string): RuleVersionEntry[] => ruleVersionMap[ruleId]?.history ?? [{ version: "v1.0", date: "2025.09.01.", note: "Első kiadás." }];
