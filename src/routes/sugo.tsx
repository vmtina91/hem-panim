import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/hem/AppShell";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  LayoutDashboard,
  FolderKanban,
  FileText,
  BookOpen,
  ShieldCheck,
  FileBarChart,
  History,
  Gauge,
  ClipboardCheck,
} from "lucide-react";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/sugo")({
  head: () => ({
    meta: [
      { title: "Súgó – HEM PANIM" },
      { name: "description", content: "Használati útmutató és gyakran ismételt kérdések a HEM PANIM rendszerhez." },
    ],
  }),
  component: SugoPage,
});

type Guide = { icon: typeof LayoutDashboard; title: string; steps: string[] };

const guidesByLang: Record<"hu" | "en", Guide[]> = {
  hu: [
    {
      icon: LayoutDashboard,
      title: "Irányítópult",
      steps: [
        "A felső kártyák az összesített mutatókat mutatják: projektek száma, feltöltött dokumentumok száma, függő kockázati jelzések és az átlagos megfelelési pontszám.",
        "A „Kockázati jelzések” panel a projektek hiánylistájából származó tételeket sorolja fel (pl. SZ-05, SZ-07, SZ-10). Kattintson egy tételre, hogy a részletekhez ugorjon.",
        "A színek jelentése: zöld = Megfelelt, sárga = Bizonytalan, piros = Nem megfelelt.",
      ],
    },
    {
      icon: FolderKanban,
      title: "Projektek",
      steps: [
        "A bal oldali menüben kattintson a „Projektek” pontra a lista megnyitásához.",
        "Kattintson egy projekt sorára, ekkor megnyílik a projekt részletező oldala az összes mérésadattal, dokumentumkapcsolattal és hiánylistával.",
        "A projekt fejlécében látható a jelenlegi státusz és az utolsó előminősítés dátuma.",
      ],
    },
    {
      icon: FileText,
      title: "Dokumentumok",
      steps: [
        "Kattintson a feltöltő mezőre, és válassza ki a fájlokat a számítógépéről (PDF, DOCX, XLSX vagy CSV — egyszerre több fájl is választható).",
        "A rendszer a fájlnév és a kiterjesztés alapján automatikusan bekategorizálja a dokumentumot. Példák: „Aramszamla_2026_Q1.pdf” → Számla, „MJ-2026-01.pdf” vagy „Meresi_jegyzokonyv.pdf” → Mérési jegyzőkönyv, „Energetikai_audit_Gyor.pdf” → Energetikai audit, „SCADA_export.csv” → SCADA-napló, „Kivitelezoi_nyilatkozat_LED.docx” → Kivitelezői nyilatkozat, „Szerzodes_kazan.pdf” → Szerződés, „Szamitasi_munkalap_HMV.xlsx” → Számítási munkalap. A felismerés ékezet- és kis/nagybetű-független.",
        "Feltöltés előtt egy megerősítő ablak jelenik meg: itt látható a javasolt típus a felismerés konfidenciájával (pl. „Automatikus besorolás · 96%”), kiválasztható a projekt, és a besorolás legördülőből bármikor felülbírálható. Ha a fájlnévből nem ismerhető fel a típus, sárga „Bizonytalan – kérjük, ellenőrizze” jelzés figyelmeztet a kézi ellenőrzésre.",
        "A dokumentum sorára kattintva megnyílik a kétpaneles jóváhagyó nézet: bal oldalt a dokumentum előnézete, jobb oldalt a kinyert mezők listája.",
        "Kattintson egy mezőre — a rendszer a bal oldali előnézetben odagörget és sárgán kiemeli a forrás mondatot vagy táblázatot.",
        "Egyesével a „Jóváhagyás” gombbal, vagy a „Minden mező jóváhagyása” gombbal fogadhatja el a kinyert értékeket. Ekkor a dokumentum státusza „Jóváhagyva” zöldre vált és bejegyzés kerül az Auditnaplóba.",
      ],
    },
    {
      icon: Gauge,
      title: "Mérési adatok",
      steps: [
        "Az oldal projektenként három füllel jelenít meg mérési adatokat: „Baseline adatok”, „Utómérési adatok” és „Megtakarítás-számítás”.",
        "Minden sor tartalmazza az időszak kezdetét és végét, a fogyasztás értékét mértékegységgel (kWh vagy MWh), a forrásdokumentum linkjét és a bizonyíték-státuszt (Igazolt / Bizonytalan / Hiányzik).",
        "A „Megtakarítás-számítás” fül a baseline és utómérési érték különbségeként számol, feltüntetve az alkalmazott módszert és a vonatkozó szabályokat (pl. HEM-R-SAVE-001).",
        "Ha a forrásdokumentum hiányzik vagy a mértékegység nem szabványos, az adott sor „Bizonytalan” vagy „Hiányzik” státuszt kap és bekerül a hiánylistába.",
      ],
    },
    {
      icon: ClipboardCheck,
      title: "Felülvizsgálati sor",
      steps: [
        "Ide kerülnek automatikusan az alacsony konfidenciájú (<75%) AI-kinyerések, a bizonytalan állítások és a manuális beavatkozást igénylő szabályeredmények.",
        "Minden tétel három művelettel kezelhető: „Jóváhagyás”, „Elutasítás” (kötelező indoklással) és „Javítás” (kézi érték megadása).",
        "A sidebar menüben a „Felülvizsgálat” pont mellett jelvény mutatja a nyitott tételek számát — a szám valós időben frissül.",
        "Minden állapotátmenet (jóváhagyás, elutasítás, javítás) automatikusan naplózódik az Auditnaplóban.",
      ],
    },
    {
      icon: BookOpen,
      title: "Szabálykatalógus",
      steps: [
        "A szabályok azonosítója SZ-01 … SZ-12. Minden szabálynak van típusa és súlyossága.",
        "Típusok: Teljességi (kell-e lennie adott adatnak), Konzisztencia (két forrás összhangban van-e), Számítási (a számítás helyes-e), Formai (megfelel-e a formai követelménynek).",
        "Súlyosságok: Kritikus (jóváhagyást gátolja), Magas (érdemi hiba), Közepes (figyelmeztető jelzés).",
      ],
    },
    {
      icon: ShieldCheck,
      title: "Előminősítés",
      steps: [
        "Válassza ki a projektet a legördülőből, majd kattintson az „Előminősítés futtatása” gombra. A rendszer a szabálykatalógus alapján kiértékeli a projekt dokumentumait.",
        "Az eredménypanel megmutatja az összesített pontszámot és a státuszt (Megfelelt / Bizonytalan / Nem megfelelt).",
        "A hiánylistában minden tétel egy megsértett szabályt jelöl. Kattintson a tételre a bizonyítéklánc megtekintéséhez: Állítás → Bizonyíték (dokumentum + oldal + kivonat) → Szabály (SZ-azonosító + verzió).",
        "Minden hiánylista-tétel életciklust követ: „Nyitott” → „Folyamatban” → „Pótlásra vár” → „Pótolva”. A státuszváltásokat az Auditnapló rögzíti; a lezárt tételek külön, becsukható szekcióba kerülnek.",
        "Az eredmény tartalmazza az alkalmazott szabálykatalógus verzióját és az érintett szabályok egyedi verzióit (pl. SZ-07 v1.1) — ez teszi reprodukálhatóvá az értékelést.",
      ],
    },
    {
      icon: FileBarChart,
      title: "Riportok",
      steps: [
        "Válassza ki a projektet és a riport típusát, majd kattintson a „Riport készítése” gombra az előnézet megjelenítéséhez.",
        "Az előnézet két mellékletet is tartalmaz: „A. melléklet – Bizonyítéklánc-jegyzék” (állítás, bizonyíték, forrás, szabály + verzió, státusz) és „B. melléklet – Alkalmazott szabálykatalógus” (a kiértékelt szabályok verzióval és eredménnyel).",
        "A lábléc rögzíti: „A riport a megjelölt szabályverziókkal reprodukálható. TRL 3 demonstrációs prototípus.”",
        "A riportok kizárólag a Megfelelésfelelős és az Auditor szerepkör számára készíthetők.",
      ],
    },
    {
      icon: History,
      title: "Auditnapló",
      steps: [
        "Az auditnapló időrendben mutatja az összes rendszereseményt: bejelentkezések, dokumentum-jóváhagyások, előminősítés-futtatások, riport-letöltések.",
        "Minden bejegyzés tartalmazza az időbélyeget, a felhasználót és a művelet leírását.",
        "A napló csak olvasható; bejegyzést törölni nem lehet — ez a nyomonkövethetőség alapja.",
      ],
    },
  ],
  en: [
    {
      icon: LayoutDashboard,
      title: "Dashboard",
      steps: [
        "The top cards show aggregate metrics: number of projects, uploaded documents, open risk signals and the average compliance score.",
        "The Risk signals panel lists items from the project gap lists (e.g. SZ-05, SZ-07, SZ-10). Click an item to jump to the details.",
        "Colour coding: green = Compliant, yellow = Uncertain, red = Non-compliant.",
      ],
    },
    {
      icon: FolderKanban,
      title: "Projects",
      steps: [
        "Click Projects in the left menu to open the list.",
        "Click a project row to open its detail page with measurements, document links and gap list.",
        "The project header shows current status and last pre-qualification date.",
      ],
    },
    {
      icon: FileText,
      title: "Documents",
      steps: [
        "Click the upload area and pick files from your computer (PDF, DOCX, XLSX or CSV — multiple files at once are supported).",
        "The system automatically classifies each document from its file name and extension. Examples: “Aramszamla_2026_Q1.pdf” → Invoice, “MJ-2026-01.pdf” → Measurement log, “Energetikai_audit_Gyor.pdf” → Energy audit, “SCADA_export.csv” → SCADA log, “Szerzodes_kazan.pdf” → Contract. Matching is accent- and case-insensitive.",
        "Before uploading, a confirmation dialog shows the suggested type with its confidence (e.g. “Auto-classified · 96%”); you can pick the project and override any classification from a dropdown. If the type cannot be recognised from the file name, a yellow “Uncertain – please review” badge asks for manual verification.",
        "Click a document row to open the two-pane approval view: preview on the left, extracted fields on the right.",
        "Click a field — the preview scrolls to and highlights the source sentence or table in yellow.",
        "Approve values one by one, or use Approve all fields. Once fully approved, the document turns Approved and an entry is added to the audit log.",
      ],
    },
    {
      icon: Gauge,
      title: "Measurement data",
      steps: [
        "Per project, three tabs show measurement data: Baseline, Post-measurement and Savings calculation.",
        "Each row lists period start/end, consumption value with unit (kWh or MWh), source document link and evidence status (Verified / Uncertain / Missing).",
        "The Savings tab computes baseline minus post-measurement, with the applied method and referenced rules (e.g. HEM-R-SAVE-001).",
        "If the source document is missing or the unit is non-standard, the row is flagged Uncertain or Missing and added to the gap list.",
      ],
    },
    {
      icon: ClipboardCheck,
      title: "Review queue",
      steps: [
        "Automatically collects low-confidence (<75%) AI extractions, uncertain claims and rule results requiring manual attention.",
        "Each item has three actions: Approve, Reject (with mandatory reason) and Correct (enter a manual value).",
        "The sidebar Review item shows a live badge with the number of open items.",
        "Every state transition (approval, rejection, correction) is automatically logged in the audit log.",
      ],
    },
    {
      icon: BookOpen,
      title: "Rule catalogue",
      steps: [
        "Rule IDs are SZ-01 … SZ-12. Every rule has a type and severity.",
        "Types: Completeness (is required data present), Consistency (are two sources aligned), Calculation (is the maths correct), Formal (is a formal requirement met).",
        "Severities: Critical (blocks approval), High (substantive error), Medium (warning).",
      ],
    },
    {
      icon: ShieldCheck,
      title: "Pre-qualification",
      steps: [
        "Pick a project in the dropdown and click Run pre-qualification. The system evaluates the project's documents against the rule catalogue.",
        "The results panel shows the overall score and status (Compliant / Uncertain / Non-compliant).",
        "Each gap represents a violated rule. Click it to view the evidence chain: Claim → Evidence (document + page + excerpt) → Rule (SZ-ID + version).",
        "Every gap follows a lifecycle: Open → In progress → Awaiting supplement → Supplemented. State transitions are logged in the audit log; closed items move to a separate collapsible section.",
        "The result records the applied rule catalogue version and the specific rule versions used (e.g. SZ-07 v1.1) — this is what makes the assessment reproducible.",
      ],
    },
    {
      icon: FileBarChart,
      title: "Reports",
      steps: [
        "Pick a project and report type, then click Generate to open the preview.",
        "The preview includes two appendices: Appendix A – Evidence chain register (claim, evidence, source, rule + version, status) and Appendix B – Applied rule catalogue (evaluated rules with version and result).",
        "The footer reads: “The report is reproducible with the referenced rule versions. TRL 3 demonstration prototype.”",
        "Reports can only be generated by the Compliance officer and Auditor roles.",
      ],
    },
    {
      icon: History,
      title: "Audit log",
      steps: [
        "The audit log lists every system event in chronological order: sign-ins, document approvals, pre-qualification runs, report downloads.",
        "Each entry contains the timestamp, user and action description.",
        "The log is read-only; entries cannot be deleted — this is the basis of traceability.",
      ],
    },
  ],
};

const faqsByLang: Record<"hu" | "en", { q: string; a: string }[]> = {
  hu: [
    { q: "Hogyan kategorizálja a rendszer a feltöltött fájlokat?", a: "A besorolás két lépcsős. Először a rendszer a fájlnévben kulcsszavakat keres (ékezet- és kis/nagybetű-függetlenül): a „szamla”, „aramszamla”, „gazszamla” szavak a Számla típusra, a „jegyzokonyv”, „MJ-”, „meres” a Mérési jegyzőkönyvre, az „audit” az Energetikai auditra, a „scada” és „naplo” a SCADA-naplóra, a „nyilatkozat” a Kivitelezői nyilatkozatra, a „szerzodes” a Szerződésre, a „szamitas” és „munkalap” a Számítási munkalapra utal. Másodszor a kiterjesztés is számít: a CSV-fájl SCADA-naplóra, az XLSX számítási munkalapra utal. Példa: a „SCADA_export_2026.csv” két jelzés alapján 91%-os konfidenciával SCADA-naplóként kerül besorolásra. A javasolt típus a feltöltés előtti megerősítő ablakban mindig felülbírálható — az éles rendszerben ezt a lépcsőt a dokumentum tartalmát elemző MI-modul egészíti majd ki." },
    { q: "Mit tegyek, ha a rendszer rossz típusba sorolta a fájlt?", a: "A feltöltés előtti megerősítő ablakban a típus legördülőből átállítható — a kézi választás mindig felülírja az automatikus besorolást. Ha a fájlnévből nem ismerhető fel a típus (pl. „dokumentum1.pdf”), a rendszer alacsony konfidenciájú, „Bizonytalan” jelzésű javaslatot ad, és kifejezetten kéri az ellenőrzést. Tipp: beszédes fájlnevekkel (pl. „Aramszamla_2026_Q1.pdf”) a felismerés szinte mindig pontos." },
    { q: "Mit jelent a konfidencia érték?", a: "A konfidencia egy 0 és 100% közötti szám, amely azt fejezi ki, hogy a rendszer mennyire biztos a kinyert értékben. 90% felett magas, 70–90% között közepes, alatta alacsony a megbízhatóság — az utóbbi esetekben az emberi ellenőrzés különösen indokolt." },
    { q: "Mit jelent a „Bizonytalan” státusz?", a: "A „Bizonytalan” azt jelenti, hogy a rendszer talált olyan tételt, amely nem egyértelműen felel meg vagy nem felel meg — jellemzően hiányzó adat, alacsony konfidencia, vagy két forrás közötti eltérés miatt. Az ilyen projekt emberi felülvizsgálatot igényel." },
    { q: "Miért kell emberi jóváhagyás?", a: "A rendszer döntéstámogató eszköz, nem helyettesíti a szakértőt. Minden kinyert mezőt és minden előminősítési eredményt egy felelős felhasználónak jóvá kell hagynia, mielőtt hivatalos felhasználásra kerülhet." },
    { q: "Honnan tudja a rendszer, melyik dokumentum melyik oldalából származik az adat?", a: "A dokumentumfeldolgozás során minden kinyert mezőhöz elmentjük a forrás dokumentum azonosítóját, az oldalszámot és a szövegkivonat helyét. Ezt látja a kétpaneles jóváhagyó nézet bal oldalán sárga kiemeléssel." },
    { q: "Mi az evidenciagráf?", a: "Az evidenciagráf (bizonyítéklánc) az Állítás → Bizonyíték → Szabály hármas kapcsolatot rögzíti. Minden megfelelési állításhoz hozzárendeli a támogató bizonyítékokat és az érintett szabályt." },
    { q: "Mi a különbség a szerepkörök között?", a: "Megfelelésfelelős: teljes hozzáférés. Energetikai tanácsadó: feltölthet és jóváhagyhat, de riportot nem készíthet. Auditor: csak olvasási jog." },
    { q: "Hogyan kerül egy szabály a katalógusba?", a: "A szabálykatalógust a Megfelelésfelelősök karbantartják, jogszabályi és pályázati útmutatók alapján. Új szabály felvétele verzionált folyamat: minden változás időbélyeggel és felelőssel kerül az auditnaplóba." },
    { q: "Mit tegyek, ha hibás a kinyert érték?", a: "A kétpaneles jóváhagyó nézetben ne fogadja el a hibás mezőt. Egy éles rendszerben a mezőt kézzel javítani, majd külön jóváhagyni lehet." },
    { q: "Ki férhet hozzá az auditnaplóhoz?", a: "Az auditnaplót minden bejelentkezett felhasználó megtekintheti, de senki nem tudja szerkeszteni vagy törölni." },
    { q: "Mi kerül a Mérési adatok modulba?", a: "Projektenként három adatcsoport: Baseline, Utómérés és Megtakarítás-számítás. Minden sor tartalmazza az időszakot, a fogyasztás értékét mértékegységgel (kWh vagy MWh), a forrásdokumentumot és a bizonyíték-státuszt (Igazolt / Bizonytalan / Hiányzik). A megtakarítás a baseline és utómérés különbségeként áll elő, a felhasznált szabályok (pl. HEM-R-SAVE-001) megjelölésével." },
    { q: "Mikor kerül egy tétel a Felülvizsgálati sorba?", a: "Automatikusan bekerül minden 75% alatti konfidenciájú AI-kinyerés, minden „Bizonytalan” állítás és minden olyan szabályeredmény, amely emberi döntést igényel. A tételek Jóváhagyás / Elutasítás (kötelező indoklással) / Javítás művelettel zárhatók, és minden átmenet naplózódik." },
    { q: "Mit jelent a szabályverzió (pl. SZ-07 v1.1)?", a: "Minden szabálynak van aktuális verziója és verziótörténete. Az előminősítés és a riport rögzíti, hogy melyik szabálykatalógus-verzióval és melyik egyedi szabályverziókkal futott — így az értékelés később is pontosan reprodukálható." },
    { q: "Hogyan működik a hiánypótlás életciklusa?", a: "Minden hiánylista-tétel négy állapoton mehet keresztül: Nyitott → Folyamatban → Pótlásra vár → Pótolva. Az irányítópult KPI-jei csak a „Nyitott” tételeket számolják; a lezárt tételek külön becsukható szekcióba kerülnek, de az Auditnaplóban minden állapotátmenet megmarad." },
    { q: "Mit tartalmaznak a riport mellékletei?", a: "„A. melléklet – Bizonyítéklánc-jegyzék”: minden állításhoz a bizonyíték, a forrásdokumentum + hely, a vonatkozó szabály + verzió és a státusz. „B. melléklet – Alkalmazott szabálykatalógus”: a kiértékelt szabályok verzióval és eredménnyel. A lábléc rögzíti a reprodukálhatóságot és a TRL 3 prototípus státuszt." },
  ],
  en: [
    { q: "How does the system classify uploaded files?", a: "Classification is two-tiered. First, the system looks for keywords in the file name (accent- and case-insensitive): “szamla” suggests Invoice, “jegyzokonyv” or “MJ-” a Measurement log, “audit” an Energy audit, “scada” a SCADA log, “nyilatkozat” a Contractor declaration, “szerzodes” a Contract, “szamitas” or “munkalap” a Calculation worksheet. Second, the extension matters: CSV hints at SCADA logs, XLSX at calculation worksheets. Example: “SCADA_export_2026.csv” is classified as a SCADA log at 91% confidence based on both signals. The suggested type can always be overridden in the confirmation dialog — in the production system this tier will be complemented by an AI module that analyses document content." },
    { q: "What if the system classified a file incorrectly?", a: "In the pre-upload confirmation dialog the type can be changed from a dropdown — manual choice always overrides the automatic classification. If the type cannot be recognised from the file name (e.g. “document1.pdf”), the system offers a low-confidence suggestion flagged “Uncertain” and explicitly asks for review. Tip: descriptive file names (e.g. “Aramszamla_2026_Q1.pdf”) make recognition nearly always accurate." },
    { q: "What does the confidence value mean?", a: "Confidence is a 0–100% number reflecting how sure the system is about the extracted value. Above 90% is high, 70–90% medium, below is low — the last case especially benefits from human review." },
    { q: "What does the 'Uncertain' status mean?", a: "Uncertain means the system found items that are neither clearly compliant nor non-compliant — typically due to missing data, low confidence or a discrepancy between two sources. Such projects require human review." },
    { q: "Why is human approval required?", a: "The system is a decision-support tool, not a replacement for the expert. Every extracted field and every pre-qualification result must be approved by a responsible user before official use." },
    { q: "How does the system know which page a value came from?", a: "During document processing we store the source document ID, page number and text-excerpt location for every extracted field. You see this as a yellow highlight in the two-pane approval view." },
    { q: "What is the evidence graph?", a: "The evidence graph (evidence chain) links Claim → Evidence → Rule. Every compliance claim is linked to supporting evidence (document excerpts) and the applicable rule from the catalogue." },
    { q: "What is the difference between roles?", a: "Compliance officer: full access. Energy consultant: can upload and approve but not generate reports. Auditor: read-only for verification purposes." },
    { q: "How is a rule added to the catalogue?", a: "The rule catalogue is maintained by Compliance officers based on legal and grant guidelines. Adding a new rule is a versioned process: every change is logged with a timestamp and responsible user." },
    { q: "What should I do if an extracted value is wrong?", a: "Do not approve the incorrect field. In a production system you can edit the value manually and approve it separately." },
    { q: "Who can access the audit log?", a: "Every signed-in user can view the audit log, but no one can edit or delete it." },
    { q: "What goes into the Measurement data module?", a: "Three data sets per project: Baseline, Post-measurement and Savings calculation. Each row records the period, consumption value with unit (kWh or MWh), source document and evidence status (Verified / Uncertain / Missing). Savings are computed as baseline minus post-measurement, with the applied rules (e.g. HEM-R-SAVE-001) noted." },
    { q: "When does an item enter the Review queue?", a: "Automatically for any AI extraction below 75% confidence, every Uncertain claim and every rule result that needs human judgement. Items are closed with Approve / Reject (mandatory reason) / Correct, and every transition is logged." },
    { q: "What does a rule version (e.g. SZ-07 v1.1) mean?", a: "Every rule has a current version and a version history. Pre-qualification runs and reports record both the rule catalogue version and the specific rule versions used — so the assessment can be reproduced later on exactly." },
    { q: "How does the gap lifecycle work?", a: "Every gap moves through four states: Open → In progress → Awaiting supplement → Supplemented. Dashboard KPIs count only Open items; closed items go to a separate collapsible section, and all state transitions remain in the audit log." },
    { q: "What do the report appendices contain?", a: "Appendix A – Evidence chain register: for every claim the evidence, source document + location, applicable rule + version and status. Appendix B – Applied rule catalogue: evaluated rules with version and result. The footer states reproducibility and the TRL 3 prototype status." },
  ],
};

function SugoPage() {
  const { t, lang } = useI18n();
  const guides = guidesByLang[lang];
  const faqs = faqsByLang[lang];
  return (
    <AppShell title={t("help.title")}>
      <div className="max-w-5xl">
        <Tabs defaultValue="guide" className="w-full">
          <TabsList>
            <TabsTrigger value="guide">{t("help.tab.guide")}</TabsTrigger>
            <TabsTrigger value="faq">{t("help.tab.faq")}</TabsTrigger>
          </TabsList>

          <TabsContent value="guide" className="mt-6 space-y-4">
            {guides.map((g) => {
              const Icon = g.icon;
              return (
                <div key={g.title} className="paper-card p-5">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-9 h-9 rounded bg-[color:var(--ink)]/10 text-[color:var(--ink)] grid place-items-center">
                      <Icon className="w-5 h-5" />
                    </div>
                    <h2 className="text-base font-semibold text-[color:var(--ink)]">{g.title}</h2>
                  </div>
                  <ol className="space-y-2 pl-1">
                    {g.steps.map((s, i) => (
                      <li key={i} className="flex gap-3 text-sm text-[color:var(--ink)]">
                        <span className="shrink-0 w-6 h-6 rounded-full bg-[color:var(--paper-2)] text-[color:var(--ink-2)] text-xs font-medium grid place-items-center">
                          {i + 1}
                        </span>
                        <span className="pt-0.5">{s}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              );
            })}
          </TabsContent>

          <TabsContent value="faq" className="mt-6">
            <div className="paper-card p-2">
              <Accordion type="single" collapsible className="w-full">
                {faqs.map((f, i) => (
                  <AccordionItem key={i} value={`item-${i}`}>
                    <AccordionTrigger className="text-left text-sm font-medium px-3">{f.q}</AccordionTrigger>
                    <AccordionContent className="text-sm text-[color:var(--ink)] px-3">{f.a}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AppShell>
  );
}
