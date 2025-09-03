// lib/validation/onboarding.ts
import { z } from "zod";

/* ---------- Option sources ---------- */
export const DEGREES = ["B.Tech", "B.E", "M.E", "M.Tech", "MBA", "PhD", "Other"] as const;

// Gender
export const GENDERS = ["Male", "Female", "Other", "Prefer not to say"] as const;

export const BRANCHES = [
  "Biotechnology",
  "Civil Engineering",
  "Chemical Engineering",
  "Computer Science & Engineering",
  "Chemistry",
  "Electronics & Communication Engineering",
  "Electrical Engineering",
  "Earth & Environmental Studies",
  "Humanities & Social Sciences",
  "Mathematics",
  "Mechanical Engineering",
  "Metallurgical & Materials Engineering",
  "Management Studies",
  "Physics",
] as const;

export const EMPLOYMENT_TYPES = [
  "Employed",
  "Self-Employed",
  "Business", // fixed label
  "NGO/Social",
  "HomeMaker",
  "Not Working",
  "Student",
  "Other",
] as const;

export const INTERESTS = [
  "Networking, Business & Services",
  "Mentorship & Guidance",
  "Jobs & Internships",
  "Exclusive Member Benefits",
  "Community Activities",
  "Nostalgia & Updates",
] as const;

/* ---------- Countries & Calling Codes ---------- */
export const COUNTRIES = [
  "India",
  "United States",
  "United Kingdom",
  "Australia",
  "Singapore",
  "United Arab Emirates",
  "Japan",
  "Germany",
  "France",
  "Switzerland",
  "China",
  "Bangladesh",
  "Canada",
  "Netherlands",
  "Spain",
  "Italy",
  "Sweden",
  "Norway",
  "Denmark",
  "Ireland",
  "New Zealand",
  "South Africa",
  "Saudi Arabia",
  "Qatar",
  "Kuwait",
  "Bahrain",
  "Nepal",
  "Sri Lanka",
  "Pakistan",
  "Indonesia",
  "Malaysia",
  "Philippines",
  "Vietnam",
  "Thailand",
  "South Korea",
  "Turkey",
  "Poland",
  "Portugal",
  "Austria",
  "Belgium",
  "Finland",
  "Greece",
  "Israel",
  "Mexico",
  "Brazil",
  "Argentina",
  "Chile",
  "Nigeria",
  "Kenya",
  "Other",
] as const;
export type Country = (typeof COUNTRIES)[number];

export const COUNTRY_CALLING_CODES = [
  { code: "+91", label: "India (+91)" },
  { code: "+1", label: "United States (+1)" },
  { code: "+44", label: "United Kingdom (+44)" },
  { code: "+61", label: "Australia (+61)" },
  { code: "+65", label: "Singapore (+65)" },
  { code: "+971", label: "UAE (+971)" },
  { code: "+81", label: "Japan (+81)" },
  { code: "+49", label: "Germany (+49)" },
  { code: "+33", label: "France (+33)" },
  { code: "+41", label: "Switzerland (+41)" },
  { code: "+86", label: "China (+86)" },
  { code: "+880", label: "Bangladesh (+880)" },
] as const;

/* ---------- helpers ---------- */
const CURRENT_YEAR = new Date().getFullYear();

const trimOrUndef = (v: unknown) =>
  typeof v === "string" ? (v.trim() === "" ? undefined : v.trim()) : v;

const phoneSanitize = (v: unknown) =>
  typeof v === "string" ? v.replace(/[\s()-]/g, "") : v;

/* E.164-ish (8–15 digits, optional +) */
const phoneRegex = /^\+?[1-9]\d{7,14}$/;

/* ---------- Base Schema (shared) ---------- */
const BaseSchema = z.object({
  // identity (required)
  full_name: z
    .string()
    .transform((s) => s.trim().replace(/\s+/g, " "))
    .pipe(z.string().min(2, "Your full name is required")),
  email: z
    .string()
    .transform((s) => s.trim().toLowerCase())
    .pipe(z.string().email("Enter a valid email")),

  // optional gender
  gender: z.enum(GENDERS).optional(),

  // phone required: sanitize + validate E.164
  phone_e164: z
    .string()
    .min(1, "Phone is required")
    .transform((v) => String(v ?? ""))
    .transform(phoneSanitize)
    .refine((v) => phoneRegex.test(String(v)), {
      message: "Use international format, e.g. +9198xxxxxxx",
    }),

  // address (optional for now)
  city: z.preprocess(trimOrUndef, z.string().optional()),
  // keep as string until you switch UI to Select:
  // country: z.enum(COUNTRIES).optional()
  country: z.preprocess(trimOrUndef, z.string().optional()),

  // education
  graduation_year: z
    .preprocess(
      (v) => (v == null || String(v).trim() === "" ? undefined : v),
      z.coerce.number().int().min(1965, "Enter a valid year").max(CURRENT_YEAR + 3, "Enter a valid year")
    )
    .optional()
    .refine((v) => v !== undefined, { message: "Graduation year is required" })
    .transform((v) => v as number),

  // degree / branch required
  degree: z.enum(DEGREES).optional().refine((v) => v !== undefined, { message: "Degree is required" }),
  branch: z.enum(BRANCHES).optional().refine((v) => v !== undefined, { message: "Branch is required" }),

  roll_number: z.preprocess(trimOrUndef, z.string().optional()),

  // work
  employment_type: z.enum(EMPLOYMENT_TYPES).optional(),
  company: z.preprocess(trimOrUndef, z.string().optional()),
  designation: z.preprocess(trimOrUndef, z.string().optional()),

  // media
  avatar_url: z
    .union([z.string().url(), z.literal(""), z.undefined()])
    .transform((v) => (v === "" ? undefined : v))
    .optional(),

  // interests — at least one required
  interests: z.array(z.enum(INTERESTS)).min(1, "Select at least one area of interest"),

  // directory consents (shared, aligned with your DB columns)
  consent_directory_visible: z.boolean().default(false),
  consent_directory_show_contacts: z.boolean().default(false),
});

// shared directory constraint
const withDirectoryConstraint = <T extends z.ZodTypeAny>(schema: T) =>
  schema.superRefine((rawVal, ctx) => {
    const val = rawVal as {
      consent_directory_show_contacts?: boolean;
      consent_directory_visible?: boolean;
    };
    if (val.consent_directory_show_contacts && !val.consent_directory_visible) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["consent_directory_show_contacts"],
        message: "Enable directory visibility to show your contact details.",
      });
    }
  });

/* ---------- Final Schemas ---------- */
// Onboarding requires Terms = true
export const OnboardingSchema = withDirectoryConstraint(
  BaseSchema.extend({
    consent_terms_privacy: z
      .boolean()
      .refine((v) => v === true, {
        message: "You must accept Terms & Privacy to continue",
      }),
  })
);

// Profile edit: Terms not required (kept for non-destructive compatibility)
export const ProfileSchema = withDirectoryConstraint(
  BaseSchema.extend({
    consent_terms_privacy: z.boolean().optional(),
  })
);

/** Types
 * IMPORTANT: For React Hook Form defaults, we want the *input* type,
 * not the “parsed output” type. This keeps ""/undefined defaults valid at compile-time,
 * while Zod still enforces strict rules on submit.
 */
export type OnboardingInput = z.input<typeof OnboardingSchema>;
export type OnboardingValues = z.input<typeof OnboardingSchema>; // <— used by your form
export type ProfileInput = z.input<typeof ProfileSchema>;
export type ProfileValues = z.output<typeof ProfileSchema>; // not used by onboarding

/** Defaults compatible with the form (allow empty values for required fields) */
export function toFormDefaults(email?: string): OnboardingValues {
  return {
    full_name: "",
    email: email ?? "",
    gender: undefined,

    phone_e164: "", // required -> start empty
    city: "",
    country: "",
    graduation_year: undefined,
    degree: undefined,
    branch: undefined,
    roll_number: "",
    employment_type: undefined,
    company: "",
    designation: "",

    avatar_url: undefined,
    interests: [],

    // Onboarding-only checkbox starts unchecked
    consent_terms_privacy: false,

    // Your UI defaults
    consent_directory_visible: true,
    consent_directory_show_contacts: true,
  };
}
