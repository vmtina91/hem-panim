import type { DocType } from "@/lib/hem-data";

/**
 * Fájlnév- és kiterjesztés-alapú automatikus dokumentumtípus-besorolás.
 *
 * A TRL 3 demonstrátorban a besorolás a fájlnévben található kulcsszavak
 * alapján történik (ékezet- és kis/nagybetű-független). Az éles rendszerben
 * ezt a dokumentum tartalmát elemző MI-modul váltja majd ki — a felület és
 * az adatmodell erre már fel van készítve (típus + konfidencia + manuális
 * felülbírálás).
 */

export type DocFormat = "PDF" | "DOCX" | "XLSX" | "CSV";

export interface ClassificationResult {
  type: DocType;
  confidence: number; // 0–100
  matchedKeyword: string | null;
}

// Ékezetek eltávolítása + kisbetűsítés, hogy a "Számla" és a "szamla" is találjon.
function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}

type Rule = { type: DocType; keywords: string[]; weight: number };

// A sorrend számít: az első erős találat nyer.
const RULES: Rule[] = [
  { type: "Mérési jegyzőkönyv", keywords: ["meresi jegyzokonyv", "jegyzokonyv", "mj-", "mj_", "utomeres", "meres"], weight: 90 },
  { type: "Energetikai audit", keywords: ["energetikai audit", "audit", "energiaaudit", "atvilagitas"], weight: 92 },
  { type: "Számla", keywords: ["szamla", "invoice", "aramszamla", "gazszamla", "villanyszamla", "energiaszamla"], weight: 94 },
  { type: "SCADA-napló", keywords: ["scada", "naplo", "log_", "mereslog", "export"], weight: 88 },
  { type: "Kivitelezői nyilatkozat", keywords: ["kivitelezoi nyilatkozat", "nyilatkozat", "kivitelezo", "atadas"], weight: 89 },
  { type: "Szerződés", keywords: ["szerzodes", "contract", "megallapodas", "vallalkozasi"], weight: 91 },
  { type: "Számítási munkalap", keywords: ["szamitasi munkalap", "szamitas", "munkalap", "kalkulacio", "baseline"], weight: 87 },
];

// Kiterjesztés-alapú finomítás: bizonyos formátumok bizonyos típusokra utalnak.
const FORMAT_HINTS: Partial<Record<DocFormat, DocType>> = {
  CSV: "SCADA-napló",
  XLSX: "Számítási munkalap",
};

export function formatFromFilename(filename: string): DocFormat {
  const ext = filename.split(".").pop()?.toLowerCase() ?? "";
  if (ext === "docx" || ext === "doc") return "DOCX";
  if (ext === "xlsx" || ext === "xls" || ext === "xlsm") return "XLSX";
  if (ext === "csv" || ext === "tsv") return "CSV";
  return "PDF";
}

export function classifyDocument(filename: string): ClassificationResult {
  const n = normalize(filename);
  const format = formatFromFilename(filename);

  // 1. Kulcsszó-egyezés a fájlnévben
  let best: { type: DocType; confidence: number; matchedKeyword: string } | null = null;
  for (const rule of RULES) {
    for (const kw of rule.keywords) {
      if (n.includes(normalize(kw))) {
        // Hosszabb (specifikusabb) kulcsszó → magasabb konfidencia
        const conf = Math.min(97, rule.weight + Math.min(6, Math.floor(kw.length / 4)));
        if (!best || conf > best.confidence) {
          best = { type: rule.type, confidence: conf, matchedKeyword: kw };
        }
      }
    }
  }
  if (best) {
    // Ha a formátum is egybevág (pl. CSV + SCADA), kicsit erősítjük.
    if (FORMAT_HINTS[format] === best.type) {
      best.confidence = Math.min(98, best.confidence + 2);
    }
    return best;
  }

  // 2. Nincs kulcsszó-találat → formátum-alapú tipp, alacsonyabb konfidenciával
  const hinted = FORMAT_HINTS[format];
  if (hinted) {
    return { type: hinted, confidence: 62, matchedKeyword: null };
  }

  // 3. Ismeretlen → leggyakoribb típus alacsony konfidenciával (manuális megerősítést vár)
  return { type: "Energetikai audit", confidence: 45, matchedKeyword: null };
}
