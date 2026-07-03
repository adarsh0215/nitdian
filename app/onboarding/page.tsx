import { supabaseServer } from "@/lib/supabase/server";
import ProfileForm from "@/components/profile/ProfileForm";
import { redirect } from "next/navigation";

export const metadata = { title: "Onboarding" };

export default async function OnboardingPage() {
  const supabase = await supabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // If already onboarded, send to dashboard
  const { data: profile } = await supabase
    .from("profiles")
    .select("onboarded")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.onboarded) redirect("/dashboard");

  return (
    <main className="mx-auto max-w-3xl p-6 space-y-6">
      <ProfileForm mode="onboarding" userEmail={user.email ?? undefined} userId={user.id} />
    </main>
  );
}
