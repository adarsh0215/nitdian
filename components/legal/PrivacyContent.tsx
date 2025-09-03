"use client";

import Link from "next/link";
import { Separator } from "@/components/ui/separator";

export default function PrivacyContent() {
  const lastUpdated = "September 3, 2025";

  return (
    <article className="space-y-10">
      {/* Meta */}
      {/* <section className="rounded-2xl border bg-card p-4 text-sm text-muted-foreground">
        <p>
          <span className="font-medium text-foreground">Last Updated:</span>{" "}
          {lastUpdated}
        </p>
      </section> */}

      {/* 1. Introduction */}
      <section id="introduction">
        <h2 className="text-xl font-semibold mb-3">1. Introduction</h2>
        <p className="text-muted-foreground leading-relaxed">
          This Privacy Policy explains how the NITDIAN Alumni Network (“we”,
          “us”, “our”) collects, uses, discloses, and safeguards information
          when you use our website and services (“Services”). By using the
          Services, you agree to this Policy. If you do not agree, please
          discontinue use.
        </p>
      </section>
      <Separator />

      {/* 2. Information We Collect */}
      <section id="data-we-collect">
        <h2 className="text-xl font-semibold mb-3">2. Information We Collect</h2>
        <p className="text-muted-foreground leading-relaxed mb-4">
          We collect the following categories of information to provide and
          improve our services:
        </p>
        <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
          <li>
            <span className="font-medium text-foreground">Personal Information:</span>{" "}
            Name, contact details (email, phone), graduation batch, degree or
            program, and professional information like company and designation.
          </li>
          <li>
            <span className="font-medium text-foreground">Technical Information:</span>{" "}
            Device and browser details, cookies, session data, and general
            platform usage analytics.
          </li>
          <li>
            <span className="font-medium text-foreground">Voluntary Submissions:</span>{" "}
            Content you provide voluntarily, such as posts, event registrations,
            uploads, and directory updates.
          </li>
        </ul>
      </section>
      <Separator />

      {/* 3. How We Use Your Information */}
      <section id="how-we-use">
        <h2 className="text-xl font-semibold mb-3">3. How We Use Your Information</h2>
        <p className="text-muted-foreground leading-relaxed mb-4">
          We use the collected data to:
        </p>
        <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
          <li>Maintain alumni records and support networking opportunities.</li>
          <li>
            Communicate updates, upcoming events, and relevant opportunities to
            members.
          </li>
          <li>
            Analyze usage trends to improve our services, features, and
            security.
          </li>
        </ul>
      </section>
      <Separator />

      {/* 4. Information Sharing */}
      <section id="sharing">
        <h2 className="text-xl font-semibold mb-3">4. Information Sharing</h2>
        <p className="text-muted-foreground leading-relaxed mb-4">
          We value your privacy and only share your data in limited scenarios:
        </p>
        <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
          <li>
            <span className="font-medium text-foreground">With Consent:</span>{" "}
            Information will only be shared externally with your explicit
            consent, unless required by law.
          </li>
          <li>
            <span className="font-medium text-foreground">Third-Party Vendors:</span>{" "}
            Vendors such as payment processors, mailing services, or analytics
            providers may access data strictly to deliver specific services and
            must comply with privacy standards.
          </li>
          <li>
            <span className="font-medium text-foreground">Legal Requirements:</span>{" "}
            We may disclose information to comply with applicable laws,
            regulations, or legal requests.
          </li>
        </ul>
      </section>
      <Separator />

      {/* 5. Data Retention */}
      <section id="retention">
        <h2 className="text-xl font-semibold mb-3">5. Data Retention</h2>
        <p className="text-muted-foreground leading-relaxed">
          We retain your personal data only for as long as necessary to fulfill
          the objectives of the Alumni Chapter, such as community engagement and
          events, or as required by law. Once the data is no longer needed, it
          will be securely deleted or anonymized.
        </p>
      </section>
      <Separator />

      {/* 6. Security */}
      <section id="security">
        <h2 className="text-xl font-semibold mb-3">6. Security</h2>
        <p className="text-muted-foreground leading-relaxed">
          We implement reasonable technical and organizational measures to
          protect your information. However, no system is completely immune to
          risks. We continuously work to improve our security practices to
          safeguard member data.
        </p>
      </section>
      <Separator />

      {/* 7. Your Rights */}
      <section id="your-rights">
        <h2 className="text-xl font-semibold mb-3">7. Your Rights</h2>
        <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
          <li>Access, review, or update your personal information.</li>
          <li>
            Request deletion of your account or withdrawal of consent where
            applicable.
          </li>
          <li>
            For requests, please contact{" "}
            <a
              href="mailto:support@nitdian.org"
              className="underline hover:text-primary"
            >
              support@nitdian.org
            </a>
            .
          </li>
        </ul>
      </section>
      <Separator />

      {/* 8. Changes to this Policy */}
      <section id="changes">
        <h2 className="text-xl font-semibold mb-3">8. Changes to this Policy</h2>
        <p className="text-muted-foreground leading-relaxed">
          We may update this Privacy Policy from time to time. Significant
          changes will be communicated via email or in-app notifications. Your
          continued use of the platform constitutes acceptance of these changes.
        </p>
      </section>
      <Separator />

      {/* 9. Contact */}
      <section id="contact">
        <h2 className="text-xl font-semibold mb-3">9. Contact</h2>
        <p className="text-muted-foreground leading-relaxed">
          If you have questions or concerns about this Privacy Policy, please
          reach out to us at{" "}
          <a
            href="mailto:support@nitdian.org"
            className="underline hover:text-primary"
          >
            support@nitdian.org
          </a>
          . You may also refer to our{" "}
          <Link href="/terms" className="underline hover:text-primary">
            Terms &amp; Conditions
          </Link>{" "}
          for additional information.
        </p>
      </section>
    </article>
  );
}
