import { Link, Navigate, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { LogOut, ChevronDown, HelpCircle, User as UserIcon, Settings, Sun, Moon } from "lucide-react";
import { useAuth, roleLabel } from "@/lib/auth";
import { useI18n } from "@/lib/i18n";
import { Assistant } from "@/components/hem/Assistant";
import panimLogo from "@/assets/panim-logo.png.asset.json";

const NAV_KEYS = [
  { to: "/", key: "nav.dashboard", exact: true, numbered: true },
  { to: "/projektek", key: "nav.projects", numbered: true },
  { to: "/dokumentumok", key: "nav.documents", numbered: true },
  { to: "/meresek", key: "nav.measurements", numbered: true },
  { to: "/felulvizsgalat", key: "nav.review", badge: "review" as const, numbered: false },
  { to: "/szabalykatalogus", key: "nav.rules", numbered: true },
  { to: "/elominosites", key: "nav.prequal", numbered: true },
  { to: "/riportok", key: "nav.reports", numbered: true },
  { to: "/auditnaplo", key: "nav.audit", numbered: true },
] as const;



function pathToLabelKey(pathname: string): string {
  switch (pathname) {
    case "/": return "nav.home";
    case "/projektek": return "nav.projects";
    case "/dokumentumok": return "nav.documents";
    case "/meresek": return "nav.measurements";
    case "/felulvizsgalat": return "nav.review";
    case "/szabalykatalogus": return "nav.rules";
    case "/elominosites": return "nav.prequal";
    case "/riportok": return "nav.reports";
    case "/auditnaplo": return "nav.audit";
    case "/sugo": return "nav.help";
    case "/adatkezeles": return "nav.privacy";
    case "/profil": return "nav.profile";
    default: return "";
  }
}

function initials(name: string): string {
  return (name || "?").split(/\s+/).map((n) => n[0]).filter(Boolean).slice(0, 2).join("").toUpperCase();
}

function colorFromString(s: string): string {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) % 360;
  return `hsl(${h}, 45%, 35%)`;
}

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

export function AppShell({
  children,
  title,
  subtitle,
  actions,
}: {
  children: ReactNode;
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { user, logout } = useAuth();
  const { t, formatDate } = useI18n();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const crumbs = useMemo(() => {
    const list: { label: string; to?: string }[] = [{ label: t("nav.home"), to: "/" }];
    if (pathname === "/") return list;
    const parts = pathname.split("/").filter(Boolean);
    let acc = "";
    parts.forEach((p, i) => {
      acc += "/" + p;
      const key = pathToLabelKey(acc);
      const label = key ? t(key) : decodeURIComponent(p);
      list.push({ label, to: i < parts.length - 1 ? acc : undefined });
    });
    return list;
  }, [pathname, t]);

  if (!user) return <Navigate to="/bejelentkezes" />;

  const handleLogout = async () => {
    await logout();
    navigate({ to: "/bejelentkezes" });
  };

  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  const dateStr = formatDate(now, { format: user.dateFormat });
  const timeStr = now.toLocaleTimeString("hu-HU", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false });

  return (
    <div className="min-h-screen flex w-full text-[color:var(--ink)] blueprint-bg">
      {/* SIDEBAR */}
      <aside
        className="w-[248px] shrink-0 flex flex-col sticky top-0 h-screen rail-dark"
      >
        <div className="px-5 pt-5 pb-4 rail-divider border-b">
          <div className="bg-white p-3 flex items-center justify-center rounded-md" style={{ boxShadow: "0 1px 2px rgba(0,0,0,0.15)" }}>
            <img src={panimLogo.url} alt="PANIM" className="max-h-11 w-auto object-contain" />
          </div>
          <div className="mt-3 mono text-[10px] tracking-[0.22em] uppercase font-semibold rail-label">
            HEM PANIM
          </div>
        </div>

        <nav className="flex-1 py-3 overflow-y-auto">
          {(() => {
            let displayIdx = 0;
            return NAV_KEYS.map((n) => {
              const active = "exact" in n && n.exact ? pathname === n.to : pathname.startsWith(n.to) && (n.to !== "/" || pathname === "/");
              const numberLabel = n.numbered ? pad2(++displayIdx) : "";
              return (
                <Link key={n.to} to={n.to} className={`nav-item ${active ? "is-active" : ""}`}>
                  <span className="nav-index mono w-5 shrink-0">{numberLabel}</span>
                  <span className="truncate flex-1">{t(n.key)}</span>
                </Link>
              );
            });
          })()}
        </nav>


        <div className="rail-divider border-t py-3">
          <div className="px-5 mono text-[9px] tracking-[0.18em] uppercase rail-label" style={{ opacity: 0.7 }}>
            {t("footer.trl")}
          </div>
        </div>
      </aside>


      {/* MAIN COLUMN */}
      <div className="flex-1 flex flex-col min-w-0">
        <header
          className="h-14 border-b flex items-center px-6 gap-4 sticky top-0 z-30"
          style={{ background: "var(--band-bg)", backdropFilter: "blur(6px)", borderColor: "var(--line)" }}
        >
          <nav aria-label="Breadcrumb" className="flex items-center mono text-[10px] uppercase tracking-[0.14em] min-w-0" style={{ color: "var(--ink-2)" }}>
            {crumbs.map((c, i) => (
              <span key={i} className="flex items-center min-w-0">
                {i > 0 && <span className="mx-2 opacity-40">/</span>}
                {c.to && i < crumbs.length - 1 ? (
                  <Link to={c.to} className="hover:text-[color:var(--accent)] transition-colors truncate">{c.label}</Link>
                ) : (
                  <span className="truncate" style={{ color: "var(--ink)" }}>{c.label}</span>
                )}
              </span>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-3">
            <ThemeToggle />
            <Link to="/sugo" title={t("topbar.help")} className="w-8 h-8 grid place-items-center transition-colors" style={{ color: "var(--ink-2)" }}>
              <HelpCircle className="w-4 h-4" />
            </Link>
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setMenuOpen((o) => !o)}
                className="flex items-center gap-2 pl-1 pr-2 py-1 hover:bg-[color:var(--paper-2)] transition-colors cut-xs"
              >
                {user.avatarUrl ? (
                  <img src={user.avatarUrl} alt={user.name} className="w-8 h-8 object-cover cut-xs" />
                ) : (
                  <div
                    className="w-8 h-8 grid place-items-center text-white text-[11px] font-semibold cut-xs mono"
                    style={{ background: colorFromString(user.name || user.email) }}
                  >
                    {initials(user.name)}
                  </div>
                )}
                <div className="hidden md:block text-left leading-tight">
                  <div className="text-[12px] font-medium">{user.name}</div>
                  <div className="mono text-[9px] uppercase tracking-[0.14em]" style={{ color: "var(--ink-2)" }}>
                    {roleLabel(user.role, t)}
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5" style={{ color: "var(--ink-2)" }} />
              </button>
              {menuOpen && (
                <div className="absolute right-0 top-full mt-2 w-64 bg-white z-40 py-1 fade-slide paper-card">
                  <div className="px-4 py-3 border-b" style={{ borderColor: "var(--line)" }}>
                    <div className="text-sm font-medium">{user.name}</div>
                    <div className="mono text-[10px] uppercase tracking-[0.1em]" style={{ color: "var(--ink-2)" }}>{user.email}</div>
                    <div className="mono text-[10px] uppercase tracking-[0.14em] mt-1" style={{ color: "var(--accent)" }}>
                      {roleLabel(user.role, t)}
                    </div>
                  </div>
                  <Link
                    to="/profil"
                    onClick={() => setMenuOpen(false)}
                    className="w-full text-left px-4 py-2.5 text-sm hover:bg-[color:var(--paper-2)] flex items-center gap-2"
                  >
                    <UserIcon className="w-4 h-4" /> {t("nav.profile")}
                  </Link>
                  <Link
                    to="/profil"
                    onClick={() => setMenuOpen(false)}
                    className="w-full text-left px-4 py-2.5 text-sm hover:bg-[color:var(--paper-2)] flex items-center gap-2"
                  >
                    <Settings className="w-4 h-4" /> {t("nav.settings")}
                  </Link>
                  <div className="my-1 border-t" style={{ borderColor: "var(--line)" }} />
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2.5 text-sm hover:bg-[color:var(--paper-2)] flex items-center gap-2"
                  >
                    <LogOut className="w-4 h-4" /> {t("topbar.logout")}
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page header band */}
        <div className="border-b" style={{ borderColor: "var(--line)", background: "var(--band-bg-soft)" }}>
          <div className="max-w-[1600px] mx-auto px-6 py-6">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div className="min-w-0">
                <div className="mono text-[11px] uppercase tracking-[0.08em] font-semibold mb-2" style={{ color: "var(--ink-2)" }}>
                  {crumbs[crumbs.length - 1]?.label ?? ""}
                </div>
                <h1 className="text-[30px] leading-tight font-bold tracking-tight" style={{ color: "var(--ink)" }}>
                  {title}
                </h1>
                {subtitle && <p className="text-sm mt-2 max-w-2xl leading-relaxed" style={{ color: "var(--ink-2)", lineHeight: 1.6 }}>{subtitle}</p>}
              </div>
              <div className="flex items-center gap-3">
                {actions}
                <div className="hidden md:flex items-center gap-2.5 mono text-[11px] tracking-[0.04em] text-right leading-tight" style={{ color: "var(--ink-2)" }}>
                  <span className="pulse-live" aria-hidden />
                  <div>
                    <div className="uppercase tracking-[0.08em] text-[10px] font-semibold">{t("topbar.systemTime")}</div>
                    <div style={{ color: "var(--ink)" }}>{dateStr} · {timeStr}</div>
                  </div>
                </div>
              </div>

            </div>

            
          </div>
        </div>

        <main className="flex-1 overflow-auto relative" key={pathname}>
          <div className="max-w-[1600px] mx-auto px-6 py-6 page-in">{children}</div>
        </main>

        <Assistant />

        <footer
          className="border-t px-6 py-3 mono text-[10px] uppercase tracking-[0.14em] flex flex-wrap items-center gap-x-4 gap-y-1"
          style={{ borderColor: "var(--line)", color: "var(--ink-2)", background: "var(--band-bg-soft)" }}
        >
          <span>{t("footer.copyright")}</span>
          <Link to="/adatkezeles" className="hover:text-[color:var(--accent)]">{t("nav.privacy")}</Link>
          <span className="ml-auto opacity-60">{t("footer.trl")}</span>
        </footer>
      </div>
    </div>
  );
}

function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    if (typeof window === "undefined") return "light";
    return (localStorage.getItem("hem-theme") as "light" | "dark") || "light";
  });
  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") root.classList.add("dark");
    else root.classList.remove("dark");
    localStorage.setItem("hem-theme", theme);
  }, [theme]);
  const isDark = theme === "dark";
  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={isDark ? "Világos mód" : "Sötét mód"}
      title={isDark ? "Világos mód" : "Sötét mód"}
      className="theme-toggle"
    >
      <span className="theme-toggle-thumb" data-dark={isDark}>
        {isDark ? <Moon className="w-3 h-3" /> : <Sun className="w-3 h-3" />}
      </span>
    </button>
  );
}
