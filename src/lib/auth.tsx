import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { auditLog } from "@/lib/hem-data";
import { ensureSeedAdmin } from "@/lib/seed-admin.functions";

export type Role = string;

export const STANDARD_ROLES = ["Megfelelésfelelős", "Energetikai tanácsadó", "Auditor"] as const;
const VALID_ROLES: readonly string[] = STANDARD_ROLES;
const DEFAULT_ROLE: Role = "Energetikai tanácsadó";

/** Displays the translated label for standard roles, or the custom role text as-is. */
export function roleLabel(role: string, t: (key: string) => string): string {
  return VALID_ROLES.includes(role) ? t(`topbar.role.${role}`) : role;
}

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  role: Role;
  avatarUrl: string | null;
  title: string;
  organization: string;
  phone: string;
  bio: string;
  language: "hu" | "en";
  dateFormat: string;
}

export interface Permissions {
  canUpload: boolean;
  canApprove: boolean;
  canGenerateReport: boolean;
  canRunEvaluation: boolean;
}

export const permissionsFor = (role: Role): Permissions => {
  if (role === "Megfelelésfelelős") return { canUpload: true, canApprove: true, canGenerateReport: true, canRunEvaluation: true };
  if (role === "Energetikai tanácsadó") return { canUpload: true, canApprove: true, canGenerateReport: false, canRunEvaluation: true };
  if (role === "Auditor") return { canUpload: false, canApprove: false, canGenerateReport: false, canRunEvaluation: false };
  // Egyéni ("Egyéb") szerepkör: minden jogosultság elérhető.
  return { canUpload: true, canApprove: true, canGenerateReport: true, canRunEvaluation: true };
};

export interface ProfilePatch {
  name?: string;
  title?: string;
  organization?: string;
  phone?: string;
  bio?: string;
  avatarUrl?: string | null;
  language?: "hu" | "en";
  dateFormat?: string;
}

interface AuthContextValue {
  user: SessionUser | null;
  loading: boolean;
  permissions: Permissions;
  logout: () => Promise<void>;
  updateProfile: (patch: ProfilePatch) => Promise<{ ok: boolean; error?: string }>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function nowStamp() {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}.${pad(d.getMonth() + 1)}.${pad(d.getDate())}. ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function logAudit(action: string, email: string, details = "") {
  auditLog.unshift({
    time: nowStamp(),
    user: email,
    action,
    object: "-",
    details,
  });
}

function normalizeRole(r: unknown): Role {
  if (typeof r === "string" && r.trim()) return r.trim();
  return DEFAULT_ROLE;
}

function normalizeLang(l: unknown): "hu" | "en" {
  return l === "en" ? "en" : "hu";
}

type ProfileRow = {
  id: string;
  name: string | null;
  email: string;
  role: string | null;
  avatar_url: string | null;
  title: string | null;
  organization: string | null;
  phone: string | null;
  bio: string | null;
  language: string | null;
  date_format: string | null;
};

function rowToUser(row: ProfileRow, fallbackEmail: string): SessionUser {
  return {
    id: row.id,
    email: row.email || fallbackEmail,
    name: row.name || fallbackEmail,
    role: normalizeRole(row.role),
    avatarUrl: row.avatar_url ?? null,
    title: row.title ?? "",
    organization: row.organization ?? "",
    phone: row.phone ?? "",
    bio: row.bio ?? "",
    language: normalizeLang(row.language),
    dateFormat: row.date_format || "YYYY.MM.DD",
  };
}

const PROFILE_COLS = "id,name,email,role,avatar_url,title,organization,phone,bio,language,date_format";

async function loadOrCreateProfile(userId: string, email: string, meta: Record<string, unknown>): Promise<SessionUser> {
  const { data } = await supabase.from("profiles").select(PROFILE_COLS).eq("id", userId).maybeSingle();
  if (data) {
    return rowToUser(data as ProfileRow, email);
  }
  const name =
    (meta.name as string) ||
    (meta.full_name as string) ||
    (meta.user_name as string) ||
    email.split("@")[0];
  const role = normalizeRole(meta.role);
  const { data: inserted } = await supabase
    .from("profiles")
    .insert({ id: userId, name, email, role })
    .select(PROFILE_COLS)
    .single();
  if (inserted) return rowToUser(inserted as ProfileRow, email);
  return {
    id: userId,
    email,
    name,
    role,
    avatarUrl: null,
    title: "",
    organization: "",
    phone: "",
    bio: "",
    language: "hu",
    dateFormat: "YYYY.MM.DD",
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);
  const seenAuth = useRef<string | null>(null);

  useEffect(() => {
    ensureSeedAdmin().catch(() => {});

    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT" || !session?.user) {
        setUser(null);
        seenAuth.current = null;
        return;
      }
      const u = session.user;
      setTimeout(() => {
        loadOrCreateProfile(u.id, u.email ?? "", u.user_metadata ?? {}).then((p) => {
          setUser(p);
          if (event === "SIGNED_IN" && seenAuth.current !== u.id) {
            seenAuth.current = u.id;
            logAudit("Bejelentkezés", p.email, `Szerepkör: ${p.role}`);
          }
        });
      }, 0);
    });

    supabase.auth.getSession().then(({ data }) => {
      if (data.session?.user) {
        const u = data.session.user;
        loadOrCreateProfile(u.id, u.email ?? "", u.user_metadata ?? {}).then((p) => {
          setUser(p);
          seenAuth.current = u.id;
          setLoading(false);
        });
      } else {
        setLoading(false);
      }
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  const logout = async () => {
    if (user) logAudit("Kijelentkezés", user.email, `Szerepkör: ${user.role}`);
    await supabase.auth.signOut();
    setUser(null);
  };

  const refreshProfile = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase.from("profiles").select(PROFILE_COLS).eq("id", user.id).maybeSingle();
    if (data) setUser(rowToUser(data as ProfileRow, user.email));
  }, [user]);

  const updateProfile = useCallback(
    async (patch: ProfilePatch): Promise<{ ok: boolean; error?: string }> => {
      if (!user) return { ok: false, error: "No user" };
      const dbPatch: {
        name?: string;
        title?: string;
        organization?: string;
        phone?: string;
        bio?: string;
        avatar_url?: string | null;
        language?: string;
        date_format?: string;
        updated_at?: string;
      } = { updated_at: new Date().toISOString() };
      if (patch.name !== undefined) dbPatch.name = patch.name;
      if (patch.title !== undefined) dbPatch.title = patch.title;
      if (patch.organization !== undefined) dbPatch.organization = patch.organization;
      if (patch.phone !== undefined) dbPatch.phone = patch.phone;
      if (patch.bio !== undefined) dbPatch.bio = patch.bio;
      if (patch.avatarUrl !== undefined) dbPatch.avatar_url = patch.avatarUrl;
      if (patch.language !== undefined) dbPatch.language = patch.language;
      if (patch.dateFormat !== undefined) dbPatch.date_format = patch.dateFormat;

      const { data, error } = await supabase
        .from("profiles")
        .update(dbPatch)
        .eq("id", user.id)
        .select(PROFILE_COLS)
        .single();
      if (error) return { ok: false, error: error.message };
      if (data) setUser(rowToUser(data as ProfileRow, user.email));
      logAudit("Profil módosítása", user.email, `Mezők: ${Object.keys(patch).join(", ")}`);
      return { ok: true };
    },
    [user],
  );

  const permissions = permissionsFor(user?.role ?? "Auditor");

  return (
    <AuthContext.Provider value={{ user, loading, permissions, logout, updateProfile, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
