import AuthCard from "@/components/auth/AuthCard";
import EmailPasswordForm from "@/components/auth/EmailPasswordForm";
import GoogleButton from "@/components/auth/GoogleButton";
import Link from "next/link";

export const metadata = { title: "Sign in" };

export default function Page({
  searchParams,
}: {
  searchParams?: Record<string, string | string[]>;
}) {
  const next =
    typeof searchParams?.next === "string" && searchParams.next.length > 0
      ? searchParams.next
      : "/dashboard";

  return (
    <AuthCard title="Welcome back" subtitle="Log in to your alumni account">
      {/* Primary: Google on top */}
      <GoogleButton next={next} />

      {/* Premium divider */}
      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs uppercase tracking-wide">
          <span className="bg-card px-2 text-muted-foreground">
            Or continue with email
          </span>
        </div>
      </div>

      {/* Secondary: Email + password */}
      <EmailPasswordForm mode="login" next={next} />

      {/* Auth switch */}
      <div className="mt-6 text-center text-sm">
        <span className="text-muted-foreground">No account yet?</span>{" "}
        <Link
          href={next ? `/signup?next=${encodeURIComponent(next)}` : "/signup"}
          className="underline underline-offset-4"
        >
          Sign up
        </Link>
      </div>

      {/* Disclaimer */}
      <p className="mt-6 text-center text-xs text-muted-foreground leading-relaxed max-w-sm mx-auto">
        Registration and login attempts on this portal are restricted to NIT Durgapur Alumni,
        Students and Authorized Representatives. Any unauthorized attempts to register, login,
        or access are prohibited.
      </p>
    </AuthCard>
  );
}
