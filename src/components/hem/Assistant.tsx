import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { MessageCircle, X, Send, Sparkles } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { projects, documents, rules } from "@/lib/hem-data";
import { useGaps } from "@/lib/hem-store";

/**
 * Beépített HEM asszisztens.
 * Kulcsszó-alapú tudásbázisból válaszol (nincs külső AI-hívás, nincs költség).
 * Később bővíthető valódi LLM-hívásra egy backend végponton keresztül.
 */

type Msg = { from: "user" | "bot"; text: string; link?: { to: string; label: string } };

type KbEntry = {
  keywords: string[];
  answer: (ctx: Ctx) => string;
  link?: { to: string; label: string };
};

type Ctx = {
  projectCount: number;
  docCount: number;
  ruleCount: number;
  openGapCount: number;
};

const KB: KbEntry[] = [
  {
    keywords: ["projekt", "project"],
    answer: (c) =>
      `Jelenleg ${c.projectCount} projekt van a rendszerben. A Projektek oldalon egy sorra kattintva megnyílik a részletező nézet a mérési adatokkal, dokumentumokkal és hiánylistával.`,
    link: { to: "/projektek", label: "Projektek megnyitása" },
  },
  {
    keywords: ["dokumentum", "feltölt", "fájl", "file", "upload", "document"],
    answer: (c) =>
      `A rendszerben ${c.docCount} dokumentum található. Új fájlt a Dokumentumok oldalon a „Feltöltés" gombbal adhat hozzá (audit, számla, mérési jegyzőkönyv stb.). A feltöltés után a rendszer kinyeri a mezőket, ezeket a dokumentumra kattintva hagyhatja jóvá.`,
    link: { to: "/dokumentumok", label: "Dokumentumok megnyitása" },
  },
  {
    keywords: ["szabály", "katalógus", "rule", "shacl"],
    answer: (c) =>
      `A szabálykatalógus jelenleg ${c.ruleCount} aktív szabályt tartalmaz. Egy szabály sorára kattintva megnyílik a részletező: szabályszöveg, hibaüzenet, implementáció és verziótörténet.`,
    link: { to: "/szabalykatalogus", label: "Szabálykatalógus megnyitása" },
  },
  {
    keywords: ["előminősítés", "minősítés", "futtat", "kiértékel", "prequal", "score", "pontszám"],
    answer: () =>
      `Az Előminősítés oldalon válasszon projektet, majd kattintson a „Futtatás" gombra. A rendszer betölti a dokumentumokat, felépíti a bizonyítékláncot és kiértékeli a szabályokat — az eredmény a megfelelési pontszám és a hiánylista.`,
    link: { to: "/elominosites", label: "Előminősítés megnyitása" },
  },
  {
    keywords: ["hiány", "gap", "pótl", "jelzés"],
    answer: (c) =>
      `Jelenleg ${c.openGapCount} nyitott hiánytétel van. A hiánylista az Előminősítés oldal alján található: itt felelőst rendelhet a tételekhez, pótlást kérhet, vagy indoklással lezárhatja őket.`,
    link: { to: "/elominosites", label: "Hiánylista megnyitása" },
  },
  {
    keywords: ["mérés", "baseline", "utómérés", "megtakarítás", "kwh", "mwh", "measurement", "saving"],
    answer: () =>
      `A Mérési adatok oldal három fülre oszlik: Baseline adatok, Utómérési adatok és Megtakarítás-számítás. A megtakarítás a baseline és az utómérési érték különbsége — a számításhoz mindkét oldalon igazolt forrásdokumentum szükséges.`,
    link: { to: "/meresek", label: "Mérési adatok megnyitása" },
  },
  {
    keywords: ["riport", "jelentés", "report", "export", "pdf"],
    answer: () =>
      `A Riportok oldalon megfelelőségi riportot állíthat össze a kiválasztott projektről. A riport tartalmazza a pontszámot, az állításokat, a bizonyítékokat és a hiánylistát.`,
    link: { to: "/riportok", label: "Riportok megnyitása" },
  },
  {
    keywords: ["audit", "napló", "log", "történet"],
    answer: () =>
      `Az Auditnapló minden fontos eseményt rögzít: bejelentkezés, dokumentumfeltöltés, jóváhagyás, hiánytétel-lezárás. Ez biztosítja a folyamatok visszakövethetőségét.`,
    link: { to: "/auditnaplo", label: "Auditnapló megnyitása" },
  },
  {
    keywords: ["felülvizsgálat", "konfidencia", "review", "bizonytalan"],
    answer: () =>
      `A Felülvizsgálati sorba automatikusan bekerülnek az alacsony konfidenciájú (75% alatti) kinyerések és a bizonytalan állítások. Minden tétel jóváhagyható, elutasítható (indoklással) vagy kézzel javítható.`,
    link: { to: "/felulvizsgalat", label: "Felülvizsgálat megnyitása" },
  },
  {
    keywords: ["szerepkör", "jogosultság", "beosztás", "role", "permission", "auditor", "megfelelésfelelős", "tanácsadó"],
    answer: () =>
      `Három beépített szerepkör van: a Megfelelésfelelős mindent kezelhet (riportot is generálhat), az Energetikai tanácsadó feltölthet és jóváhagyhat, az Auditor csak olvashat. Az „Egyéb" beosztással regisztrált felhasználók minden jogosultságot megkapnak. A szerepkör a Profil oldalon látható.`,
    link: { to: "/profil", label: "Profil megnyitása" },
  },
  {
    keywords: ["jelszó", "bejelentkez", "regisztrá", "password", "login", "fiók"],
    answer: () =>
      `A bejelentkezési oldalon e-mail címmel és jelszóval, vagy Google-fiókkal léphet be. Regisztrációnál adja meg a nevét, e-mail címét, beosztását és egy legalább 8 karakteres jelszót.`,
  },
  {
    keywords: ["kategoriz", "típus", "besorol", "classif"],
    answer: () =>
      `A rendszer feltöltéskor automatikusan bekategorizálja a dokumentumot a fájlnév és a kiterjesztés alapján — pl. „Aramszamla_2026.pdf" → Számla, „MJ-2026-01.pdf" → Mérési jegyzőkönyv, „SCADA_export.csv" → SCADA-napló. A javasolt típust a feltöltés előtti megerősítő ablakban ellenőrizheti és át is állíthatja. Részletes példák a Súgó „Dokumentumok" szakaszában találhatók.`,
    link: { to: "/dokumentumok", label: "Dokumentumok megnyitása" },
  },
  {
    keywords: ["súgó", "segítség", "help", "útmutató", "hogyan"],
    answer: () =>
      `A Súgó oldalon részletes, lépésenkénti útmutatót talál minden funkcióhoz, valamint gyakran ismételt kérdéseket.`,
    link: { to: "/sugo", label: "Súgó megnyitása" },
  },
];

const SUGGESTIONS = [
  "Hogyan tölthetek fel dokumentumot?",
  "Hogyan futtatok előminősítést?",
  "Mit jelentenek a szerepkörök?",
  "Hány nyitott hiánytétel van?",
];

function normalize(s: string): string {
  return s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
}

function findAnswer(question: string, ctx: Ctx): { text: string; link?: { to: string; label: string } } {
  const q = normalize(question);
  let best: { entry: KbEntry; score: number } | null = null;
  for (const entry of KB) {
    let score = 0;
    for (const kw of entry.keywords) {
      if (q.includes(normalize(kw))) score += kw.length;
    }
    if (score > 0 && (!best || score > best.score)) best = { entry, score };
  }
  if (best) return { text: best.entry.answer(ctx), link: best.entry.link };
  return {
    text:
      "Ebben még nem tudok segíteni, de a következő témákban igen: projektek, dokumentumok, mérési adatok, szabálykatalógus, előminősítés, hiánylista, riportok, auditnapló, szerepkörök. Kérdezzen rá valamelyikre, vagy nézze meg a Súgót!",
    link: { to: "/sugo", label: "Súgó megnyitása" },
  };
}

export function Assistant() {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [msgs, setMsgs] = useState<Msg[]>([
    { from: "bot", text: t("assistant.greeting") },
  ]);
  const bodyRef = useRef<HTMLDivElement>(null);

  const allGaps = useGaps();
  const ctx: Ctx = {
    projectCount: projects.length,
    docCount: documents.length,
    ruleCount: rules.length,
    openGapCount: allGaps.filter((g) => g.status !== "Pótolva").length,
  };

  useEffect(() => {
    if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
  }, [msgs, open]);

  const ask = (q: string) => {
    const question = q.trim();
    if (!question) return;
    const a = findAnswer(question, ctx);
    setMsgs((m) => [...m, { from: "user", text: question }, { from: "bot", text: a.text, link: a.link }]);
    setInput("");
  };

  return (
    <>
      {/* Lebegő gomb */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          aria-label={t("assistant.open")}
          className="fixed bottom-5 right-5 z-40 flex items-center gap-2 px-4 py-3 cut-sm text-white shadow-lg transition-transform hover:scale-105"
          style={{ background: "var(--accent)" }}
        >
          <MessageCircle className="w-5 h-5" />
          <span className="text-sm font-semibold hidden sm:inline">{t("assistant.title")}</span>
        </button>
      )}

      {/* Chat panel */}
      {open && (
        <div
          className="fixed bottom-5 right-5 z-50 w-[360px] max-w-[calc(100vw-2.5rem)] flex flex-col bg-white cut-sm shadow-2xl"
          style={{ height: 480, boxShadow: "0 12px 40px rgba(14,27,51,0.25), inset 0 0 0 1px var(--line)" }}
        >
          <div className="flex items-center justify-between px-4 py-3" style={{ background: "var(--ink)", color: "white" }}>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4" style={{ color: "var(--accent-hover)" }} />
              <span className="text-sm font-semibold">{t("assistant.title")}</span>
            </div>
            <button onClick={() => setOpen(false)} aria-label={t("btn.close")}>
              <X className="w-4 h-4" />
            </button>
          </div>

          <div ref={bodyRef} className="flex-1 overflow-y-auto p-3 space-y-2" style={{ background: "var(--paper)" }}>
            {msgs.map((m, i) => (
              <div key={i} className={`flex ${m.from === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className="max-w-[85%] px-3 py-2 text-[13px] leading-relaxed cut-xs"
                  style={
                    m.from === "user"
                      ? { background: "var(--accent)", color: "white" }
                      : { background: "white", color: "var(--ink)", boxShadow: "inset 0 0 0 1px var(--line)" }
                  }
                >
                  {m.text}
                  {m.link && (
                    <div className="mt-1.5">
                      <Link
                        to={m.link.to}
                        className="text-[12px] font-semibold underline"
                        style={{ color: "var(--accent)" }}
                        onClick={() => setOpen(false)}
                      >
                        {m.link.label} →
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {msgs.length <= 1 && (
              <div className="pt-2 space-y-1.5">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => ask(s)}
                    className="block w-full text-left text-[12px] px-3 py-2 cut-xs bg-white hover:bg-[color:var(--paper-2)] transition-colors"
                    style={{ boxShadow: "inset 0 0 0 1px var(--line)", color: "var(--ink-2)" }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              ask(input);
            }}
            className="flex items-center gap-2 p-3 bg-white"
            style={{ borderTop: "1px solid var(--line)" }}
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={t("assistant.placeholder")}
              className="flex-1 px-3 py-2 text-sm bg-white border focus:outline-none focus:border-[color:var(--accent)]"
              style={{ borderColor: "var(--line)" }}
            />
            <button type="submit" aria-label={t("assistant.send")} className="p-2 cut-xs text-white" style={{ background: "var(--accent)" }}>
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
