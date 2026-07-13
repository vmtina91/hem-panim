import { createServerFn } from "@tanstack/react-start";

export const ensureSeedAdmin = createServerFn({ method: "POST" }).handler(async () => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const email = "anna.kovacs@demo.hu";
  const password = "demo1234";
  const name = "Kovács Anna";
  const role = "Megfelelésfelelős";

  // Check if user exists (paginate first page; single seed account is enough).
  const { data: existing } = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 200 });
  const found = existing?.users?.find((u) => u.email?.toLowerCase() === email);

  let userId: string | undefined = found?.id;
  if (!found) {
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { name, role },
    });
    if (error && !/already/i.test(error.message)) {
      return { ok: false, error: error.message };
    }
    userId = data?.user?.id;
  }

  if (userId) {
    await supabaseAdmin.from("profiles").upsert(
      { id: userId, name, email, role },
      { onConflict: "id" },
    );
  }
  return { ok: true };
});
