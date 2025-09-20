import AuthCard from "@/components/auth/AuthCard";
import EmailPasswordForm from "@/components/auth/EmailPasswordForm";
import GoogleButtonGSI from "@/components/auth/GoogleButtonGSI";
import Link from "next/link";

export const metadata = { title: "Create your account" };

// helper to grab the first value from string | string[] | undefined
type SP = Record<string, string | string[] | undefined>;
const first = (v: string | string[] | undefined) =>
  typeof v === "string" ? v : Array.isArray(v) ? v[0] : undefined;

export default async function Page({
  searchParams,
}: {
  searchParams?: Promise<SP>;
}) {
  // ✅ await searchParams in Next 15 server components
  const sp = (await searchParams) ?? {};
  const next = first(sp.next) || "/dashboard";

  return (
    <AuthCard title="Create your account" subtitle="Join the alumni network in seconds">
      {/* Primary: Google on top */}
      <GoogleButtonGSI next={next} />

      {/* Premium divider */}
      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs uppercase tracking-wide">
          <span className="bg-card px-2 text-muted-foreground">Or sign up with email</span>
        </div>
      </div>

      {/* Email + password (your form already handles consent) */}
      <EmailPasswordForm mode="signup" next={next} />

      {/* Switch to login */}
      <div className="mt-6 text-center text-sm">
        <span className="text-muted-foreground">Already have an account?</span>{" "}
        <Link
          href={next ? `/login?next=${encodeURIComponent(next)}` : "/login"}
          className="underline underline-offset-4"
        >
          Log in
        </Link>
      </div>

      {/* Disclaimer */}
      <p className="mt-6 text-center  text-xs text-red-600 leading-relaxed max-w-sm mx-auto">
        Registration and login attempts on this portal are restricted to NIT Durgapur Alumni,
        Students and Authorized Representatives. Any unauthorized attempts to register, login, or
        access are prohibited.
      </p>
    </AuthCard>
  );
}
