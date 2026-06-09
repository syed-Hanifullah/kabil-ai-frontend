/**
 * Option lists for the job-creation form selects. Country/currency codes are
 * the wire values the backend expects (ISO-3166 alpha-2 / ISO-4217).
 */

export const COUNTRIES = [
  { code: "AE", label: "United Arab Emirates", flag: "🇦🇪" },
  { code: "SA", label: "Saudi Arabia", flag: "🇸🇦" },
  { code: "QA", label: "Qatar", flag: "🇶🇦" },
  { code: "KW", label: "Kuwait", flag: "🇰🇼" },
  { code: "BH", label: "Bahrain", flag: "🇧🇭" },
  { code: "OM", label: "Oman", flag: "🇴🇲" },
  { code: "EG", label: "Egypt", flag: "🇪🇬" },
  { code: "IN", label: "India", flag: "🇮🇳" },
  { code: "PK", label: "Pakistan", flag: "🇵🇰" },
  { code: "GB", label: "United Kingdom", flag: "🇬🇧" },
  { code: "US", label: "United States", flag: "🇺🇸" },
];

export const CURRENCIES = ["AED", "SAR", "QAR", "KWD", "BHD", "OMR", "USD", "EUR", "GBP", "INR", "PKR", "EGP"];

/** Lookup a country by its ISO-3166 alpha-2 code (the wire value). */
export const countryByCode = (code) => COUNTRIES.find((c) => c.code === code);

/** "AE" → "🇦🇪 United Arab Emirates"; falls back to the raw code. */
export const countryLabel = (code) => {
  const c = countryByCode(code);
  return c ? `${c.flag} ${c.label}` : code || "—";
};

export const LANGUAGES = ["English", "Arabic"];

export const NOTICE_PERIOD_OPTIONS = [
  { value: "any", label: "Any notice period" },
  { value: "immediate", label: "Immediate start" },
  { value: "30d", label: "Up to 30 days" },
  { value: "60d", label: "Up to 60 days" },
  { value: "90d", label: "Up to 90 days" },
];

/**
 * Visa options shown in the UI. `api` maps each to a backend VisaRequirement
 * enum (`any | citizen_or_resident | sponsorship_offered`) since the backend
 * doesn't model these finer distinctions yet.
 */
export const VISA_OPTIONS = [
  { value: "any", api: "any", icon: "🌍", label: "Open to all visas" },
  { value: "residence_visa", api: "citizen_or_resident", icon: "🪪", label: "Must have residence visa" },
  { value: "own_transferable", api: "citizen_or_resident", icon: "📄", label: "Own visa / transferable" },
  { value: "gcc_preferred", api: "citizen_or_resident", icon: "🏳️", label: "GCC Nationals preferred" },
  { value: "citizens_only", api: "citizen_or_resident", icon: "🇦🇪", label: "Citizens only (Emiratization/Saudization)" },
];

export const visaApiValue = (value) =>
  VISA_OPTIONS.find((o) => o.value === value)?.api ?? null;

/**
 * Nationality preference options. The backend field is a string[]; `apiList`
 * is what we send for each choice ("Any" → empty = no preference).
 */
export const NATIONALITY_OPTIONS = [
  { value: "any", icon: "🌍", label: "Any nationality", apiList: [] },
  { value: "arab_preferred", icon: "🌙", label: "Arab nationals preferred", apiList: ["Arab nationals preferred"] },
  { value: "gcc_preferred", icon: "🏳️", label: "GCC nationals preferred", apiList: ["GCC nationals preferred"] },
  { value: "local_only", icon: "🇦🇪", label: "Local nationals only", apiList: ["Local nationals only"] },
];

export const nationalityApiList = (value) =>
  NATIONALITY_OPTIONS.find((o) => o.value === value)?.apiList ?? [];

export const QUESTION_CATEGORIES = [
  { value: "background_validation", label: "Background validation" },
  { value: "skill_assessment", label: "Skill assessment" },
  { value: "logistics", label: "Logistics" },
  { value: "motivation", label: "Motivation" },
];

