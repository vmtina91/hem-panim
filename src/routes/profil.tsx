import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { AppShell } from "@/components/hem/AppShell";
import { useAuth, roleLabel, type ProfilePatch } from "@/lib/auth";
import { useI18n, type Lang } from "@/lib/i18n";
import { supabase } from "@/integrations/supabase/client";
import { Upload, Loader2, Save, Trash2 } from "lucide-react";

export const Route = createFileRoute("/profil")({
  head: () => ({ meta: [{ title: "Profil – HEM PANIM" }] }),
  component: ProfilePage,
});

function initials(name: string): string {
  return (name || "?")
    .split(/\s+/)
    .map((n) => n[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function colorFromString(s: string): string {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) % 360;
  return `hsl(${h}, 45%, 35%)`;
}

const PHONE_RE = /^[+()\-\s0-9./]{6,25}$/;

function ProfilePage() {
  const { user, updateProfile, loading } = useAuth();
  const { t, lang, setLang } = useI18n();

  const [name, setName] = useState("");
  const [titleField, setTitleField] = useState("");
  const [organization, setOrganization] = useState("");
  const [phone, setPhone] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [language, setLanguage] = useState<Lang>("hu");
  const [dateFormat, setDateFormat] = useState("YYYY.MM.DD");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!user) return;
    setName(user.name);
    setTitleField(user.title);
    setOrganization(user.organization);
    setPhone(user.phone);
    setBio(user.bio);
    setAvatarUrl(user.avatarUrl);
    setLanguage(user.language);
    setDateFormat(user.dateFormat);
  }, [user]);

  if (loading) return null;
  if (!user) return <Navigate to="/bejelentkezes" />;

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast.error(t("profile.avatar.hint"));
      return;
    }
    setUploading(true);
    const ext = file.name.split(".").pop()?.toLowerCase() || "png";
    const path = `${user.id}/avatar-${Date.now()}.${ext}`;
    const { error: upErr } = await supabase.storage.from("avatars").upload(path, file, {
      cacheControl: "3600",
      upsert: true,
      contentType: file.type,
    });
    if (upErr) {
      setUploading(false);
      toast.error(t("profile.saveError"));
      return;
    }
    // Signed URL — bucket is private
    const { data: signed } = await supabase.storage.from("avatars").createSignedUrl(path, 60 * 60 * 24 * 365);
    setAvatarUrl(signed?.signedUrl ?? null);
    setUploading(false);
    if (fileRef.current) fileRef.current.value = "";
  };

  const removeAvatar = () => {
    setAvatarUrl(null);
  };

  const handleSave = async () => {
    if (phone && !PHONE_RE.test(phone.trim())) {
      toast.error(t("profile.phoneInvalid"));
      return;
    }
    if (bio.length > 300) {
      toast.error(t("profile.bioTooLong"));
      return;
    }
    setSaving(true);
    const patch: ProfilePatch = {
      name: name.trim(),
      title: titleField.trim(),
      organization: organization.trim(),
      phone: phone.trim(),
      bio,
      avatarUrl,
      language,
      dateFormat,
    };
    const res = await updateProfile(patch);
    setSaving(false);
    if (!res.ok) {
      toast.error(t("profile.saveError"));
      return;
    }
    if (language !== lang) setLang(language);
    toast.success(t("profile.saved"));
  };

  return (
    <AppShell title={t("profile.title")} subtitle={t("profile.subtitle")}>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Personal data */}
        <div className="lg:col-span-2 paper-card p-6">
          <div className="mono text-[11px] uppercase tracking-[0.2em] mb-4" style={{ color: "var(--accent)" }}>
            ── {t("profile.section.personal")}
          </div>

          {/* Avatar row */}
          <div className="flex items-center gap-5 mb-6">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={name}
                className="w-20 h-20 object-cover cut-sm"
                style={{ boxShadow: "inset 0 0 0 1px var(--line)" }}
              />
            ) : (
              <div
                className="w-20 h-20 grid place-items-center text-white text-xl font-semibold cut-sm mono"
                style={{ background: colorFromString(name || user.email) }}
              >
                {initials(name || user.email)}
              </div>
            )}
            <div className="flex-1">
              <div className="mono text-[11px] uppercase tracking-[0.16em] mb-1.5" style={{ color: "var(--ink-2)" }}>
                {t("profile.avatar")}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => fileRef.current?.click()}
                  disabled={uploading}
                  className="btn-outline-ink inline-flex items-center gap-2"
                >
                  {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                  {uploading ? t("profile.uploading") : t("profile.avatar.upload")}
                </button>
                {avatarUrl && (
                  <button onClick={removeAvatar} className="btn-outline-ink inline-flex items-center gap-2">
                    <Trash2 className="w-3.5 h-3.5" /> {t("profile.avatar.remove")}
                  </button>
                )}
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/png,image/jpeg"
                  className="hidden"
                  onChange={handleUpload}
                />
              </div>
              <div className="mono text-[11px] mt-1.5" style={{ color: "var(--ink-2)" }}>
                {t("profile.avatar.hint")}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label={t("profile.fullName")}>
              <input value={name} onChange={(e) => setName(e.target.value)} className={inputCls} />
            </Field>
            <Field label={t("profile.titleField")}>
              <input
                value={titleField}
                onChange={(e) => setTitleField(e.target.value)}
                placeholder={t("profile.titleFieldPh")}
                className={inputCls}
              />
            </Field>
            <Field label={t("profile.role")} hint={t("profile.roleHint")}>
              <input value={roleLabel(user.role, t)} readOnly className={`${inputCls} bg-[color:var(--paper-2)]`} />
            </Field>
            <Field label={t("profile.org")}>
              <input value={organization} onChange={(e) => setOrganization(e.target.value)} className={inputCls} />
            </Field>
            <Field label={t("profile.phone")}>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+36 30 123 4567"
                className={inputCls}
              />
            </Field>
            <Field label={t("profile.email")} hint={t("profile.emailHint")}>
              <input value={user.email} readOnly className={`${inputCls} bg-[color:var(--paper-2)]`} />
            </Field>
          </div>

          <div className="mt-4">
            <Field label={t("profile.bio")} hint={`${bio.length}/300`}>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value.slice(0, 300))}
                rows={4}
                className={`${inputCls} resize-none`}
              />
            </Field>
          </div>
        </div>

        {/* App settings */}
        <div className="paper-card p-6 self-start">
          <div className="mono text-[11px] uppercase tracking-[0.2em] mb-4" style={{ color: "var(--accent)" }}>
            ── {t("profile.section.app")}
          </div>

          <Field label={t("profile.language")}>
            <div className="grid grid-cols-2 gap-2">
              {(["hu", "en"] as const).map((l) => (
                <button
                  key={l}
                  type="button"
                  onClick={() => setLanguage(l)}
                  className={`flex items-center justify-center gap-2 text-sm px-3 py-2 border transition-colors cut-xs ${
                    language === l
                      ? "bg-[color:var(--ink)] text-white border-[color:var(--ink)]"
                      : "bg-white border-[color:var(--line)] hover:bg-[color:var(--paper-2)]"
                  }`}
                >
                  <FlagIcon lang={l} />
                  {t(`lang.${l}`)}
                </button>
              ))}
            </div>
          </Field>

          <div className="mt-4">
            <Field label={t("profile.dateFormat")}>
              <select
                value={dateFormat}
                onChange={(e) => setDateFormat(e.target.value)}
                className={inputCls}
              >
                <option value="YYYY.MM.DD">ÉÉÉÉ.HH.NN (2026.07.07)</option>
                <option value="YYYY-MM-DD">YYYY-MM-DD (2026-07-07)</option>
              </select>
            </Field>
          </div>
        </div>
      </div>

      <div className="mt-6 flex justify-end">
        <button onClick={handleSave} disabled={saving} className="btn-signal">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {t("btn.save")}
        </button>
      </div>
    </AppShell>
  );
}

const inputCls =
  "w-full px-3 py-2 text-sm bg-white border border-[color:var(--line)] focus:outline-none focus:border-[color:var(--accent)] focus:ring-2 focus:ring-[color:var(--accent)]/20 transition-all";

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block mono text-[11px] uppercase tracking-[0.16em] mb-1.5" style={{ color: "var(--ink-2)" }}>
        {label}
      </label>
      {children}
      {hint && <div className="mono text-[11px] mt-1" style={{ color: "var(--ink-2)" }}>{hint}</div>}
    </div>
  );
}

function FlagIcon({ lang }: { lang: Lang }) {
  if (lang === "hu") {
    return (
      <svg width="18" height="12" viewBox="0 0 3 2" aria-hidden>
        <rect width="3" height="2" fill="#fff" />
        <rect width="3" height="0.667" fill="#CE2939" />
        <rect y="1.333" width="3" height="0.667" fill="#477050" />
      </svg>
    );
  }
  return (
    <svg width="18" height="12" viewBox="0 0 60 30" aria-hidden>
      <clipPath id="s"><path d="M0,0 v30 h60 v-30 z"/></clipPath>
      <path d="M0,0 v30 h60 v-30 z" fill="#012169"/>
      <path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" strokeWidth="6" clipPath="url(#s)"/>
      <path d="M0,0 L60,30 M60,0 L0,30" stroke="#C8102E" strokeWidth="4" clipPath="url(#s)"/>
      <path d="M30,0 v30 M0,15 h60" stroke="#fff" strokeWidth="10" clipPath="url(#s)"/>
      <path d="M30,0 v30 M0,15 h60" stroke="#C8102E" strokeWidth="6" clipPath="url(#s)"/>
    </svg>
  );
}
