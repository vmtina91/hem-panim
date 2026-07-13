import { createFileRoute, Link } from "@tanstack/react-router";
import { Download, ArrowLeft } from "lucide-react";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/adatkezeles")({
  head: () => ({
    meta: [
      { title: "Adatkezelési tájékoztató – HEM PANIM" },
      { name: "description", content: "A HEM PANIM demonstrációs rendszer adatkezelési tájékoztatója." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdatkezelesPage,
});

const sections: { title: string; body: React.ReactNode }[] = [
  {
    title: "Az adatkezelő",
    body: (
      <div className="space-y-1">
        <p>
          <strong>Név:</strong> PANIM Innováció Menedzsment Korlátolt Felelősségű Társaság
          (rövidítve: PANIM Innováció Menedzsment Kft.)
        </p>
        <p><strong>Székhely:</strong> 1023 Budapest, Bécsi út 3-5. 5. em. 58.</p>
        <p><strong>Cégjegyzékszám:</strong> 01-09-297486 (Fővárosi Törvényszék Cégbírósága)</p>
        <p><strong>Adószám:</strong> 25940123-2-41</p>
        <p>
          <strong>Kapcsolattartás és érintetti joggyakorlás:</strong>{" "}
          <a href="mailto:info@panim.hu" className="text-[color:var(--ink)] underline">
            info@panim.hu
          </a>
        </p>
        <p className="pt-2">
          Az adatkezelő a HEM PANIM demonstrációs rendszer üzemeltetője; a rendszerben
          végzett adatkezelési tevékenységekért a jelen tájékoztatóban meghatározott
          keretek között felelős.
        </p>
      </div>
    ),
  },
  {
    title: "Az adatkezelés célja",
    body: (
      <ul className="list-disc pl-5 space-y-1">
        <li>a HEM PANIM demonstrációs rendszer működtetése és bemutatása;</li>
        <li>a bejelentkezési és felhasználó-azonosítási adatok kezelése;</li>
        <li>
          a rendszerbe feltöltött dokumentumok feldolgozása megfelelés-ellenőrzési
          (előminősítési) céllal;
        </li>
        <li>a rendszerhasználat naplózása, biztonsági és nyomonkövethetőségi célból.</li>
      </ul>
    ),
  },
  {
    title: "A kezelt adatok köre",
    body: (
      <ul className="list-disc pl-5 space-y-1">
        <li>a felhasználó neve, e-mail címe és a rendszerben kijelölt szerepköre;</li>
        <li>
          bejelentkezési események: időbélyeg, felhasználó azonosítója, esemény típusa
          (bejelentkezés, kijelentkezés, sikertelen próbálkozás);
        </li>
        <li>
          a feltöltött dokumentumokban szereplő adatok (pl. energetikai audit
          adatai, mérési eredmények, számlák tartalma);
        </li>
        <li>
          a rendszerben végzett műveletek naplója (feltöltés, jóváhagyás,
          előminősítés futtatása, riport letöltése).
        </li>
      </ul>
    ),
  },
  {
    title: "Az adatkezelés jogalapja",
    body: (
      <div className="space-y-2">
        <p>
          Az adatkezelés az Európai Parlament és a Tanács (EU) 2016/679 rendeletének
          (GDPR) az alábbi rendelkezésein alapul:
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li>
            <strong>6. cikk (1) bekezdés b) pont</strong> – az adatkezelés a szerződés
            teljesítéséhez, illetve a szerződés megkötését megelőző lépések
            megtételéhez szükséges;
          </li>
          <li>
            <strong>6. cikk (1) bekezdés f) pont</strong> – az adatkezelés az
            adatkezelő vagy harmadik fél jogos érdekének érvényesítéséhez szükséges
            (a rendszer működtetése, biztonsága és nyomonkövethetősége).
          </li>
        </ul>
      </div>
    ),
  },
  {
    title: "Adatmegőrzés",
    body: (
      <p>
        A személyes adatokat és a naplóbejegyzéseket az adatkezelő az adatkezelési cél
        eléréséhez szükséges ideig, illetve a vonatkozó jogszabályokban előírt megőrzési
        ideig kezeli. A demonstrációs környezetben a bejelentkezési adatok és az
        auditnapló-bejegyzések a demó-munkamenet végéig, éles környezetben pedig
        legfeljebb a projekt-életciklus + 5 év időtartamig kerülnek megőrzésre.
      </p>
    ),
  },
  {
    title: "Adatbiztonság",
    body: (
      <ul className="list-disc pl-5 space-y-1">
        <li>a személyes adatok tárolása és továbbítása titkosított csatornán történik;</li>
        <li>
          a hozzáférés szerepkör-alapú (Megfelelésfelelős, Energetikai tanácsadó,
          Auditor), és a legkisebb jogosultság elve alapján kerül kiosztásra;
        </li>
        <li>
          minden érdemi rendszerművelet naplózásra kerül; a naplóbejegyzések
          utólag nem módosíthatók;
        </li>
        <li>
          az adatkezelő a technika mindenkori állása szerinti szervezési és technikai
          intézkedéseket alkalmazza a jogosulatlan hozzáférés, módosítás és
          adatvesztés megelőzése érdekében.
        </li>
      </ul>
    ),
  },
  {
    title: "Az érintettek jogai",
    body: (
      <div className="space-y-2">
        <p>Az érintettet a GDPR alapján az alábbi jogok illetik meg:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>hozzáféréshez való jog (15. cikk);</li>
          <li>helyesbítéshez való jog (16. cikk);</li>
          <li>törléshez való jog („az elfeledtetéshez való jog”, 17. cikk);</li>
          <li>az adatkezelés korlátozásához való jog (18. cikk);</li>
          <li>tiltakozáshoz való jog (21. cikk);</li>
          <li>adathordozhatósághoz való jog (20. cikk).</li>
        </ul>
        <p className="pt-2">
          Az érintett a jogait az adatkezelő fenti elérhetőségén,
          az <a href="mailto:info@panim.hu" className="text-[color:var(--ink)] underline">info@panim.hu</a>{" "}
          e-mail címen gyakorolhatja. Az adatkezelő a kérelemre legkésőbb egy hónapon
          belül érdemi választ ad.
        </p>
      </div>
    ),
  },
  {
    title: "Jogorvoslat",
    body: (
      <div className="space-y-2">
        <p>
          Az érintett panaszával közvetlenül a Nemzeti Adatvédelmi és Információszabadság
          Hatósághoz (NAIH) fordulhat:
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Cím: 1055 Budapest, Falk Miksa utca 9-11.</li>
          <li>Levelezési cím: 1363 Budapest, Pf. 9.</li>
          <li>Telefon: +36 (1) 391-1400</li>
          <li>E-mail: ugyfelszolgalat@naih.hu</li>
          <li>Web: www.naih.hu</li>
        </ul>
        <p className="pt-2">
          Az érintett a jogainak megsértése esetén bírósághoz is fordulhat.
        </p>
      </div>
    ),
  },
];

function AdatkezelesPage() {
  const { user } = useAuth();
  const handleDownload = () => window.print();

  return (
    <div
      className="min-h-screen bg-[color:var(--paper-2)] text-[color:var(--ink)]"
      style={{ fontFamily: "'Manrope', system-ui, sans-serif" }}
    >
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; }
          .print-container { max-width: none !important; padding: 0 !important; }
        }
      `}</style>

      <header className="no-print bg-white border-b border-[color:var(--line)]">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link
            to={user ? "/" : "/bejelentkezes"}
            className="flex items-center gap-2 text-sm text-[color:var(--ink-2)] hover:text-[color:var(--ink)]"
          >
            <ArrowLeft className="w-4 h-4" />
            Vissza
          </Link>
          <button
            onClick={handleDownload}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[color:var(--ink)] text-white rounded-md text-sm font-medium hover:bg-[color:var(--ink)]/90"
          >
            <Download className="w-4 h-4" />
            Letöltés PDF-ben
          </button>
        </div>
      </header>

      <main className="print-container max-w-4xl mx-auto px-6 py-10">
        <div className="paper-card p-8 print:border-0 print:p-0">
          <div className="mb-8 pb-6 border-b border-[color:var(--line)]">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded bg-[color:var(--ink)] text-white grid place-items-center font-bold">
                HP
              </div>
              <div>
                <div className="font-semibold">HEM PANIM</div>
                <div className="text-xs text-[color:var(--ink-2)]">Előminősítő rendszer</div>
              </div>
            </div>
            <h1 className="text-2xl font-bold text-[color:var(--ink)]">
              Adatkezelési tájékoztató
            </h1>
            <p className="text-sm text-[color:var(--ink-2)] mt-2">
              Hatályos: 2026. január 1-jétől
            </p>
          </div>

          <p className="text-sm text-[color:var(--ink)] mb-8">
            A jelen tájékoztató az Európai Parlament és a Tanács (EU) 2016/679
            rendelete (GDPR), valamint az információs önrendelkezési jogról és az
            információszabadságról szóló 2011. évi CXII. törvény (Infotv.) rendelkezéseivel
            összhangban tartalmazza a HEM PANIM demonstrációs rendszer adatkezelésére
            vonatkozó információkat.
          </p>

          <ol className="space-y-8">
            {sections.map((s, i) => (
              <li key={i}>
                <h2 className="text-lg font-semibold text-[color:var(--ink)] mb-3">
                  {i + 1}. {s.title}
                </h2>
                <div className="text-sm text-[color:var(--ink)] leading-relaxed">
                  {s.body}
                </div>
              </li>
            ))}
          </ol>

          <div className="mt-10 pt-6 border-t border-[color:var(--line)] text-xs text-[color:var(--ink-2)] italic">
            A jelen dokumentum a HEM PANIM TRL 3 demonstrációs prototípus keretében
            készült mintadokumentum. Éles felhasználás előtt jogi felülvizsgálata és
            a szervezet konkrét adatkezelési gyakorlatához igazítása szükséges.
          </div>
        </div>
      </main>
    </div>
  );
}
