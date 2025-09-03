"use client";

import { Separator } from "@/components/ui/separator";

export default function TermsContent() {
  return (
    <div className="space-y-10">
      {/* Section 1 */}
      <section>
        <h2 className="text-xl font-semibold mb-3">Introduction</h2>
        <p className="text-muted-foreground leading-relaxed">
          These Terms & Conditions (“Terms”) govern your use of the NIT Durgapur Delhi Chapter Alumni Portal (“Portal”) and associated services. By accessing or using the Portal, you agree to these Terms.
        </p>
      </section>
      <Separator />

      {/* Section 2 */}
      <section>
        <h2 className="text-xl font-semibold mb-3">Eligibility</h2>
        <p className="text-muted-foreground leading-relaxed">
          Access is restricted to NIT Durgapur alumni, current students, faculty, and authorized members of the Delhi Chapter.
        </p>
      </section>
      <Separator />

      {/* Section 3 */}
      <section>
        <h2 className="text-xl font-semibold mb-3">Acceptable Use</h2>
        <p>You agree not to:</p>
        <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
          
          <li>
            Misuse the Portal for unlawful purposes.
          </li>
          <li>
            Avoid sharing false, misleading, or offensive content.
          </li>
          <li>
            Attempt unauthorized access to the Portal or related systems.
          </li>
        </ul>
      </section>
      <Separator />

      {/* Section 4 */}
      <section>
        <h2 className="text-xl font-semibold mb-3">Membership & Contributions</h2>
        <p className="text-muted-foreground leading-relaxed">
          Membership is subject to Delhi Chapter approval and guidelines.{" "}
        </p>
        <p className="text-muted-foreground leading-relaxed">
          Voluntary contributions (including membership fees and donations) are governed by Chapter policies.{" "}
        </p>
      </section>
      <Separator />

      {/* Section 5 */}
      <section>
        <h2 className="text-xl font-semibold mb-3">Events & Activities</h2>
        <p className="text-muted-foreground leading-relaxed">
          Participation in events or programs organized by the Chapter is voluntary and subject to specific event terms.
        </p>
      </section>
      <Separator />

      {/* Section 6 */}
      <section>
        <h2 className="text-xl font-semibold mb-3">Limitation of Liability</h2>
        <p className="mb-1">The Chapter is not responsible for:</p>
        <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
          
          <li>
            Technical interruptions beyond its control.

          </li>
          <li>
            Personal decisions made based on information available on the Portal.
          </li>
          <li>
            Any adverse, impacts, financial loses, physical injuries or damages of any kind while participating in any event or activity conducted by us.
          </li>
          
        </ul>
      </section>
      <Separator />

      {/* Section 7 */}
      <section>
        <h2 className="text-xl font-semibold mb-3">7. Contact</h2>
        <p className="text-muted-foreground leading-relaxed">
          For questions or concerns, please contact us at{" "}
          <a
            href="mailto:support@nitdian.org"
            className="underline hover:text-primary"
          >
            nitdiandelhi@gmail.com
          </a>
          .
        </p>
      </section>
    </div>
  );
}
