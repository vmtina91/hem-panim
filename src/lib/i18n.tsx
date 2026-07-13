import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type Lang = "hu" | "en";
const STORAGE_KEY = "hem-panim-lang";
const DEFAULT_LANG: Lang = "hu";

type Dict = Record<string, string>;

const hu: Dict = {
  // Nav
  "nav.dashboard": "Irányítópult",
  "nav.projects": "Projektek",
  "nav.documents": "Dokumentumok",
  "nav.rules": "Szabálykatalógus",
  "nav.prequal": "Előminősítés",
  "nav.reports": "Riportok",
  "nav.audit": "Auditnapló",
  "nav.help": "Súgó",
  "nav.home": "Kezdőlap",
  "nav.privacy": "Adatkezelési tájékoztató",
  "nav.profile": "Profilom",
  "nav.settings": "Beállítások",

  // Assistant
  "assistant.title": "HEM Asszisztens",
  "assistant.greeting": "Üdvözlöm! A HEM PANIM asszisztense vagyok. Kérdezzen a rendszer használatáról — projektek, dokumentumok, előminősítés, szabályok, riportok és minden más.",
  "assistant.placeholder": "Írja be a kérdését…",
  "assistant.send": "Küldés",
  "assistant.open": "Asszisztens megnyitása",

  // Topbar
  "topbar.help": "Súgó",
  "topbar.logout": "Kijelentkezés",
  "topbar.systemTime": "Rendszeridő",
  "topbar.role.Megfelelésfelelős": "Megfelelésfelelős",
  "topbar.role.Energetikai tanácsadó": "Energetikai tanácsadó",
  "topbar.role.Auditor": "Auditor",

  // Footer
  "footer.copyright": "© 2026 PANIM Innováció Menedzsment Kft.",
  "footer.trl": "TRL 3 · Demonstrációs prototípus",

  // Statuses
  "status.Megfelelt": "Megfelelt",
  "status.Bizonytalan": "Bizonytalan",
  "status.Nem megfelelt": "Nem megfelelt",
  "severity.Kritikus": "Kritikus",
  "severity.Magas": "Magas",
  "severity.Közepes": "Közepes",
  "outcome.Pass": "Megfelelt",
  "outcome.Warning": "Figyelmeztetés",
  "outcome.Fail": "Nem megfelelt",
  "docStatus.Jóváhagyva": "Jóváhagyva",
  "docStatus.Feldolgozás": "Feldolgozás",
  "docStatus.Feldolgozva": "Feldolgozva",
  "ruleType.Teljességi": "Teljességi",
  "ruleType.Konzisztencia": "Konzisztencia",
  "ruleType.Számítási": "Számítási",
  "ruleType.Formai": "Formai",

  // Common buttons
  "btn.save": "Mentés",
  "btn.cancel": "Mégse",
  "btn.close": "Bezárás",
  "btn.back": "Vissza",
  "btn.download": "Letöltés",
  "btn.preview": "Előnézet",
  "btn.approve": "Jóváhagyás",
  "btn.approveAll": "Minden mező jóváhagyása",
  "btn.upload": "Feltöltés",
  "btn.done": "Kész",

  // Login page
  "login.title": "Bejelentkezés",
  "login.register": "Regisztráció",
  "login.subtitle.login": "Adja meg a hozzáférési adatait.",
  "login.subtitle.register": "Hozzon létre új felhasználói fiókot.",
  "login.email": "E-mail cím",
  "login.password": "Jelszó",
  "login.passwordConfirm": "Jelszó megerősítése",
  "login.fullName": "Teljes név",
  "login.role": "Beosztás / szerepkör",
  "login.roleOther": "Egyéb",
  "login.roleOtherLabel": "Egyéb beosztás",
  "login.roleOtherPh": "Írja be a beosztását",
  "login.forgot": "Elfelejtett jelszó?",
  "login.forgotDemo": "Demó módban nem elérhető",
  "login.noAccount": "Nincs még fiókja?",
  "login.hasAccount": "Van már fiókja?",
  "login.acceptTerms": "Elfogadom az",
  "login.acceptTermsLink": "Adatkezelési tájékoztatót",
  "login.google": "Folytatás Google-fiókkal",
  "login.or": "vagy",
  "login.subsection": "Előminősítő rendszer",
  "login.tagline": "HEM/ESG dokumentáció szabályalapú teljességi és konzisztencia-ellenőrzése",
  "login.passwordMin": "legalább 8 karakter",
  "login.err.email": "Adjon meg érvényes e-mail címet.",
  "login.err.password": "A jelszónak legalább 8 karakter hosszúnak kell lennie.",
  "login.err.passwordEmpty": "Adja meg a jelszavát.",
  "login.err.credentials": "Hibás e-mail cím vagy jelszó.",
  "login.err.name": "Adja meg a teljes nevét.",
  "login.err.role": "Adja meg a beosztását.",
  "login.err.pwMatch": "A két jelszó nem egyezik.",
  "login.err.terms": "Kérjük, fogadja el az Adatkezelési tájékoztatót.",
  "login.err.exists": "Ez az e-mail cím már regisztrálva van.",
  "login.err.register": "A regisztráció nem sikerült. Próbálja újra.",
  "login.err.googleFail": "A Google-fiókkal történő bejelentkezés nem sikerült.",
  "login.err.googleCancel": "A Google-fiókkal történő bejelentkezés megszakadt.",
  "login.registerSuccess": "Sikeres regisztráció! Megerősítő e-mailt küldtünk a megadott címre.",

  // Dashboard
  "dashboard.title": "Irányítópult",
  "dashboard.subtitle": "HEM/ESG dokumentáció szabályalapú teljességi és konzisztencia-ellenőrzése",
  "dashboard.complianceIndex": "Megfelelési index",
  "dashboard.n": "N = {total} állítás · {rules} szabály",
  "dashboard.portfolio": "Összesített projektportfólió-megfelelés (bázisérték)",
  "dashboard.portfolioLabel": "Portfólió-szintű megfelelés",
  "dashboard.activeProjects": "Aktív projektek",
  "dashboard.activeProjectsCap": "Folyamatban lévő ügyek",
  "dashboard.documents": "Dokumentumok",
  "dashboard.documentsCap": "Osztályozva, mezők kinyerve",
  "dashboard.rate": "Megfelelési arány",
  "dashboard.openGaps": "Nyitott hiányosságok",
  "dashboard.openGapsCap": "Kritikus és magas prioritás",
  "dashboard.risks": "Kockázati jelzések",
  "dashboard.projectsOverview": "Projektek áttekintése",
  "dashboard.recent": "Legutóbbi események",

  // Projects
  "projects.title": "Projektek",
  "projects.col.id": "Azonosító",
  "projects.col.name": "Projekt neve",
  "projects.col.site": "Telephely",
  "projects.col.measure": "Intézkedés típusa",
  "projects.col.docs": "Dokumentumok",
  "projects.col.status": "Megfelelési státusz",
  "projects.col.lastEval": "Utolsó értékelés",
  "projects.docs.unit": "dok.",

  // Project detail
  "project.title": "Projekt: {id}",
  "project.back": "Vissza a projektekhez",
  "project.docs": "Dokumentumok",
  "project.claims": "Állítások értékelése",
  "project.score": "Megfelelési pontszám",

  // Documents
  "documents.title": "Dokumentumok",
  "documents.processing": "Feldolgozás: szövegkinyerés → osztályozás → adatkinyerés",
  "documents.dropzone": "Húzza ide a fájlokat vagy kattintson a feltöltéshez",
  "documents.formats": "PDF, DOCX, XLSX, CSV",
  "documents.readonly": "Csak megtekintés – a jelenlegi szerepkör ({role}) nem jogosult dokumentumot feltölteni.",
  "documents.guest": "vendég",
  "documents.filter": "Szűrés név vagy típus szerint…",
  "documents.classify.title": "Dokumentumok kategorizálása",
  "documents.classify.subtitle": "A rendszer a fájlnév alapján automatikusan felismerte a dokumentumtípust. Ellenőrizze, és szükség esetén módosítsa a besorolást.",
  "documents.classify.project": "Projekt",
  "documents.classify.auto": "Automatikus besorolás · {c}%",
  "documents.classify.manual": "Kézi besorolás",
  "documents.classify.uncertain": "Bizonytalan – kérjük, ellenőrizze",
  "documents.classify.confirm": "Feltöltés ({n})",
  "documents.col.name": "Fájlnév",
  "documents.col.project": "Projekt",
  "documents.col.type": "Típus",
  "documents.col.format": "Formátum",
  "documents.col.fields": "Kinyert mezők",
  "documents.col.confidence": "Konfidencia",
  "documents.col.status": "Státusz",
  "documents.drawer.approvedCount": "Jóváhagyva: {a}/{b} mező",
  "documents.drawer.readonly": "Csak megtekintés",
  "documents.drawer.fields": "Kinyert adatmezők",
  "documents.drawer.source": "Forrás: {s}",
  "documents.drawer.approved": "Jóváhagyva",
  "documents.drawer.noRight": "Nincs jogosultság",
  "documents.drawer.hint": "Kattintson egy mezőre, hogy a bal oldali dokumentum-előnézetben a forrás kiemelésre kerüljön.",
  "documents.preview.recorded": "A dokumentum rögzíti a(z)",
  "documents.preview.value": "értékét:",
  "documents.preview.sourceIs": "Az adat forrása:",
  "documents.preview.end": "— dokumentum vége —",
  "documents.preview.projectFormat": "Projektazonosító: {p} · Formátum: {f}",

  // Rules
  "rules.title": "Szabálykatalógus",
  "rules.tab.all": "Összes",
  "rules.tab.demo": "Demó alapszabályok",
  "rules.tab.onto": "HEM ontológiamodell v0.9",
  "rules.total": "Összes aktív szabály:",
  "rules.col.id": "Azonosító",
  "rules.col.name": "Szabály neve",
  "rules.col.group": "Csoport",
  "rules.col.source": "Forrás",
  "rules.col.type": "Típus",
  "rules.col.severity": "Súlyosság",
  "rules.col.status": "Státusz",
  "rules.active": "Aktív",
  "rules.detail.text": "Szöveges megfogalmazás",
  "rules.detail.class": "Érintett osztály",
  "rules.detail.evidence": "Szükséges bizonyíték",
  "rules.detail.errorMsg": "Hibaüzenet",
  "rules.detail.impl": "Javasolt implementáció",
  "rules.detail.test": "Teszteset",
  "rules.detail.pseudo": "Formalizált feltétel (pszeudo-kód)",
  "rules.detail.relatedProjects": "Kapcsolódó projektek",
  "rules.detail.noRelated": "Nincs kapcsolódó értékelés.",

  // Prequal
  "prequal.title": "Előminősítés",
  "prequal.projectLabel": "Projekt:",
  "prequal.run": "Előminősítés futtatása",
  "prequal.summary": "Összesített pontszám",
  "prequal.gauge": "Energetikai megfelelés",
  "prequal.claims": "Állítások és bizonyítékok",
  "prequal.evidenceCount": "{n} bizonyíték",
  "prequal.chain.claim": "Állítás",
  "prequal.chain.support": "ALÁTÁMASZTJA",
  "prequal.chain.evidence": "Bizonyíték",
  "prequal.chain.applies": "VONATKOZIK",
  "prequal.chain.rule": "Szabály",
  "prequal.ontology": "Ontológia-alapú validáció",
  "prequal.ontology.col.rule": "Szabály",
  "prequal.ontology.col.class": "Osztály",
  "prequal.ontology.col.note": "Megjegyzés",
  "prequal.ontology.col.result": "Eredmény",
  "prequal.gaps": "Hiánylista",
  "prequal.gaps.none": "Nincs nyitott hiányosság ezen a projekten.",
  "prequal.assignPlaceholder": "Felelős hozzárendelése…",
  "prequal.replacement": "Pótlás kérése",
  "prequal.replacementSent": "Pótlás kérése elküldve: {id}",
  "prequal.modal.title": "Előminősítés futtatása – {id}",
  "prequal.steps.load": "Dokumentumok betöltése",
  "prequal.steps.extract": "Mezőkinyerés és normalizálás",
  "prequal.steps.evidence": "Bizonyítéklánc felépítése",
  "prequal.steps.eval": "Szabálykiértékelés ({n} szabály)",

  // Reports
  "reports.title": "Riportok",
  "reports.readonly": "A jelenlegi szerepkör ({role}) nem jogosult riport generálására vagy letöltésére – csak megtekintés érhető el.",
  "reports.col.id": "Azonosító",
  "reports.col.title": "Cím",
  "reports.col.project": "Projekt",
  "reports.col.created": "Létrehozva",
  "reports.col.actions": "Műveletek",
  "reports.downloadPdf": "Letöltés (PDF)",
  "reports.previewTitle": "Riport előnézet – {id}",
  "reports.reportId": "Riport azonosító:",
  "reports.createdAt": "Létrehozva:",
  "reports.section": "Előminősítési riport",
  "reports.overall": "Összesített energetikai megfelelés",
  "reports.claimsEvaluated": "Értékelt állítások:",
  "reports.claims": "Állítások",
  "reports.gaps": "Hiánylista",
  "reports.noGaps": "Nincs nyitott hiányosság.",
  "reports.generatedBy": "Generálta: HEM PANIM előminősítő – TRL 3 demonstrációs prototípus",

  // Audit
  "audit.title": "Auditnapló",
  "audit.filter": "Szűrés felhasználó, művelet vagy objektum szerint…",
  "audit.col.time": "Időpont",
  "audit.col.user": "Felhasználó",
  "audit.col.action": "Művelet",
  "audit.col.object": "Objektum",
  "audit.col.details": "Részletek",

  // Help
  "help.title": "Súgó",
  "help.tab.guide": "Használati útmutató",
  "help.tab.faq": "GYIK",

  // Profile
  "profile.title": "Profil és beállítások",
  "profile.subtitle": "Személyes adatok és alkalmazás-beállítások kezelése",
  "profile.section.personal": "Személyes adatok",
  "profile.section.app": "Alkalmazás-beállítások",
  "profile.avatar": "Profilkép",
  "profile.avatar.upload": "Kép feltöltése",
  "profile.avatar.remove": "Eltávolítás",
  "profile.avatar.hint": "PNG vagy JPG, max. 2 MB",
  "profile.fullName": "Teljes név",
  "profile.titleField": "Titulus",
  "profile.titleFieldPh": "pl. energetikai szakértő",
  "profile.role": "Beosztás / Szerepkör",
  "profile.roleHint": "A rendszer állítja be – csak olvasható.",
  "profile.org": "Szervezet neve",
  "profile.phone": "Telefonszám",
  "profile.email": "E-mail",
  "profile.emailHint": "A fiókból származik – csak olvasható.",
  "profile.bio": "Rövid bemutatkozás",
  "profile.bioHint": "max. 300 karakter",
  "profile.language": "Nyelv",
  "profile.dateFormat": "Dátumformátum",
  "profile.saved": "Profil sikeresen mentve.",
  "profile.saveError": "A mentés nem sikerült. Próbálja újra.",
  "profile.phoneInvalid": "Érvénytelen telefonszám formátum.",
  "profile.bioTooLong": "A bemutatkozás legfeljebb 300 karakter lehet.",
  "profile.uploading": "Feltöltés folyamatban…",

  // New nav
  "nav.measurements": "Mérési adatok",
  "nav.review": "Felülvizsgálat",

  // Measurements page
  "meas.title": "Mérési adatok",
  "meas.project": "Projekt:",
  "meas.tab.baseline": "Baseline adatok",
  "meas.tab.post": "Utómérési adatok",
  "meas.tab.saving": "Megtakarítás-számítás",
  "meas.col.periodStart": "Időszak kezdete",
  "meas.col.periodEnd": "Időszak vége",
  "meas.col.value": "Érték",
  "meas.col.unit": "Mértékegység",
  "meas.col.source": "Forrásdokumentum",
  "meas.col.evidence": "Státusz",
  "meas.noSource": "— nincs forrásdokumentum —",
  "meas.formula": "Képlet",
  "meas.method": "Számítási mód",
  "meas.rules": "Kapcsolódó szabályok",
  "meas.saving": "Megtakarítás",

  // Review page
  "review.title": "Felülvizsgálati sor",
  "review.subtitle": "Alacsony konfidenciájú mezők, bizonytalan állítások és review-t igénylő szabályeredmények.",
  "review.empty": "Nincs függőben lévő felülvizsgálati tétel.",
  "review.col.item": "Tétel",
  "review.col.project": "Projekt",
  "review.col.source": "Forrás",
  "review.col.confidence": "Konfidencia",
  "review.col.reason": "Ok",
  "review.col.status": "Státusz",
  "review.col.actions": "Műveletek",
  "review.filter.open": "Nyitott",
  "review.filter.all": "Összes",
  "review.status.Nyitott": "Nyitott",
  "review.status.Jóváhagyva": "Jóváhagyva",
  "review.status.Elutasítva": "Elutasítva",
  "review.status.Javítva": "Javítva",
  "review.btn.approve": "Jóváhagyás",
  "review.btn.reject": "Elutasítás",
  "review.btn.fix": "Javítás",
  "review.commentPh": "Indoklás (elutasításnál kötelező)…",
  "review.correctedPh": "Javított érték…",
  "review.decidedBy": "Döntés: {who} · {when}",
  "review.needComment": "Elutasításhoz kötelező az indoklás.",

  // Gap lifecycle
  "gap.status.Nyitott": "Nyitott",
  "gap.status.Folyamatban": "Folyamatban",
  "gap.status.Pótlásra vár": "Pótlásra vár",
  "gap.status.Pótolva": "Pótolva",
  "gap.close": "Lezárás",
  "gap.closeCommentPh": "Pótlás módja / megjegyzés…",
  "gap.closedSection": "Lezárt tételek",
  "gap.resolvedAt": "Pótolva: {when}",
  "gap.assignee": "Felelős:",

  // Rule versioning
  "rules.col.version": "Verzió",
  "rules.detail.versionHistory": "Verziótörténet",
  "rules.version.current": "Aktuális verzió",

  // Prequal versioning
  "prequal.runMeta": "Futtatva: katalógus v{cat} · szabályverziók rögzítve",
  "prequal.runAt": "Időpont: {when}",

  // Reports appendix
  "reports.appendixA": "A. melléklet – Bizonyítéklánc-jegyzék",
  "reports.appendixB": "B. melléklet – Alkalmazott szabálykatalógus",
  "reports.appendix.col.claim": "Állítás",
  "reports.appendix.col.evidence": "Bizonyíték",
  "reports.appendix.col.source": "Forrás + hely",
  "reports.appendix.col.rule": "Szabály + verzió",
  "reports.appendix.col.status": "Státusz",
  "reports.appendix.col.result": "Eredmény",
  "reports.footer.reproducible": "A riport a megjelölt szabályverziókkal reprodukálható. TRL 3 demonstrációs prototípus.",
  "reports.catalogUsed": "Alkalmazott katalógus: {cat}",

  // Language switch
  "lang.hu": "Magyar",
  "lang.en": "English",
};

const en: Dict = {
  "nav.dashboard": "Dashboard",
  "nav.projects": "Projects",
  "nav.documents": "Documents",
  "nav.rules": "Rule catalogue",
  "nav.prequal": "Pre-qualification",
  "nav.reports": "Reports",
  "nav.audit": "Audit log",
  "nav.help": "Help",
  "nav.home": "Home",
  "nav.privacy": "Data protection notice",
  "nav.profile": "My profile",
  "nav.settings": "Settings",

  "assistant.title": "HEM Assistant",
  "assistant.greeting": "Hello! I am the HEM PANIM assistant. Ask me about projects, documents, pre-qualification, rules, reports and more.",
  "assistant.placeholder": "Type your question…",
  "assistant.send": "Send",
  "assistant.open": "Open assistant",
  "topbar.help": "Help",
  "topbar.logout": "Sign out",
  "topbar.systemTime": "System time",
  "topbar.role.Megfelelésfelelős": "Compliance officer",
  "topbar.role.Energetikai tanácsadó": "Energy consultant",
  "topbar.role.Auditor": "Auditor",

  "footer.copyright": "© 2026 PANIM Innovation Management Ltd.",
  "footer.trl": "TRL 3 · Demonstration prototype",

  "status.Megfelelt": "Compliant",
  "status.Bizonytalan": "Uncertain",
  "status.Nem megfelelt": "Non-compliant",
  "severity.Kritikus": "Critical",
  "severity.Magas": "High",
  "severity.Közepes": "Medium",
  "outcome.Pass": "Pass",
  "outcome.Warning": "Warning",
  "outcome.Fail": "Fail",
  "docStatus.Jóváhagyva": "Approved",
  "docStatus.Feldolgozás": "Processing",
  "docStatus.Feldolgozva": "Processed",
  "ruleType.Teljességi": "Completeness",
  "ruleType.Konzisztencia": "Consistency",
  "ruleType.Számítási": "Calculation",
  "ruleType.Formai": "Formal",

  "btn.save": "Save",
  "btn.cancel": "Cancel",
  "btn.close": "Close",
  "btn.back": "Back",
  "btn.download": "Download",
  "btn.preview": "Preview",
  "btn.approve": "Approve",
  "btn.approveAll": "Approve all fields",
  "btn.upload": "Upload",
  "btn.done": "Done",

  "login.title": "Sign in",
  "login.register": "Register",
  "login.subtitle.login": "Enter your access credentials.",
  "login.subtitle.register": "Create a new user account.",
  "login.email": "Email address",
  "login.password": "Password",
  "login.passwordConfirm": "Confirm password",
  "login.fullName": "Full name",
  "login.role": "Position / role",
  "login.roleOther": "Other",
  "login.roleOtherLabel": "Other position",
  "login.roleOtherPh": "Enter your position",
  "login.forgot": "Forgot password?",
  "login.forgotDemo": "Not available in demo mode",
  "login.noAccount": "Don't have an account?",
  "login.hasAccount": "Already have an account?",
  "login.acceptTerms": "I accept the",
  "login.acceptTermsLink": "Data protection notice",
  "login.google": "Continue with Google",
  "login.or": "or",
  "login.subsection": "Pre-qualification system",
  "login.tagline": "Rule-based completeness and consistency check for HEM/ESG documentation",
  "login.passwordMin": "at least 8 characters",
  "login.err.email": "Please enter a valid email address.",
  "login.err.password": "Password must be at least 8 characters.",
  "login.err.passwordEmpty": "Please enter your password.",
  "login.err.credentials": "Invalid email or password.",
  "login.err.name": "Please enter your full name.",
  "login.err.role": "Please enter your position.",
  "login.err.pwMatch": "Passwords do not match.",
  "login.err.terms": "Please accept the Data protection notice.",
  "login.err.exists": "This email address is already registered.",
  "login.err.register": "Registration failed. Please try again.",
  "login.err.googleFail": "Google sign-in failed.",
  "login.err.googleCancel": "Google sign-in was cancelled.",
  "login.registerSuccess": "Registration successful! A confirmation email has been sent to your address.",

  "dashboard.title": "Dashboard",
  "dashboard.subtitle": "Rule-based completeness and consistency check for HEM/ESG documentation",
  "dashboard.complianceIndex": "Compliance index",
  "dashboard.n": "N = {total} claims · {rules} rules",
  "dashboard.portfolio": "Aggregate project portfolio compliance (baseline)",
  "dashboard.portfolioLabel": "Portfolio-level compliance",
  "dashboard.activeProjects": "Active projects",
  "dashboard.activeProjectsCap": "Ongoing cases",
  "dashboard.documents": "Documents",
  "dashboard.documentsCap": "Classified, fields extracted",
  "dashboard.rate": "Compliance rate",
  "dashboard.openGaps": "Open gaps",
  "dashboard.openGapsCap": "Critical and high priority",
  "dashboard.risks": "Risk signals",
  "dashboard.projectsOverview": "Projects overview",
  "dashboard.recent": "Recent events",

  "projects.title": "Projects",
  "projects.col.id": "ID",
  "projects.col.name": "Project name",
  "projects.col.site": "Site",
  "projects.col.measure": "Measure type",
  "projects.col.docs": "Documents",
  "projects.col.status": "Compliance status",
  "projects.col.lastEval": "Last evaluation",
  "projects.docs.unit": "docs",

  "project.title": "Project: {id}",
  "project.back": "Back to projects",
  "project.docs": "Documents",
  "project.claims": "Claim evaluation",
  "project.score": "Compliance score",

  "documents.title": "Documents",
  "documents.processing": "Processing: text extraction → classification → data extraction",
  "documents.dropzone": "Drag files here or click to upload",
  "documents.formats": "PDF, DOCX, XLSX, CSV",
  "documents.readonly": "Read only – the current role ({role}) is not permitted to upload documents.",
  "documents.guest": "guest",
  "documents.filter": "Filter by name or type…",
  "documents.classify.title": "Document classification",
  "documents.classify.subtitle": "The system detected the document type from the file name. Review and adjust the classification if needed.",
  "documents.classify.project": "Project",
  "documents.classify.auto": "Auto-classified · {c}%",
  "documents.classify.manual": "Manually classified",
  "documents.classify.uncertain": "Uncertain – please review",
  "documents.classify.confirm": "Upload ({n})",
  "documents.col.name": "File name",
  "documents.col.project": "Project",
  "documents.col.type": "Type",
  "documents.col.format": "Format",
  "documents.col.fields": "Extracted fields",
  "documents.col.confidence": "Confidence",
  "documents.col.status": "Status",
  "documents.drawer.approvedCount": "Approved: {a}/{b} fields",
  "documents.drawer.readonly": "Read only",
  "documents.drawer.fields": "Extracted data fields",
  "documents.drawer.source": "Source: {s}",
  "documents.drawer.approved": "Approved",
  "documents.drawer.noRight": "No permission",
  "documents.drawer.hint": "Click a field to highlight its source in the preview on the left.",
  "documents.preview.recorded": "The document records the",
  "documents.preview.value": "value:",
  "documents.preview.sourceIs": "Source of the data:",
  "documents.preview.end": "— end of document —",
  "documents.preview.projectFormat": "Project ID: {p} · Format: {f}",

  "rules.title": "Rule catalogue",
  "rules.tab.all": "All",
  "rules.tab.demo": "Demo baseline rules",
  "rules.tab.onto": "HEM ontology model v0.9",
  "rules.total": "Total active rules:",
  "rules.col.id": "ID",
  "rules.col.name": "Rule name",
  "rules.col.group": "Group",
  "rules.col.source": "Source",
  "rules.col.type": "Type",
  "rules.col.severity": "Severity",
  "rules.col.status": "Status",
  "rules.active": "Active",
  "rules.detail.text": "Textual formulation",
  "rules.detail.class": "Applicable class",
  "rules.detail.evidence": "Required evidence",
  "rules.detail.errorMsg": "Error message",
  "rules.detail.impl": "Suggested implementation",
  "rules.detail.test": "Test case",
  "rules.detail.pseudo": "Formalised condition (pseudo-code)",
  "rules.detail.relatedProjects": "Related projects",
  "rules.detail.noRelated": "No related evaluation.",

  "prequal.title": "Pre-qualification",
  "prequal.projectLabel": "Project:",
  "prequal.run": "Run pre-qualification",
  "prequal.summary": "Overall score",
  "prequal.gauge": "Energy compliance",
  "prequal.claims": "Claims and evidence",
  "prequal.evidenceCount": "{n} evidence",
  "prequal.chain.claim": "Claim",
  "prequal.chain.support": "SUPPORTS",
  "prequal.chain.evidence": "Evidence",
  "prequal.chain.applies": "APPLIES TO",
  "prequal.chain.rule": "Rule",
  "prequal.ontology": "Ontology-based validation",
  "prequal.ontology.col.rule": "Rule",
  "prequal.ontology.col.class": "Class",
  "prequal.ontology.col.note": "Note",
  "prequal.ontology.col.result": "Result",
  "prequal.gaps": "Gap list",
  "prequal.gaps.none": "No open gaps on this project.",
  "prequal.assignPlaceholder": "Assign owner…",
  "prequal.replacement": "Request replacement",
  "prequal.replacementSent": "Replacement request sent: {id}",
  "prequal.modal.title": "Run pre-qualification – {id}",
  "prequal.steps.load": "Loading documents",
  "prequal.steps.extract": "Field extraction and normalisation",
  "prequal.steps.evidence": "Building evidence chain",
  "prequal.steps.eval": "Rule evaluation ({n} rules)",

  "reports.title": "Reports",
  "reports.readonly": "The current role ({role}) is not permitted to generate or download reports – view only.",
  "reports.col.id": "ID",
  "reports.col.title": "Title",
  "reports.col.project": "Project",
  "reports.col.created": "Created",
  "reports.col.actions": "Actions",
  "reports.downloadPdf": "Download (PDF)",
  "reports.previewTitle": "Report preview – {id}",
  "reports.reportId": "Report ID:",
  "reports.createdAt": "Created at:",
  "reports.section": "Pre-qualification report",
  "reports.overall": "Overall energy compliance",
  "reports.claimsEvaluated": "Claims evaluated:",
  "reports.claims": "Claims",
  "reports.gaps": "Gap list",
  "reports.noGaps": "No open gaps.",
  "reports.generatedBy": "Generated by HEM PANIM pre-qualifier – TRL 3 demonstration prototype",

  "audit.title": "Audit log",
  "audit.filter": "Filter by user, action or object…",
  "audit.col.time": "Time",
  "audit.col.user": "User",
  "audit.col.action": "Action",
  "audit.col.object": "Object",
  "audit.col.details": "Details",

  "help.title": "Help",
  "help.tab.guide": "User guide",
  "help.tab.faq": "FAQ",

  "profile.title": "Profile and settings",
  "profile.subtitle": "Manage personal data and application settings",
  "profile.section.personal": "Personal data",
  "profile.section.app": "Application settings",
  "profile.avatar": "Profile picture",
  "profile.avatar.upload": "Upload image",
  "profile.avatar.remove": "Remove",
  "profile.avatar.hint": "PNG or JPG, max 2 MB",
  "profile.fullName": "Full name",
  "profile.titleField": "Title",
  "profile.titleFieldPh": "e.g. energy expert",
  "profile.role": "Position / role",
  "profile.roleHint": "Set by the system – read only.",
  "profile.org": "Organisation name",
  "profile.phone": "Phone number",
  "profile.email": "Email",
  "profile.emailHint": "Comes from the account – read only.",
  "profile.bio": "Short bio",
  "profile.bioHint": "max 300 characters",
  "profile.language": "Language",
  "profile.dateFormat": "Date format",
  "profile.saved": "Profile saved successfully.",
  "profile.saveError": "Save failed. Please try again.",
  "profile.phoneInvalid": "Invalid phone number format.",
  "profile.bioTooLong": "Bio must be at most 300 characters.",
  "profile.uploading": "Uploading…",

  "lang.hu": "Magyar",
  "lang.en": "English",
};

const DICTS: Record<Lang, Dict> = { hu, en };

function format(str: string, params?: Record<string, string | number>): string {
  if (!params) return str;
  return str.replace(/\{(\w+)\}/g, (_, k) => String(params[k] ?? `{${k}}`));
}

interface I18nCtx {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
  formatDate: (d: Date | string, opts?: { withTime?: boolean; format?: string }) => string;
}

const Ctx = createContext<I18nCtx | null>(null);

function readInitial(): Lang {
  if (typeof window === "undefined") return DEFAULT_LANG;
  try {
    const v = window.localStorage.getItem(STORAGE_KEY);
    if (v === "hu" || v === "en") return v;
  } catch {
    /* ignore */
  }
  return DEFAULT_LANG;
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(DEFAULT_LANG);

  // Hydration-safe read
  useEffect(() => {
    setLangState(readInitial());
  }, []);

  const setLang = (l: Lang) => {
    setLangState(l);
    try {
      window.localStorage.setItem(STORAGE_KEY, l);
    } catch {
      /* ignore */
    }
    if (typeof document !== "undefined") document.documentElement.lang = l;
  };

  useEffect(() => {
    if (typeof document !== "undefined") document.documentElement.lang = lang;
  }, [lang]);

  const value = useMemo<I18nCtx>(() => {
    const dict = DICTS[lang];
    const t = (key: string, params?: Record<string, string | number>) => {
      const raw = dict[key] ?? DICTS.hu[key] ?? key;
      return format(raw, params);
    };
    const formatDate = (d: Date | string, opts?: { withTime?: boolean; format?: string }) => {
      const date = typeof d === "string" ? new Date(d) : d;
      if (isNaN(date.getTime())) return typeof d === "string" ? d : "";
      const pad = (n: number) => String(n).padStart(2, "0");
      const y = date.getFullYear();
      const m = pad(date.getMonth() + 1);
      const day = pad(date.getDate());
      const useHuFmt = (opts?.format ?? (lang === "hu" ? "YYYY.MM.DD" : "YYYY-MM-DD")) === "YYYY.MM.DD";
      const base = useHuFmt ? `${y}.${m}.${day}.` : `${y}-${m}-${day}`;
      if (!opts?.withTime) return base;
      return `${base} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
    };
    return { lang, setLang, t, formatDate };
  }, [lang]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useI18n(): I18nCtx {
  const c = useContext(Ctx);
  if (!c) throw new Error("useI18n must be used within I18nProvider");
  return c;
}
