import TermsContent from "@/components/legal/TermsContent";

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-background mx-auto max-w-3xl p-6 space-y-6">
      <section className="container max-w-3xl py-12 md:py-20">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-center mb-6">
          Terms & Conditions
        </h1>
        <p className="text-muted-foreground text-center mb-12">
          Please read these terms carefully before using the NITDIAN Alumni Network.
        </p>
        <TermsContent />
      </section>
    </main>
  );
}
