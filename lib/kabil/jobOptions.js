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

/**
 * Coerce the wizard form's Role-Basics fields into the backend Role spec shape
 * (the subset shared by `POST /jobs` and `POST /jobs/generate-description`).
 * Excludes `job_description` and the screening toggles — callers add those.
 */
export const toJobSpecPayload = (v) => ({
  title: v.title.trim(),
  hiring_company: v.hiring_company.trim(),
  country: v.country,
  city: v.city.trim(),
  employment_type: v.employment_type,
  work_mode: v.work_mode,
  currency: v.currency,
  min_salary: v.min_salary === "" ? null : Number(v.min_salary),
  max_salary: v.max_salary === "" ? null : Number(v.max_salary),
  notice_period: v.notice_period || null,
  min_experience_years: Number(v.min_experience_years),
  required_skills: v.required_skills,
  preferred_skills: v.preferred_skills,
  visa_requirement: visaApiValue(v.visa_requirement),
  nationality_preference: nationalityApiList(v.nationality_preference),
  languages_required: v.languages_required,
});

export const QUESTION_CATEGORIES = [
  { value: "commitment", label: "Commitment" },
  { value: "salary", label: "Salary" },
  { value: "background_validation", label: "Background validation" },
];

/**
 * Role fields HR can tick "ask on WhatsApp". `key` matches the backend
 * `screening_fields` value; checking one attaches that field's hardcoded
 * question to the job. `min_experience` is a hard filter — always asked and
 * locked on (its checkbox is disabled). `required_skills` is intentionally
 * absent: its question is job-specific and handled separately.
 */
export const SCREENING_FIELDS = [
  { key: "min_salary", label: "Min Salary", category: "salary", defaultOn: true },
  { key: "min_experience", label: "Min Experience", category: "background_validation", defaultOn: true, locked: true },
  { key: "city", label: "City", category: "commitment", defaultOn: false },
  { key: "notice_period", label: "Immediate Join", category: "commitment", defaultOn: true },
  { key: "visa_requirement", label: "Visa Requirement", category: "background_validation", defaultOn: true },
  { key: "nationality_preference", label: "Nationality Preference", category: "background_validation", defaultOn: false },
  { key: "languages_required", label: "Languages Required", category: "background_validation", defaultOn: false },
  { key: "employment_type", label: "Employment Type", category: "commitment", defaultOn: false },
  { key: "work_mode", label: "Work Mode", category: "commitment", defaultOn: true },
];

/** The form's initial `screening` map: { key: defaultOn }. */
export const defaultScreening = () =>
  Object.fromEntries(SCREENING_FIELDS.map((f) => [f.key, f.defaultOn]));

/** Human label for a screening field key (used in the review step). */
export const screeningFieldLabel = (key) =>
  SCREENING_FIELDS.find((f) => f.key === key)?.label ?? key;

/** Human label for a question-category value ("salary" → "Salary"). */
export const questionCategoryLabel = (value) =>
  QUESTION_CATEGORIES.find((c) => c.value === value)?.label ?? value;

