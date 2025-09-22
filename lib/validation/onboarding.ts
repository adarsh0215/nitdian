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
  "Afghanistan",
  "Albania",
  "Algeria",
  "Andorra",
  "Angola",
  "Antigua and Barbuda",
  "Argentina",
  "Armenia",
  "Australia",
  "Austria",
  "Azerbaijan",
  "Bahamas",
  "Bahrain",
  "Bangladesh",
  "Barbados",
  "Belarus",
  "Belgium",
  "Belize",
  "Benin",
  "Bhutan",
  "Bolivia",
  "Bosnia and Herzegovina",
  "Botswana",
  "Brazil",
  "Brunei",
  "Bulgaria",
  "Burkina Faso",
  "Burundi",
  "Cambodia",
  "Cameroon",
  "Canada",
  "Cape Verde",
  "Central African Republic",
  "Chad",
  "Chile",
  "China",
  "Colombia",
  "Comoros",
  "Congo (Congo-Brazzaville)",
  "Costa Rica",
  "Croatia",
  "Cuba",
  "Cyprus",
  "Czech Republic",
  "Denmark",
  "Djibouti",
  "Dominica",
  "Dominican Republic",
  "Ecuador",
  "Egypt",
  "El Salvador",
  "Equatorial Guinea",
  "Eritrea",
  "Estonia",
  "Eswatini",
  "Ethiopia",
  "Fiji",
  "Finland",
  "France",
  "Gabon",
  "Gambia",
  "Georgia",
  "Germany",
  "Ghana",
  "Greece",
  "Grenada",
  "Guatemala",
  "Guinea",
  "Guinea-Bissau",
  "Guyana",
  "Haiti",
  "Honduras",
  "Hungary",
  "Iceland",
  "Indonesia",
  "Iran",
  "Iraq",
  "Ireland",
  "Israel",
  "Italy",
  "Jamaica",
  "Japan",
  "Jordan",
  "Kazakhstan",
  "Kenya",
  "Kiribati",
  "Kuwait",
  "Kyrgyzstan",
  "Laos",
  "Latvia",
  "Lebanon",
  "Lesotho",
  "Liberia",
  "Libya",
  "Liechtenstein",
  "Lithuania",
  "Luxembourg",
  "Madagascar",
  "Malawi",
  "Malaysia",
  "Maldives",
  "Mali",
  "Malta",
  "Marshall Islands",
  "Mauritania",
  "Mauritius",
  "Mexico",
  "Micronesia",
  "Moldova",
  "Monaco",
  "Mongolia",
  "Montenegro",
  "Morocco",
  "Mozambique",
  "Myanmar (Burma)",
  "Namibia",
  "Nauru",
  "Nepal",
  "Netherlands",
  "New Zealand",
  "Nicaragua",
  "Niger",
  "Nigeria",
  "North Korea",
  "North Macedonia",
  "Norway",
  "Oman",
  "Pakistan",
  "Palau",
  "Palestine",
  "Panama",
  "Papua New Guinea",
  "Paraguay",
  "Peru",
  "Philippines",
  "Poland",
  "Portugal",
  "Qatar",
  "Romania",
  "Russia",
  "Rwanda",
  "Saint Kitts and Nevis",
  "Saint Lucia",
  "Saint Vincent and the Grenadines",
  "Samoa",
  "San Marino",
  "Sao Tome and Principe",
  "Saudi Arabia",
  "Senegal",
  "Serbia",
  "Seychelles",
  "Sierra Leone",
  "Singapore",
  "Slovakia",
  "Slovenia",
  "Solomon Islands",
  "Somalia",
  "South Africa",
  "South Korea",
  "South Sudan",
  "Spain",
  "Sri Lanka",
  "Sudan",
  "Suriname",
  "Sweden",
  "Switzerland",
  "Syria",
  "Taiwan",
  "Tajikistan",
  "Tanzania",
  "Thailand",
  "Timor-Leste",
  "Togo",
  "Tonga",
  "Trinidad and Tobago",
  "Tunisia",
  "Turkey",
  "Turkmenistan",
  "Tuvalu",
  "Uganda",
  "Ukraine",
  "United Arab Emirates",
  "United Kingdom",
  "United States",
  "Uruguay",
  "Uzbekistan",
  "Vanuatu",
  "Vatican City",
  "Venezuela",
  "Vietnam",
  "Yemen",
  "Zambia",
  "Zimbabwe",
  "Other",
] as const;
export type Country = (typeof COUNTRIES)[number];

/* ---------- Countries & Calling Codes ---------- */
export const COUNTRY_CALLING_CODES = [
  { iso: "IN", code: "+91",  label: "India (+91)" }, // always first
  { iso: "AF", code: "+93",  label: "Afghanistan (+93)" },
  { iso: "AL", code: "+355", label: "Albania (+355)" },
  { iso: "DZ", code: "+213", label: "Algeria (+213)" },
  { iso: "AD", code: "+376", label: "Andorra (+376)" },
  { iso: "AO", code: "+244", label: "Angola (+244)" },
  { iso: "AG", code: "+1-268", label: "Antigua and Barbuda (+1-268)" },
  { iso: "AR", code: "+54",  label: "Argentina (+54)" },
  { iso: "AM", code: "+374", label: "Armenia (+374)" },
  { iso: "AU", code: "+61",  label: "Australia (+61)" },
  { iso: "AT", code: "+43",  label: "Austria (+43)" },
  { iso: "AZ", code: "+994", label: "Azerbaijan (+994)" },
  { iso: "BS", code: "+1-242", label: "Bahamas (+1-242)" },
  { iso: "BH", code: "+973", label: "Bahrain (+973)" },
  { iso: "BD", code: "+880", label: "Bangladesh (+880)" },
  { iso: "BB", code: "+1-246", label: "Barbados (+1-246)" },
  { iso: "BY", code: "+375", label: "Belarus (+375)" },
  { iso: "BE", code: "+32",  label: "Belgium (+32)" },
  { iso: "BZ", code: "+501", label: "Belize (+501)" },
  { iso: "BJ", code: "+229", label: "Benin (+229)" },
  { iso: "BT", code: "+975", label: "Bhutan (+975)" },
  { iso: "BO", code: "+591", label: "Bolivia (+591)" },
  { iso: "BA", code: "+387", label: "Bosnia and Herzegovina (+387)" },
  { iso: "BW", code: "+267", label: "Botswana (+267)" },
  { iso: "BR", code: "+55",  label: "Brazil (+55)" },
  { iso: "BN", code: "+673", label: "Brunei (+673)" },
  { iso: "BG", code: "+359", label: "Bulgaria (+359)" },
  { iso: "BF", code: "+226", label: "Burkina Faso (+226)" },
  { iso: "BI", code: "+257", label: "Burundi (+257)" },
  { iso: "KH", code: "+855", label: "Cambodia (+855)" },
  { iso: "CM", code: "+237", label: "Cameroon (+237)" },
  { iso: "CA", code: "+1",   label: "Canada (+1)" },
  { iso: "CV", code: "+238", label: "Cape Verde (+238)" },
  { iso: "CF", code: "+236", label: "Central African Republic (+236)" },
  { iso: "TD", code: "+235", label: "Chad (+235)" },
  { iso: "CL", code: "+56",  label: "Chile (+56)" },
  { iso: "CN", code: "+86",  label: "China (+86)" },
  { iso: "CO", code: "+57",  label: "Colombia (+57)" },
  { iso: "KM", code: "+269", label: "Comoros (+269)" },
  { iso: "CG", code: "+242", label: "Congo (+242)" },
  { iso: "CR", code: "+506", label: "Costa Rica (+506)" },
  { iso: "HR", code: "+385", label: "Croatia (+385)" },
  { iso: "CU", code: "+53",  label: "Cuba (+53)" },
  { iso: "CY", code: "+357", label: "Cyprus (+357)" },
  { iso: "CZ", code: "+420", label: "Czech Republic (+420)" },
  { iso: "DK", code: "+45",  label: "Denmark (+45)" },
  { iso: "DJ", code: "+253", label: "Djibouti (+253)" },
  { iso: "DM", code: "+1-767", label: "Dominica (+1-767)" },
  { iso: "DO", code: "+1-809", label: "Dominican Republic (+1-809)" },
  { iso: "EC", code: "+593", label: "Ecuador (+593)" },
  { iso: "EG", code: "+20",  label: "Egypt (+20)" },
  { iso: "SV", code: "+503", label: "El Salvador (+503)" },
  { iso: "GQ", code: "+240", label: "Equatorial Guinea (+240)" },
  { iso: "ER", code: "+291", label: "Eritrea (+291)" },
  { iso: "EE", code: "+372", label: "Estonia (+372)" },
  { iso: "SZ", code: "+268", label: "Eswatini (+268)" },
  { iso: "ET", code: "+251", label: "Ethiopia (+251)" },
  { iso: "FJ", code: "+679", label: "Fiji (+679)" },
  { iso: "FI", code: "+358", label: "Finland (+358)" },
  { iso: "FR", code: "+33",  label: "France (+33)" },
  { iso: "GA", code: "+241", label: "Gabon (+241)" },
  { iso: "GM", code: "+220", label: "Gambia (+220)" },
  { iso: "GE", code: "+995", label: "Georgia (+995)" },
  { iso: "DE", code: "+49",  label: "Germany (+49)" },
  { iso: "GH", code: "+233", label: "Ghana (+233)" },
  { iso: "GR", code: "+30",  label: "Greece (+30)" },
  { iso: "GD", code: "+1-473", label: "Grenada (+1-473)" },
  { iso: "GT", code: "+502", label: "Guatemala (+502)" },
  { iso: "GN", code: "+224", label: "Guinea (+224)" },
  { iso: "GW", code: "+245", label: "Guinea-Bissau (+245)" },
  { iso: "GY", code: "+592", label: "Guyana (+592)" },
  { iso: "HT", code: "+509", label: "Haiti (+509)" },
  { iso: "HN", code: "+504", label: "Honduras (+504)" },
  { iso: "HU", code: "+36",  label: "Hungary (+36)" },
  { iso: "IS", code: "+354", label: "Iceland (+354)" },
  { iso: "ID", code: "+62",  label: "Indonesia (+62)" },
  { iso: "IR", code: "+98",  label: "Iran (+98)" },
  { iso: "IQ", code: "+964", label: "Iraq (+964)" },
  { iso: "IE", code: "+353", label: "Ireland (+353)" },
  { iso: "IL", code: "+972", label: "Israel (+972)" },
  { iso: "IT", code: "+39",  label: "Italy (+39)" },
  { iso: "JM", code: "+1-876", label: "Jamaica (+1-876)" },
  { iso: "JP", code: "+81",  label: "Japan (+81)" },
  { iso: "JO", code: "+962", label: "Jordan (+962)" },
  { iso: "KZ", code: "+7",   label: "Kazakhstan (+7)" },
  { iso: "KE", code: "+254", label: "Kenya (+254)" },
  { iso: "KI", code: "+686", label: "Kiribati (+686)" },
  { iso: "KW", code: "+965", label: "Kuwait (+965)" },
  { iso: "KG", code: "+996", label: "Kyrgyzstan (+996)" },
  { iso: "LA", code: "+856", label: "Laos (+856)" },
  { iso: "LV", code: "+371", label: "Latvia (+371)" },
  { iso: "LB", code: "+961", label: "Lebanon (+961)" },
  { iso: "LS", code: "+266", label: "Lesotho (+266)" },
  { iso: "LR", code: "+231", label: "Liberia (+231)" },
  { iso: "LY", code: "+218", label: "Libya (+218)" },
  { iso: "LI", code: "+423", label: "Liechtenstein (+423)" },
  { iso: "LT", code: "+370", label: "Lithuania (+370)" },
  { iso: "LU", code: "+352", label: "Luxembourg (+352)" },
  { iso: "MG", code: "+261", label: "Madagascar (+261)" },
  { iso: "MW", code: "+265", label: "Malawi (+265)" },
  { iso: "MY", code: "+60",  label: "Malaysia (+60)" },
  { iso: "MV", code: "+960", label: "Maldives (+960)" },
  { iso: "ML", code: "+223", label: "Mali (+223)" },
  { iso: "MT", code: "+356", label: "Malta (+356)" },
  { iso: "MH", code: "+692", label: "Marshall Islands (+692)" },
  { iso: "MR", code: "+222", label: "Mauritania (+222)" },
  { iso: "MU", code: "+230", label: "Mauritius (+230)" },
  { iso: "MX", code: "+52",  label: "Mexico (+52)" },
  { iso: "FM", code: "+691", label: "Micronesia (+691)" },
  { iso: "MD", code: "+373", label: "Moldova (+373)" },
  { iso: "MC", code: "+377", label: "Monaco (+377)" },
  { iso: "MN", code: "+976", label: "Mongolia (+976)" },
  { iso: "ME", code: "+382", label: "Montenegro (+382)" },
  { iso: "MA", code: "+212", label: "Morocco (+212)" },
  { iso: "MZ", code: "+258", label: "Mozambique (+258)" },
  { iso: "MM", code: "+95",  label: "Myanmar (+95)" },
  { iso: "NA", code: "+264", label: "Namibia (+264)" },
  { iso: "NR", code: "+674", label: "Nauru (+674)" },
  { iso: "NP", code: "+977", label: "Nepal (+977)" },
  { iso: "NL", code: "+31",  label: "Netherlands (+31)" },
  { iso: "NZ", code: "+64",  label: "New Zealand (+64)" },
  { iso: "NI", code: "+505", label: "Nicaragua (+505)" },
  { iso: "NE", code: "+227", label: "Niger (+227)" },
  { iso: "NG", code: "+234", label: "Nigeria (+234)" },
  { iso: "KP", code: "+850", label: "North Korea (+850)" },
  { iso: "MK", code: "+389", label: "North Macedonia (+389)" },
  { iso: "NO", code: "+47",  label: "Norway (+47)" },
  { iso: "OM", code: "+968", label: "Oman (+968)" },
  { iso: "PK", code: "+92",  label: "Pakistan (+92)" },
  { iso: "PW", code: "+680", label: "Palau (+680)" },
  { iso: "PS", code: "+970", label: "Palestine (+970)" },
  { iso: "PA", code: "+507", label: "Panama (+507)" },
  { iso: "PG", code: "+675", label: "Papua New Guinea (+675)" },
  { iso: "PY", code: "+595", label: "Paraguay (+595)" },
  { iso: "PE", code: "+51",  label: "Peru (+51)" },
  { iso: "PH", code: "+63",  label: "Philippines (+63)" },
  { iso: "PL", code: "+48",  label: "Poland (+48)" },
  { iso: "PT", code: "+351", label: "Portugal (+351)" },
  { iso: "QA", code: "+974", label: "Qatar (+974)" },
  { iso: "RO", code: "+40",  label: "Romania (+40)" },
  { iso: "RU", code: "+7",   label: "Russia (+7)" },
  { iso: "RW", code: "+250", label: "Rwanda (+250)" },
  { iso: "KN", code: "+1-869", label: "Saint Kitts and Nevis (+1-869)" },
  { iso: "LC", code: "+1-758", label: "Saint Lucia (+1-758)" },
  { iso: "VC", code: "+1-784", label: "Saint Vincent and the Grenadines (+1-784)" },
  { iso: "WS", code: "+685", label: "Samoa (+685)" },
  { iso: "SM", code: "+378", label: "San Marino (+378)" },
  { iso: "ST", code: "+239", label: "Sao Tome and Principe (+239)" },
  { iso: "SA", code: "+966", label: "Saudi Arabia (+966)" },
  { iso: "SN", code: "+221", label: "Senegal (+221)" },
  { iso: "RS", code: "+381", label: "Serbia (+381)" },
  { iso: "SC", code: "+248", label: "Seychelles (+248)" },
  { iso: "SL", code: "+232", label: "Sierra Leone (+232)" },
  { iso: "SG", code: "+65",  label: "Singapore (+65)" },
  { iso: "SK", code: "+421", label: "Slovakia (+421)" },
  { iso: "SI", code: "+386", label: "Slovenia (+386)" },
  { iso: "SB", code: "+677", label: "Solomon Islands (+677)" },
  { iso: "SO", code: "+252", label: "Somalia (+252)" },
  { iso: "ZA", code: "+27",  label: "South Africa (+27)" },
  { iso: "KR", code: "+82",  label: "South Korea (+82)" },
  { iso: "SS", code: "+211", label: "South Sudan (+211)" },
  { iso: "ES", code: "+34",  label: "Spain (+34)" },
  { iso: "LK", code: "+94",  label: "Sri Lanka (+94)" },
  { iso: "SD", code: "+249", label: "Sudan (+249)" },
  { iso: "SR", code: "+597", label: "Suriname (+597)" },
  { iso: "SE", code: "+46",  label: "Sweden (+46)" },
  { iso: "CH", code: "+41",  label: "Switzerland (+41)" },
  { iso: "SY", code: "+963", label: "Syria (+963)" },
  { iso: "TW", code: "+886", label: "Taiwan (+886)" },
  { iso: "TJ", code: "+992", label: "Tajikistan (+992)" },
  { iso: "TZ", code: "+255", label: "Tanzania (+255)" },
  { iso: "TH", code: "+66",  label: "Thailand (+66)" },
  { iso: "TL", code: "+670", label: "Timor-Leste (+670)" },
  { iso: "TG", code: "+228", label: "Togo (+228)" },
  { iso: "TO", code: "+676", label: "Tonga (+676)" },
  { iso: "TT", code: "+1-868", label: "Trinidad and Tobago (+1-868)" },
  { iso: "TN", code: "+216", label: "Tunisia (+216)" },
  { iso: "TR", code: "+90",  label: "Turkey (+90)" },
  { iso: "TM", code: "+993", label: "Turkmenistan (+993)" },
  { iso: "TV", code: "+688", label: "Tuvalu (+688)" },
  { iso: "UG", code: "+256", label: "Uganda (+256)" },
  { iso: "UA", code: "+380", label: "Ukraine (+380)" },
  { iso: "AE", code: "+971", label: "United Arab Emirates (+971)" },
  { iso: "GB", code: "+44",  label: "United Kingdom (+44)" },
  { iso: "US", code: "+1",   label: "United States (+1)" },
  { iso: "UY", code: "+598", label: "Uruguay (+598)" },
  { iso: "UZ", code: "+998", label: "Uzbekistan (+998)" },
  { iso: "VU", code: "+678", label: "Vanuatu (+678)" },
  { iso: "VA", code: "+379", label: "Vatican City (+379)" },
  { iso: "VE", code: "+58",  label: "Venezuela (+58)" },
  { iso: "VN", code: "+84",  label: "Vietnam (+84)" },
  { iso: "YE", code: "+967", label: "Yemen (+967)" },
  { iso: "ZM", code: "+260", label: "Zambia (+260)" },
  { iso: "ZW", code: "+263", label: "Zimbabwe (+263)" },
] as const;

export type CountryCallingCode = (typeof COUNTRY_CALLING_CODES)[number];

/* ---------- Default Country (India +91) ---------- */
export const DEFAULT_COUNTRY: CountryCallingCode = COUNTRY_CALLING_CODES[0];






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
