import PrivacyContent from "@/components/legal/PrivacyContent";

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-background mx-auto max-w-3xl p-6 space-y-6">
      <section className="container max-w-3xl py-12 md:py-20">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-center mb-6">
          Privacy Policy
        </h1>
        <p className="text-muted-foreground text-center mb-12">
          How NITDIAN Alumni Network collects, uses, and protects your data.
        </p>
        <PrivacyContent />
      </section>
    </main>
  );
}
