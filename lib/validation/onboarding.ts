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
/* ---------- Countries & Calling Codes (India first, iso added for unique keys) ---------- */
export const COUNTRIES = [
  "India", // always first
  "Argentina",
  "Australia",
  "Austria",
  "Bahrain",
  "Bangladesh",
  "Belgium",
  "Brazil",
  "Canada",
  "Chile",
  "China",
  "Denmark",
  "Egypt",
  "Finland",
  "France",
  "Germany",
  "Indonesia",
  "Ireland",
  "Israel",
  "Italy",
  "Japan",
  "Kenya",
  "Kuwait",
  "Mexico",
  "Nepal",
  "Netherlands",
  "New Zealand",
  "Nigeria",
  "Norway",
  "Pakistan",
  "Philippines",
  "Poland",
  "Portugal",
  "Qatar",
  "Russia",
  "Saudi Arabia",
  "Singapore",
  "South Africa",
  "South Korea",
  "Spain",
  "Sri Lanka",
  "Sweden",
  "Switzerland",
  "Thailand",
  "Turkey",
  "United Arab Emirates",
  "United Kingdom",
  "United States",
  "Ukraine",
  "Vietnam",
  "Other",
] as const;
export type Country = (typeof COUNTRIES)[number];

/* ---------- Countries & Calling Codes ---------- */
export const COUNTRY_CALLING_CODES = [
  { iso: "IN", code: "+91",  label: "India (+91)" }, // always first
  { iso: "AR", code: "+54",  label: "Argentina (+54)" },
  { iso: "AU", code: "+61",  label: "Australia (+61)" },
  { iso: "AT", code: "+43",  label: "Austria (+43)" },
  { iso: "BH", code: "+973", label: "Bahrain (+973)" },
  { iso: "BD", code: "+880", label: "Bangladesh (+880)" },
  { iso: "BE", code: "+32",  label: "Belgium (+32)" },
  { iso: "BR", code: "+55",  label: "Brazil (+55)" },
  { iso: "CA", code: "+1",   label: "Canada (+1)" },
  { iso: "CL", code: "+56",  label: "Chile (+56)" },
  { iso: "CN", code: "+86",  label: "China (+86)" },
  { iso: "DK", code: "+45",  label: "Denmark (+45)" },
  { iso: "EG", code: "+20",  label: "Egypt (+20)" },
  { iso: "FI", code: "+358", label: "Finland (+358)" },
  { iso: "FR", code: "+33",  label: "France (+33)" },
  { iso: "DE", code: "+49",  label: "Germany (+49)" },
  { iso: "ID", code: "+62",  label: "Indonesia (+62)" },
  { iso: "IE", code: "+353", label: "Ireland (+353)" },
  { iso: "IL", code: "+972", label: "Israel (+972)" },
  { iso: "IT", code: "+39",  label: "Italy (+39)" },
  { iso: "JP", code: "+81",  label: "Japan (+81)" },
  { iso: "KE", code: "+254", label: "Kenya (+254)" },
  { iso: "KW", code: "+965", label: "Kuwait (+965)" },
  { iso: "MX", code: "+52",  label: "Mexico (+52)" },
  { iso: "NP", code: "+977", label: "Nepal (+977)" },
  { iso: "NL", code: "+31",  label: "Netherlands (+31)" },
  { iso: "NZ", code: "+64",  label: "New Zealand (+64)" },
  { iso: "NG", code: "+234", label: "Nigeria (+234)" },
  { iso: "NO", code: "+47",  label: "Norway (+47)" },
  { iso: "PK", code: "+92",  label: "Pakistan (+92)" },
  { iso: "PH", code: "+63",  label: "Philippines (+63)" },
  { iso: "PL", code: "+48",  label: "Poland (+48)" },
  { iso: "PT", code: "+351", label: "Portugal (+351)" },
  { iso: "QA", code: "+974", label: "Qatar (+974)" },
  { iso: "RU", code: "+7",   label: "Russia (+7)" },
  { iso: "SA", code: "+966", label: "Saudi Arabia (+966)" },
  { iso: "SG", code: "+65",  label: "Singapore (+65)" },
  { iso: "ZA", code: "+27",  label: "South Africa (+27)" },
  { iso: "KR", code: "+82",  label: "South Korea (+82)" },
  { iso: "ES", code: "+34",  label: "Spain (+34)" },
  { iso: "LK", code: "+94",  label: "Sri Lanka (+94)" },
  { iso: "SE", code: "+46",  label: "Sweden (+46)" },
  { iso: "CH", code: "+41",  label: "Switzerland (+41)" },
  { iso: "TH", code: "+66",  label: "Thailand (+66)" },
  { iso: "TR", code: "+90",  label: "Turkey (+90)" },
  { iso: "AE", code: "+971", label: "United Arab Emirates (+971)" },
  { iso: "GB", code: "+44",  label: "United Kingdom (+44)" },
  { iso: "US", code: "+1",   label: "United States (+1)" },
  { iso: "UA", code: "+380", label: "Ukraine (+380)" },
  { iso: "VN", code: "+84",  label: "Vietnam (+84)" },
] as const;

export type CountryCallingCode = (typeof COUNTRY_CALLING_CODES)[number];





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
    country: "India",
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
