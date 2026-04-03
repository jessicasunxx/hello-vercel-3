import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("is_superadmin, is_matrix_admin")
    .eq("id", user.id)
    .maybeSingle();

  if (error || !profile) {
    redirect("/unauthorized");
  }

  const allowed =
    profile.is_superadmin === true || profile.is_matrix_admin === true;

  if (!allowed) {
    redirect("/unauthorized");
  }

  return { supabase, user };
}
