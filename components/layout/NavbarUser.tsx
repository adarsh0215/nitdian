// components/layout/NavbarUser.tsx
// Server component: the only session-aware part of the navbar.
// Rendered inside <Suspense> in the root layout so the rest of the page can prerender.
import Link from "next/link";
import { Button } from "@/components/ui/button";
import UserPill from "@/components/layout/UserPill";
import { supabaseServer } from "@/lib/supabase/server";

export default async function NavbarUser() {
  const supabase = await supabaseServer();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div className="flex items-center gap-2">
        <Button size="sm" variant="outline" asChild>
          <Link href="/signup">Sign up</Link>
        </Button>
        <Button size="sm" asChild>
          <Link href="/login">Login</Link>
        </Button>
      </div>
    );
  }

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

  return <UserPill name={name} email={email} avatarUrl={profile?.avatar_url ?? null} />;
}
