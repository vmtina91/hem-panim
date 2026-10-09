import { createFileRoute, useNavigate, Navigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { useAuth, logAudit, STANDARD_ROLES } from "@/lib/auth";
import { useI18n, type Lang } from "@/lib/i18n";
import { supabase } from "@/integrations/supabase/client";
import { LogIn, AlertCircle, UserPlus, Loader2 } from "lucide-react";
import panimLogo from "@/assets/panim-logo.png.asset.json";

export const Route = createFileRoute("/bejelentkezes")({
  head: () => ({ meta: [{ title: "Bejelentkezés – HEM PANIM" }] }),
  component: LoginPage,
});

type Mode = "login" | "register";

function LoginPage() {
  const { user } = useAuth();
  const { t, lang, setLang } = useI18n();
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<string>("Energetikai tanácsadó");
  const [customRole, setCustomRole] = useState("");
  const [accepted, setAccepted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const emailSchema = z.string().trim().email({ message: t("login.err.email") });
  const passwordSchema = z.string().min(8, { message: t("login.err.password") });

  if (user) return <Navigate to="/" />;

  const switchMode = (m: Mode) => {
    setMode(m);
    setError(null);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const emailRes = emailSchema.safeParse(email);
    if (!emailRes.success) return setError(emailRes.error.issues[0].message);
    if (!password) return setError(t("login.err.passwordEmpty"));
    setBusy(true);
    const { error: err } = await supabase.auth.signInWithPassword({ email: emailRes.data, password });
    setBusy(false);
    if (err) {
      setError(t("login.err.credentials"));
      return;
    }
    navigate({ to: "/" });
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!name.trim()) return setError(t("login.err.name"));
    const emailRes = emailSchema.safeParse(email);
    if (!emailRes.success) return setError(emailRes.error.issues[0].message);
    const pwRes = passwordSchema.safeParse(password);
    if (!pwRes.success) return setError(pwRes.error.issues[0].message);
    if (password !== password2) return setError(t("login.err.pwMatch"));
    const finalRole = role === "Egyéb" ? customRole.trim() : role;
    if (!finalRole) return setError(t("login.err.role"));
    if (!accepted) return setError(t("login.err.terms"));

    setBusy(true);
    const { data, error: err } = await supabase.auth.signUp({
      email: emailRes.data,
      password,
      options: {
        data: { name: name.trim(), role: finalRole },
        emailRedirectTo: window.location.origin,
      },
    });
    setBusy(false);

    if (err) {
      if (/registered|exists|already/i.test(err.message)) {
        setError(t("login.err.exists"));
      } else {
        setError(t("login.err.register"));
      }
      return;
    }

    logAudit("Regisztráció", emailRes.data, `Név: ${name.trim()}`);

    if (data.session) {
      navigate({ to: "/" });
    } else {
      const { error: signErr } = await supabase.auth.signInWithPassword({ email: emailRes.data, password });
      if (signErr) {
        toast.success(t("login.registerSuccess"));
        switchMode("login");
      } else {
        navigate({ to: "/" });
      }
    }
  };

  return (
    <div className="min-h-screen w-full flex items-stretch blueprint-bg">
      {/* Left ink-navy panel — molino-inspired glow */}
      <div
        className="hidden lg:flex relative w-1/2 flex-col justify-between p-12 overflow-hidden"
        style={{
          background:
            "radial-gradient(ellipse at 30% 75%, rgba(37,99,235,0.55) 0%, rgba(14,27,51,0.2) 45%, transparent 70%), radial-gradient(ellipse at 70% 20%, rgba(56,189,248,0.35) 0%, transparent 55%), linear-gradient(160deg, #050B1F 0%, #0E1B33 55%, #050B1F 100%)",
        }}
      >
        {/* Subtle grid */}
        <div
          className="absolute inset-0 opacity-[0.10] pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
        {/* Light streaks */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(circle at 50% 60%, rgba(56,189,248,0.35) 0%, transparent 8%), radial-gradient(circle at 20% 30%, rgba(255,255,255,0.5) 0%, transparent 1.5%), radial-gradient(circle at 80% 70%, rgba(255,255,255,0.4) 0%, transparent 1%), radial-gradient(circle at 60% 15%, rgba(255,255,255,0.35) 0%, transparent 1.2%)",
          }}
        />
        <div
          className="absolute -inset-x-10 bottom-20 h-40 pointer-events-none opacity-70"
          style={{
            background:
              "linear-gradient(90deg, transparent 0%, rgba(56,189,248,0.35) 30%, rgba(255,255,255,0.6) 50%, rgba(37,99,235,0.35) 70%, transparent 100%)",
            filter: "blur(28px)",
            transform: "rotate(-6deg)",
          }}
        />

        <div className="relative flex items-center gap-3 text-white">
          <div className="bg-white p-2 cut-xs">
            <img src={panimLogo.url} alt="PANIM" className="h-9 w-auto object-contain" />
          </div>
          <div>
            <div className="text-[12px] uppercase tracking-[0.28em] font-semibold">HEM PANIM</div>
          </div>
        </div>

        <div className="relative text-white">
          <div className="text-[11px] uppercase tracking-[0.28em] mb-4 font-semibold" style={{ color: "#38BDF8" }}>
            ── {t("login.subsection")}
          </div>
          <div className="text-3xl font-semibold leading-tight max-w-lg tracking-tight">{t("login.tagline")}</div>
          <div className="mt-6 h-[2px] w-16" style={{ background: "#38BDF8" }} />
        </div>

        <div className="relative text-[11px] uppercase tracking-[0.22em] text-white/50">{t("footer.trl")}</div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6 relative">
        {/* Language toggle */}
        <div className="absolute top-4 right-4 flex items-center gap-1 p-0.5 bg-white cut-xs" style={{ boxShadow: "inset 0 0 0 1px var(--line)" }}>
          {(["hu", "en"] as const).map((l) => (
            <button
              key={l}
              onClick={() => setLang(l)}
              className={`mono text-[12px] uppercase tracking-[0.14em] px-3.5 py-2.5 md:px-2.5 md:py-1 min-w-11 min-h-11 md:min-w-0 md:min-h-0 transition-colors ${
                lang === l ? "bg-[color:var(--ink)] text-white" : "text-[color:var(--ink-2)] hover:text-[color:var(--ink)]"
              }`}
              aria-label={t(`lang.${l}`)}
            >
              {l.toUpperCase()}
            </button>
          ))}
        </div>

        <div className="w-full max-w-md">
          <div className="flex flex-col items-center mb-6">
            <div className="bg-white p-4 cut-sm mb-4" style={{ boxShadow: "inset 0 0 0 1px var(--line)" }}>
              <img src={panimLogo.url} alt="PANIM" className="h-16 w-auto object-contain" />
            </div>
            <div className="mono text-[12px] uppercase tracking-[0.22em] font-semibold">HEM PANIM</div>
          </div>

          <div className="paper-card p-6">
            <div className="mono text-[11px] uppercase tracking-[0.22em] mb-1" style={{ color: "var(--accent)" }}>
              ── {mode === "login" ? t("login.title") : t("login.register")}
            </div>
            <h1 className="text-lg font-semibold mb-1">
              {mode === "login" ? t("login.title") : t("login.register")}
            </h1>
            <p className="text-xs mb-5" style={{ color: "var(--ink-2)" }}>
              {mode === "login" ? t("login.subtitle.login") : t("login.subtitle.register")}
            </p>

            {mode === "login" ? (
              <form onSubmit={handleLogin} className="space-y-3">
                <Field label={t("login.email")}>
                  <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className={inputCls} placeholder="nev@pelda.hu" autoComplete="email" />
                </Field>
                <Field label={t("login.password")}>
                  <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className={inputCls} placeholder="••••••••" autoComplete="current-password" />
                </Field>

                {error && <ErrorBox message={error} />}

                <button type="submit" disabled={busy} className="btn-signal w-full min-h-11">
                  {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogIn className="w-4 h-4" />}
                  {t("login.title")}
                </button>

                <button type="button" onClick={() => toast(t("login.forgotDemo"))} className="w-full min-h-11 md:min-h-0 mono text-[12px] uppercase tracking-[0.14em] hover:text-[color:var(--accent)] transition-colors" style={{ color: "var(--ink-2)" }}>
                  {t("login.forgot")}
                </button>

                <div className="text-center text-xs pt-1" style={{ color: "var(--ink-2)" }}>
                  {t("login.noAccount")}{" "}
                  <button type="button" onClick={() => switchMode("register")} className="mono min-h-11 md:min-h-0 inline-flex items-center align-middle uppercase tracking-[0.1em] font-medium hover:text-[color:var(--accent)]" style={{ color: "var(--ink)" }}>
                    {t("login.register")}
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleRegister} className="space-y-3">
                <Field label={t("login.fullName")}>
                  <input type="text" required value={name} onChange={(e) => setName(e.target.value)} className={inputCls} autoComplete="name" />
                </Field>
                <Field label={t("login.email")}>
                  <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className={inputCls} autoComplete="email" />
                </Field>
                <Field label={t("login.role")}>
                  <select value={role} onChange={(e) => setRole(e.target.value)} className={inputCls}>
                    {STANDARD_ROLES.map((r) => (
                      <option key={r} value={r}>{t(`topbar.role.${r}`)}</option>
                    ))}
                    <option value="Egyéb">{t("login.roleOther")}</option>
                  </select>
                </Field>
                {role === "Egyéb" && (
                  <Field label={t("login.roleOtherLabel")}>
                    <input type="text" required value={customRole} onChange={(e) => setCustomRole(e.target.value)} className={inputCls} placeholder={t("login.roleOtherPh")} />
                  </Field>
                )}
                <Field label={t("login.password")}>
                  <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className={inputCls} placeholder={t("login.passwordMin")} autoComplete="new-password" />
                </Field>
                <Field label={t("login.passwordConfirm")}>
                  <input type="password" required value={password2} onChange={(e) => setPassword2(e.target.value)} className={inputCls} autoComplete="new-password" />
                </Field>

                <label className="flex items-start gap-2 text-xs select-none" style={{ color: "var(--ink-2)" }}>
                  <input type="checkbox" checked={accepted} onChange={(e) => setAccepted(e.target.checked)} className="mt-0.5 accent-[color:var(--accent)]" />
                  <span>
                    {t("login.acceptTerms")}{" "}
                    <Link to="/adatkezeles" target="_blank" className="underline hover:text-[color:var(--accent)]" style={{ color: "var(--ink)" }}>
                      {t("login.acceptTermsLink")}
                    </Link>.
                  </span>
                </label>

                {error && <ErrorBox message={error} />}

                <button type="submit" disabled={busy} className="btn-signal w-full min-h-11">
                  {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                  {t("login.register")}
                </button>

                <div className="text-center text-xs pt-1" style={{ color: "var(--ink-2)" }}>
                  {t("login.hasAccount")}{" "}
                  <button type="button" onClick={() => switchMode("login")} className="mono min-h-11 md:min-h-0 inline-flex items-center align-middle uppercase tracking-[0.1em] font-medium hover:text-[color:var(--accent)]" style={{ color: "var(--ink)" }}>
                    {t("login.title")}
                  </button>
                </div>
              </form>
            )}

          </div>

          <div className="text-center mono text-[11px] uppercase tracking-[0.2em] mt-5" style={{ color: "var(--ink-2)" }}>
            {t("footer.trl")}
          </div>
        </div>
      </div>
    </div>
  );
}

const inputCls = "w-full px-3 py-2 text-sm bg-white border focus:outline-none focus:border-[color:var(--accent)] focus:ring-2 focus:ring-[color:var(--accent)]/20 transition-all";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block mono text-[11px] uppercase tracking-[0.16em] mb-1.5" style={{ color: "var(--ink-2)" }}>{label}</label>
      {children}
    </div>
  );
}

function ErrorBox({ message }: { message: string }) {
  return (
    <div className="flex items-start gap-2 p-2.5 cut-xs text-xs" style={{ background: "var(--fail-bg)", color: "var(--fail)", boxShadow: "inset 0 0 0 1px var(--fail-line)" }}>
      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
      <span>{message}</span>
    </div>
  );
}

