// Mock data for HEM PANIM TRL 3 demo. Replace with real API later.

export type ComplianceStatus = "Megfelelt" | "Bizonytalan" | "Nem megfelelt";
export type Severity = "Kritikus" | "Magas" | "Közepes";
export type RuleType = "Teljességi" | "Konzisztencia" | "Számítási" | "Formai";
export type DocType =
  | "Energetikai audit"
  | "Mérési jegyzőkönyv"
  | "Számla"
  | "Kivitelezői nyilatkozat"
  | "SCADA-napló"
  | "Szerződés"
  | "Számítási munkalap";


export interface Project {
  id: string;
  name: string;
  site: string;
  measure: string;
  status: ComplianceStatus;
  lastEval: string;
  score: number;
}

export const projects: Project[] = [
  {
    id: "P-001",
    name: "Világításkorszerűsítés LED-re",
    site: "Gyártócsarnok, Győr",
    measure: "Világítás",
    status: "Bizonytalan",
    lastEval: "2026.06.28.",
    score: 71,
  },
  {
    id: "P-002",
    name: "Kazáncsere kondenzációs kazánra",
    site: "Irodaház, Budapest",
    measure: "Fűtés",
    status: "Nem megfelelt",
    lastEval: "2026.06.30.",
    score: 54,
  },
  {
    id: "P-003",
    name: "Hőszivattyús HMV-rendszer",
    site: "Szálloda, Debrecen",
    measure: "HMV",
    status: "Megfelelt",
    lastEval: "2026.07.01.",
    score: 93,
  },
];

export interface DocFile {
  id: string;
  name: string;
  projectId: string;
  type: DocType;
  format: "PDF" | "DOCX" | "XLSX" | "CSV";
  fields: number;
  confidence: number;
  status: "Feldolgozva" | "Jóváhagyva" | "Feldolgozás";
}

export const documents: DocFile[] = [
  { id: "D-01", name: "Energetikai_audit_Gyor_2025.pdf", projectId: "P-001", type: "Energetikai audit", format: "PDF", fields: 24, confidence: 92, status: "Feldolgozva" },
  { id: "D-02", name: "MJ-2025-11.pdf", projectId: "P-001", type: "Mérési jegyzőkönyv", format: "PDF", fields: 12, confidence: 88, status: "Feldolgozva" },
  { id: "D-03", name: "Aramszamla_2025_Q4.pdf", projectId: "P-001", type: "Számla", format: "PDF", fields: 8, confidence: 95, status: "Feldolgozva" },
  { id: "D-04", name: "Kivitelezoi_nyilatkozat_LED.docx", projectId: "P-001", type: "Kivitelezői nyilatkozat", format: "DOCX", fields: 6, confidence: 74, status: "Feldolgozva" },
  { id: "D-05", name: "SCADA_export_2025.csv", projectId: "P-001", type: "SCADA-napló", format: "CSV", fields: 18, confidence: 81, status: "Feldolgozva" },
  { id: "D-06", name: "Energetikai_audit_BP_iroda.pdf", projectId: "P-002", type: "Energetikai audit", format: "PDF", fields: 22, confidence: 90, status: "Feldolgozva" },
  { id: "D-07", name: "Gazszamla_2025.pdf", projectId: "P-002", type: "Számla", format: "PDF", fields: 9, confidence: 93, status: "Feldolgozva" },
  { id: "D-08", name: "Kivitelezoi_nyilatkozat_kazan.docx", projectId: "P-002", type: "Kivitelezői nyilatkozat", format: "DOCX", fields: 5, confidence: 62, status: "Feldolgozva" },
  { id: "D-09", name: "Szerzodes_kazan_2025.pdf", projectId: "P-002", type: "Szerződés", format: "PDF", fields: 11, confidence: 89, status: "Feldolgozva" },
  { id: "D-10", name: "Energetikai_audit_Debrecen.pdf", projectId: "P-003", type: "Energetikai audit", format: "PDF", fields: 26, confidence: 94, status: "Feldolgozva" },
  { id: "D-11", name: "MJ-hoszivattyu-2026.pdf", projectId: "P-003", type: "Mérési jegyzőkönyv", format: "PDF", fields: 14, confidence: 91, status: "Feldolgozva" },
  { id: "D-12", name: "Szamitasi_munkalap_HMV.xlsx", projectId: "P-003", type: "Számítási munkalap", format: "XLSX", fields: 20, confidence: 87, status: "Feldolgozva" },
];

export interface ExtractedField {
  name: string;
  value: string;
  confidence: number;
  source: string;
}

export const extractedFields: Record<string, ExtractedField[]> = {
  "D-02": [
    { name: "Bázisfogyasztás", value: "184 320 kWh/év", confidence: 92, source: "12. oldal, 3. táblázat" },
    { name: "Mérési időszak kezdete", value: "2024.11.01.", confidence: 96, source: "1. oldal, fejléc" },
    { name: "Mérési időszak vége", value: "2025.10.31.", confidence: 96, source: "1. oldal, fejléc" },
    { name: "Mérőeszköz azonosító", value: "EM-4421-A", confidence: 88, source: "2. oldal" },
    { name: "Mértékegység", value: "kWh", confidence: 99, source: "táblázat fejléc" },
  ],
  "D-04": [
    { name: "Kivitelező neve", value: "LumenTech Kft.", confidence: 94, source: "1. oldal" },
    { name: "Befejezés dátuma", value: "2026.03.15.", confidence: 90, source: "2. oldal" },
    { name: "Aláírás", value: "hiányzik", confidence: 45, source: "3. oldal, aláírásmező" },
  ],
};

export type RuleGroup = "Demó alapszabályok" | "HEM ontológiamodell v0.9";

export interface Rule {
  id: string;
  name: string;
  source: string;
  type: RuleType;
  severity: Severity;
  evidence: string;
  text: string;
  group: RuleGroup;
  ontologyClass?: string;
  errorMessage?: string;
  implementation?: string;
  testCase?: string;
}

export type OutcomeStatus = "Pass" | "Warning" | "Fail";

export interface RuleOutcome {
  projectId: string;
  ruleId: string;
  status: OutcomeStatus;
  note?: string;
}

const HEM_SRC = "HEM ontológia- és szabálykatalógus-modell v0.9";

export const rules: Rule[] = [
  { id: "SZ-01", group: "Demó alapszabályok", name: "Bázisfogyasztás dokumentáltsága", source: "HEM módszertan 4.2", type: "Teljességi", severity: "Kritikus", evidence: "Mérési jegyzőkönyv VAGY számlák (12 hónap)", text: "A projekt bázisidőszaki fogyasztását dokumentált mérési jegyzőkönyv vagy 12 hónapot lefedő számlasorozat kell alátámasszon." },
  { id: "SZ-02", group: "Demó alapszabályok", name: "Bázis- és beszámolási időszak egyezése", source: "HEM módszertan 4.3", type: "Konzisztencia", severity: "Kritikus", evidence: "Mérési jegyzőkönyv, számla", text: "A bázis- és beszámolási időszak hossza és időbeli elhelyezkedése konzisztens kell legyen." },
  { id: "SZ-03", group: "Demó alapszabályok", name: "Megtakarítás-számítás képlethelyessége", source: "HEM módszertan 5.1", type: "Számítási", severity: "Kritikus", evidence: "Számítási munkalap", text: "A megtakarítás-számítás a HEM módszertan 5.1 pontja szerinti képletet kell alkalmazza." },
  { id: "SZ-04", group: "Demó alapszabályok", name: "Kivitelezés befejezésének igazolása", source: "EKR elszámolási szabály", type: "Teljességi", severity: "Magas", evidence: "Kivitelezői nyilatkozat, átadás-átvételi jkv.", text: "A kivitelezés lezárását aláírt kivitelezői nyilatkozat vagy átadás-átvételi jegyzőkönyv igazolja." },
  { id: "SZ-05", group: "Demó alapszabályok", name: "Aláírás és keltezés megléte", source: "Formai követelmény", type: "Formai", severity: "Magas", evidence: "Minden nyilatkozat", text: "Minden benyújtott nyilatkozat aláírással és keltezéssel rendelkezik." },
  { id: "SZ-06", group: "Demó alapszabályok", name: "Mértékegység-konzisztencia", source: "HEM módszertan 5.2", type: "Konzisztencia", severity: "Közepes", evidence: "Számítási munkalap, mérési adat", text: "A számításokban használt mértékegységek végig konzisztensek." },
  { id: "SZ-07", group: "Demó alapszabályok", name: "Normálévi korrekció alkalmazása", source: "HEM módszertan 5.4", type: "Számítási", severity: "Magas", evidence: "Fűtési intézkedésnél HDD-korrekció", text: "Fűtési intézkedéseknél HDD-alapú normálévi korrekciót kell alkalmazni." },
  { id: "SZ-08", group: "Demó alapszabályok", name: "Kettős elszámolás kizárása", source: "EKR szabály", type: "Konzisztencia", severity: "Kritikus", evidence: "Projektnyilvántartási kivonat", text: "A projekt megtakarítása más elszámolásban nem szerepelhet." },
  { id: "SZ-09", group: "Demó alapszabályok", name: "Műszaki paraméterek alátámasztottsága", source: "HEM módszertan 4.5", type: "Teljességi", severity: "Közepes", evidence: "Műszaki adatlap, típusbizonyítvány", text: "A hivatkozott műszaki paramétereket adatlap vagy típusbizonyítvány támasztja alá." },
  { id: "SZ-10", group: "Demó alapszabályok", name: "Mérőeszköz-kalibráció érvényessége", source: "Mérésügyi követelmény", type: "Teljességi", severity: "Közepes", evidence: "Kalibrációs bizonyítvány", text: "A méréshez használt eszköz kalibrációja a mérés időpontjában érvényes." },
  { id: "SZ-11", group: "Demó alapszabályok", name: "ESG energiaadat-egyezőség", source: "ESRS E1", type: "Konzisztencia", severity: "Közepes", evidence: "HEM-riport, ESG-adattábla", text: "Az ESG-riportban közölt energiaadatok egyeznek a HEM-riport adataival." },
  { id: "SZ-12", group: "Demó alapszabályok", name: "Dokumentumverzió-egyediség", source: "Belső szabály", type: "Formai", severity: "Közepes", evidence: "Verziónapló", text: "Minden dokumentum egyedi verzióazonosítóval rendelkezik." },

  { id: "HEM-R-BASE-001", group: "HEM ontológiamodell v0.9", name: "Baseline időszak kötelező", source: HEM_SRC, type: "Teljességi", severity: "Kritikus", evidence: "BaselineAdat: kezdő- és záródátum", text: "A baseline adatnak tartalmaznia kell kezdő- és záródátumot.", ontologyClass: "BaselineAdat", errorMessage: "Hiányzik a baseline időszak.", implementation: "SHACL minCount + datatype", testCase: "Baseline adat dátum nélkül → Fail" },
  { id: "HEM-R-BASE-002", group: "HEM ontológiamodell v0.9", name: "Baseline forrásbizonyíték kötelező", source: HEM_SRC, type: "Teljességi", severity: "Kritikus", evidence: "BaselineAdat: kapcsolódó bizonyíték", text: "Minden baseline értékhez legalább egy bizonyíték szükséges.", ontologyClass: "BaselineAdat", errorMessage: "A baseline értékhez nincs forrásdokumentum.", implementation: "SHACL minCount kapcsolodoBizonyitek", testCase: "Baseline csak kézi bevitellel → Fail" },
  { id: "HEM-R-MEAS-001", group: "HEM ontológiamodell v0.9", name: "Mérési adat mértékegység ellenőrzése", source: HEM_SRC, type: "Formai", severity: "Magas", evidence: "MeresiAdat: mértékegység", text: "A mérési adatnak valid energia-mértékegységet kell tartalmaznia (kWh, MWh, GJ, m3, tCO2e).", ontologyClass: "MeresiAdat", errorMessage: "Hiányzó vagy nem támogatott mértékegység.", implementation: "SHACL in-lista", testCase: "kWh → Pass; kw/h → Warning" },
  { id: "HEM-R-MEAS-002", group: "HEM ontológiamodell v0.9", name: "Mérési időszak koherencia", source: HEM_SRC, type: "Konzisztencia", severity: "Magas", evidence: "MeresiAdat: időszakok viszonya", text: "Utómérési időszak nem eshet teljesen a baseline időszakba.", ontologyClass: "MeresiAdat", errorMessage: "A mérési időszak ütközik a baseline időszakkal.", implementation: "SPARQL dátumintervallum-összevetés", testCase: "Azonos időszak → Warning/Fail" },
  { id: "HEM-R-SAVE-001", group: "HEM ontológiamodell v0.9", name: "Megtakarítás-számítás alátámasztottsága", source: HEM_SRC, type: "Teljességi", severity: "Kritikus", evidence: "Energiamegtakaritas: baseline + utómérés", text: "A megtakarítás csak baseline és utómérési adat alapján minősíthető.", ontologyClass: "Energiamegtakaritas", errorMessage: "Hiányzik a baseline vagy utómérési bizonyíték.", implementation: "SHACL property path minCount", testCase: "Csak eredményérték → Fail" },
  { id: "HEM-R-SAVE-002", group: "HEM ontológiamodell v0.9", name: "Negatív vagy irreális megtakarítás jelzése", source: HEM_SRC, type: "Számítási", severity: "Közepes", evidence: "Energiamegtakaritas: érték", text: "Negatív vagy szélsőséges megtakarítás külön kockázati jelzést kap.", ontologyClass: "Energiamegtakaritas", errorMessage: "A megtakarítási érték negatív vagy kiugró.", implementation: "SPARQL + küszöbérték", testCase: "−5 MWh → Warning" },
  { id: "HEM-R-CO2-001", group: "HEM ontológiamodell v0.9", name: "CO2 emissziós tényező forrása", source: HEM_SRC, type: "Teljességi", severity: "Magas", evidence: "CO2Szamitas: tényező + forrás", text: "CO2-számításhoz kötelező az emissziós tényező és forrás megadása.", ontologyClass: "CO2Szamitas", errorMessage: "Hiányzik az emissziós tényező vagy forrása.", implementation: "SHACL minCount + evidence link", testCase: "tCO2e számítás forrás nélkül → Fail" },
  { id: "HEM-R-REP-001", group: "HEM ontológiamodell v0.9", name: "HEM-riport kötelező blokkjai", source: HEM_SRC, type: "Teljességi", severity: "Kritikus", evidence: "HEMRiport: kötelező blokkok", text: "A HEM-riportnak tartalmaznia kell a minimális megfelelőségi blokkokat.", ontologyClass: "HEMRiport", errorMessage: "A HEM-riport kötelező blokkja hiányzik.", implementation: "SHACL closed shape", testCase: "Nincs intézkedésblokk → Fail" },
  { id: "HEM-R-EVID-001", group: "HEM ontológiamodell v0.9", name: "Evidence graph trace kötelező", source: HEM_SRC, type: "Konzisztencia", severity: "Kritikus", evidence: "MegfelelosegiAllitas: bizonyíték", text: "Minden megfelelőségi állításhoz visszavezethető bizonyíték kell.", ontologyClass: "MegfelelosegiAllitas", errorMessage: "Az állítás nem auditálható forrásra vezethető vissza.", implementation: "SHACL property path; PROV-O", testCase: "Claim evidence nélkül → Fail" },
  { id: "HEM-R-DOC-001", group: "HEM ontológiamodell v0.9", name: "Dokumentumverzió rögzítése", source: HEM_SRC, type: "Formai", severity: "Közepes", evidence: "Dokumentumtipus: verzió, dátum", text: "Minden dokumentumnak rendelkeznie kell verzió- és időadatokkal.", ontologyClass: "Dokumentumtipus", errorMessage: "Hiányzik a dokumentumverzió vagy dátum.", implementation: "SHACL minCount", testCase: "Verzió nélküli PDF → Warning" },
  { id: "HEM-R-RULE-001", group: "HEM ontológiamodell v0.9", name: "Szabályverzió hozzárendelése", source: HEM_SRC, type: "Konzisztencia", severity: "Magas", evidence: "ValidaciosEredmeny: szabályverzió", text: "Minden validációs eredményhez rögzíteni kell a futtatott szabályverziót.", ontologyClass: "ValidaciosEredmeny", errorMessage: "Nem állapítható meg, mely szabályverzió alapján készült az eredmény.", implementation: "SHACL minCount + provenance", testCase: "Eredmény szabályverzió nélkül → Fail" },
  { id: "HEM-R-ESG-001", group: "HEM ontológiamodell v0.9", name: "ESRS energiaadat-mezők jelölése", source: HEM_SRC, type: "Teljességi", severity: "Magas", evidence: "ESGRiport: időszak + mértékegység", text: "ESG-riport energiaadatának időszakot és mértékegységet kell tartalmaznia.", ontologyClass: "ESGRiport", errorMessage: "Hiányos ESG energiaadat.", implementation: "SHACL minCount + datatype", testCase: "Energiafogyasztás év nélkül → Fail" },
  { id: "HEM-R-GDPR-001", group: "HEM ontológiamodell v0.9", name: "Személyes adatok jelölése és kezelése", source: HEM_SRC, type: "Formai", severity: "Magas", evidence: "Dokumentumtipus: adatkezelési státusz", text: "Személyes adatot tartalmazó dokumentumot adatkezelési státusszal kell jelölni.", ontologyClass: "Dokumentumtipus", errorMessage: "Személyes adatkezelési státusz hiányzik.", implementation: "SHACL conditional shape; DPIA flag", testCase: "Személynév adatvédelmi jelölés nélkül → Warning/Fail" },
  { id: "HEM-R-AI-001", group: "HEM ontológiamodell v0.9", name: "MI-kimenet bizonyossági pontszáma", source: HEM_SRC, type: "Konzisztencia", severity: "Közepes", evidence: "MegfelelosegiAllitas: konfidencia + review", text: "Alacsony konfidencia esetén emberi review szükséges.", ontologyClass: "MegfelelosegiAllitas", errorMessage: "Alacsony bizonyosságú MI-kimenet review nélkül.", implementation: "SPARQL threshold + workflow trigger", testCase: "Confidence 0,55 review nélkül → Fail" },
  { id: "HEM-R-SEC-001", group: "HEM ontológiamodell v0.9", name: "Hozzáférés auditnaplózása", source: HEM_SRC, type: "Formai", severity: "Magas", evidence: "Dokumentumtipus: hozzáférési log", text: "Érzékeny dokumentumhoz történő hozzáférést naplózni kell.", ontologyClass: "Dokumentumtipus", errorMessage: "Nincs hozzáférési auditnapló.", implementation: "Rendszerszabály + log audit", testCase: "Szenzitív dokumentum log nélkül → Fail" },
  { id: "HEM-R-SRC-001", group: "HEM ontológiamodell v0.9", name: "Forráslink státuszellenőrzés", source: HEM_SRC, type: "Formai", severity: "Közepes", evidence: "SzabalyozasiForras: ellenőrzés dátuma", text: "Minden forrásnál rögzíteni kell az ellenőrzés dátumát.", ontologyClass: "SzabalyozasiForras", errorMessage: "Hiányzik a forrás ellenőrzési dátuma.", implementation: "SHACL minCount", testCase: "Forrás dátum nélkül → Warning" },
  { id: "HEM-R-LINK-001", group: "HEM ontológiamodell v0.9", name: "Hivatkozási lánc teljessége", source: HEM_SRC, type: "Konzisztencia", severity: "Magas", evidence: "Kotelezettseg: dokumentum + szabály", text: "Kötelezettségnek legalább egy dokumentumtípushoz és szabályhoz kell kapcsolódnia.", ontologyClass: "Kotelezettseg", errorMessage: "A kötelezettség nincs operacionalizálva.", implementation: "SPARQL ASK completeness query", testCase: "Forrás van, szabály nincs → Fail" },
  { id: "HEM-R-COMP-001", group: "HEM ontológiamodell v0.9", name: "Compliance score számíthatósága", source: HEM_SRC, type: "Számítási", severity: "Közepes", evidence: "HEMRiport: súlyozott validációs eredmények", text: "A score csak súlyozott validációs eredményekből generálható.", ontologyClass: "HEMRiport", errorMessage: "Hiányos score-számítási alap.", implementation: "Drools/SPARQL aggregáció", testCase: "Score kézzel megadva → Warning" },
];

export const ruleOutcomes: RuleOutcome[] = [
  // P-001 – Bizonytalan
  { projectId: "P-001", ruleId: "HEM-R-BASE-001", status: "Pass" },
  { projectId: "P-001", ruleId: "HEM-R-EVID-001", status: "Pass" },
  { projectId: "P-001", ruleId: "HEM-R-MEAS-001", status: "Warning", note: "„kw/h” formátumú mértékegység a SCADA_export_2025.csv 214. sorában." },
  // P-002 – Nem megfelelt
  { projectId: "P-002", ruleId: "HEM-R-BASE-001", status: "Fail", note: "Baseline időszak dátuma hiányzik." },
  { projectId: "P-002", ruleId: "HEM-R-BASE-002", status: "Fail", note: "A baseline értékhez nincs forrásdokumentum." },
  { projectId: "P-002", ruleId: "HEM-R-SAVE-001", status: "Fail", note: "Hiányzik a baseline vagy utómérési bizonyíték." },
  // P-003 – Megfelelt
  { projectId: "P-003", ruleId: "HEM-R-BASE-001", status: "Pass" },
  { projectId: "P-003", ruleId: "HEM-R-MEAS-002", status: "Pass" },
  { projectId: "P-003", ruleId: "HEM-R-EVID-001", status: "Pass" },
  { projectId: "P-003", ruleId: "HEM-R-SAVE-001", status: "Pass" },
  { projectId: "P-003", ruleId: "HEM-R-DOC-001", status: "Warning", note: "A számítási munkalap verziójelölése hiányzik." },
];


export interface Claim {
  id: string;
  projectId: string;
  text: string;
  ruleId: string;
  evidenceDocIds: string[];
  status: ComplianceStatus;
  confidence: number;
  explanation: string;
}

export const claims: Claim[] = [
  { id: "C-101", projectId: "P-001", text: "A bázisfogyasztás 184 320 kWh/év", ruleId: "SZ-01", evidenceDocIds: ["D-02", "D-03"], status: "Megfelelt", confidence: 92, explanation: "A rendszer az állítást a MJ-2025-11.pdf 12. oldalán található mérési összesítő alapján, az SZ-01 szabály szerint minősítette megfeleltnek." },
  { id: "C-102", projectId: "P-001", text: "A megtakarítás 41 200 kWh/év", ruleId: "SZ-03", evidenceDocIds: ["D-01"], status: "Bizonytalan", confidence: 68, explanation: "A számítási munkalap részben hiányos, a normálévi korrekció alkalmazása nem egyértelmű." },
  { id: "C-103", projectId: "P-001", text: "A kivitelezés 2026.03.15-én befejeződött", ruleId: "SZ-04", evidenceDocIds: ["D-04"], status: "Bizonytalan", confidence: 55, explanation: "A kivitelezői nyilatkozat aláírás nélkül került benyújtásra (SZ-05)." },
  { id: "C-201", projectId: "P-002", text: "A bázisfogyasztás 312 500 kWh/év", ruleId: "SZ-01", evidenceDocIds: ["D-07"], status: "Nem megfelelt", confidence: 40, explanation: "Nem áll rendelkezésre bázisidőszaki mérési jegyzőkönyv, csak részleges számlaadatok." },
  { id: "C-202", projectId: "P-002", text: "A kazáncsere 2026.05.02-án megtörtént", ruleId: "SZ-04", evidenceDocIds: ["D-08"], status: "Nem megfelelt", confidence: 48, explanation: "A kivitelezői nyilatkozat aláírás nélküli, SZ-05 nem teljesül." },
  { id: "C-203", projectId: "P-002", text: "A számla és mérési napló időszaka egyezik", ruleId: "SZ-02", evidenceDocIds: ["D-07"], status: "Nem megfelelt", confidence: 52, explanation: "A számla és mérési napló időszakai között 2 hónapos eltérés van." },
  { id: "C-301", projectId: "P-003", text: "A bázisfogyasztás 96 400 kWh/év", ruleId: "SZ-01", evidenceDocIds: ["D-11"], status: "Megfelelt", confidence: 94, explanation: "A mérési jegyzőkönyv teljes 12 hónapot lefed, kalibráció érvényes." },
  { id: "C-302", projectId: "P-003", text: "A megtakarítás 38 700 kWh/év", ruleId: "SZ-03", evidenceDocIds: ["D-12"], status: "Megfelelt", confidence: 91, explanation: "A számítási munkalap képletei ellenőrzöttek és a mértékegységek konzisztensek." },
  { id: "C-303", projectId: "P-003", text: "A hőszivattyú COP értéke 4,2", ruleId: "SZ-09", evidenceDocIds: ["D-10"], status: "Megfelelt", confidence: 89, explanation: "A műszaki paramétert a típusbizonyítvány igazolja." },
];

export interface Gap {
  projectId: string;
  ruleId: string;
  severity: Severity;
  text: string;
}

export const gaps: Gap[] = [
  { projectId: "P-002", ruleId: "SZ-01", severity: "Kritikus", text: "Hiányzik a bázisidőszaki mérési jegyzőkönyv" },
  { projectId: "P-002", ruleId: "SZ-05", severity: "Magas", text: "A kivitelezői nyilatkozat aláírás nélküli" },
  { projectId: "P-002", ruleId: "SZ-02", severity: "Kritikus", text: "Időszak-eltérés a számla és a mérési napló között" },
  { projectId: "P-001", ruleId: "SZ-05", severity: "Magas", text: "Aláírás nélküli kivitelezői nyilatkozat" },
  { projectId: "P-001", ruleId: "SZ-07", severity: "Magas", text: "HDD-korrekció alkalmazása nem dokumentált" },
  { projectId: "P-001", ruleId: "SZ-10", severity: "Közepes", text: "Mérőeszköz kalibrációs bizonyítvány hiányzik" },
  { projectId: "P-003", ruleId: "SZ-12", severity: "Közepes", text: "Egy dokumentum verziószáma nem egyedi" },
  { projectId: "P-001", ruleId: "HEM-R-MEAS-001", severity: "Magas", text: "Nem szabványos mértékegység a SCADA-exportban, normalizálás szükséges" },
  { projectId: "P-002", ruleId: "HEM-R-BASE-002", severity: "Kritikus", text: "A baseline értékhez nincs forrásdokumentum" },
];

export const outcomeColor = (s: OutcomeStatus): string => {
  if (s === "Pass") return "stamp stamp-ok";
  if (s === "Warning") return "stamp stamp-warn";
  return "stamp stamp-fail";
};

export const groupBadgeColor = (g: RuleGroup): string => {
  if (g === "HEM ontológiamodell v0.9") return "stamp stamp-accent";
  return "stamp stamp-neutral";
};


export interface AuditEntry {
  time: string;
  user: string;
  action: string;
  object: string;
  details: string;
}

export const auditLog: AuditEntry[] = [
  { time: "2026.07.01. 14:22", user: "Kovács Anna", action: "Dokumentum feltöltés", object: "MJ-hoszivattyu-2026.pdf", details: "Projekt: P-003" },
  { time: "2026.07.01. 14:25", user: "Rendszer", action: "Adatkinyerés", object: "MJ-hoszivattyu-2026.pdf", details: "14 mező, átlagos konfidencia: 91%" },
  { time: "2026.07.01. 14:31", user: "Kovács Anna", action: "Mező jóváhagyása", object: "Bázisfogyasztás", details: "Érték: 96 400 kWh/év" },
  { time: "2026.07.01. 15:02", user: "Rendszer", action: "Szabálykiértékelés", object: "P-003", details: "12 szabály értékelve, összpontszám: 93%" },
  { time: "2026.07.01. 15:15", user: "Kovács Anna", action: "Riport generálása", object: "R-003", details: "PDF előnézet" },
  { time: "2026.06.30. 09:11", user: "Nagy Péter", action: "Dokumentum feltöltés", object: "Kivitelezoi_nyilatkozat_kazan.docx", details: "Projekt: P-002" },
  { time: "2026.06.30. 09:14", user: "Rendszer", action: "Hiányosság észlelve", object: "SZ-05", details: "Aláírás hiányzik" },
  { time: "2026.06.30. 11:40", user: "Rendszer", action: "Szabálykiértékelés", object: "P-002", details: "3 kritikus hiba, összpontszám: 54%" },
  { time: "2026.06.29. 16:20", user: "Kovács Anna", action: "Felelős hozzárendelése", object: "P-002 / SZ-01", details: "Felelős: Nagy Péter" },
  { time: "2026.06.28. 10:05", user: "Nagy Péter", action: "Dokumentum feltöltés", object: "SCADA_export_2025.csv", details: "Projekt: P-001" },
  { time: "2026.06.28. 10:12", user: "Rendszer", action: "Osztályozás", object: "SCADA_export_2025.csv", details: "Típus: SCADA-napló" },
  { time: "2026.06.28. 13:44", user: "Kovács Anna", action: "Mező javítása", object: "Kivitelező neve", details: "LumenTech → LumenTech Kft." },
  { time: "2026.06.28. 14:00", user: "Rendszer", action: "Szabálykiértékelés", object: "P-001", details: "Összpontszám: 71%" },
  { time: "2026.06.27. 08:50", user: "Kovács Anna", action: "Bejelentkezés", object: "-", details: "IP: 10.0.0.14" },
  { time: "2026.06.26. 17:30", user: "Rendszer", action: "Riport generálása", object: "R-001", details: "Automatikus heti riport" },
];

export interface Report {
  id: string;
  projectId: string;
  title: string;
  createdAt: string;
}

export const reports: Report[] = [
  { id: "R-001", projectId: "P-001", title: "Előminősítési riport – Világításkorszerűsítés", createdAt: "2026.06.28." },
  { id: "R-002", projectId: "P-002", title: "Előminősítési riport – Kazáncsere", createdAt: "2026.06.30." },
  { id: "R-003", projectId: "P-003", title: "Előminősítési riport – Hőszivattyús HMV", createdAt: "2026.07.01." },
];

export const statusColor = (s: ComplianceStatus): string => {
  if (s === "Megfelelt") return "stamp stamp-ok";
  if (s === "Bizonytalan") return "stamp stamp-warn";
  return "stamp stamp-fail";
};

export const severityColor = (s: Severity): string => {
  if (s === "Kritikus") return "stamp stamp-fail";
  if (s === "Magas") return "stamp stamp-warn";
  return "stamp stamp-neutral";
};

export const confidenceColor = (c: number): string => {
  if (c >= 85) return "text-[color:var(--ok)]";
  if (c >= 65) return "text-[color:var(--warn)]";
  return "text-[color:var(--fail)]";
};

