import { supabaseServer } from "@/lib/supabase/server";
import OnboardingForm from "@/components/onboarding/OnboardingForm";
import { redirect } from "next/navigation";
import { unstable_noStore as noStore } from "next/cache";

export const metadata = { title: "Onboarding" };
export const dynamic = "force-dynamic";

export default async function OnboardingPage() {
  noStore();

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
      <OnboardingForm userEmail={user.email ?? undefined} userId={user.id} />
    </main>
  );
}
