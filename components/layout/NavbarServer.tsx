// components/layout/Navbar.server.tsx
import Navbar from "./Navbar";
import { supabaseServer } from "@/lib/supabase/server";
import { unstable_noStore as noStore } from "next/cache";

export default async function NavbarServer() {
  // Prevent any caching of this header; always render with current cookies/session
  noStore();

  const supabase = await supabaseServer();

  // Server has session immediately after OAuth
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return <Navbar initialPill={null} />;

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, avatar_url, email")
    .eq("id", user.id)
    .maybeSingle();

  const email = profile?.email ?? user.email ?? "";
  const name =
    (profile?.full_name && profile.full_name.trim()) ||
    (email ? email.split("@")[0] : "") ||
    "Member";
  const avatarUrl = profile?.avatar_url ?? null;

  return <Navbar initialPill={{ name, email, avatarUrl }} />;
}
