/**
 * Kabil.ai Backend — TypeScript API types
 * ----------------------------------------
 * Hand-maintained mirror of the backend Pydantic schemas and enums.
 * Drop this into your Next.js app (e.g. `lib/kabil/types.ts`) and import
 * the types you need. Keep it in sync when the backend contract changes.
 *
 * Source of truth on the backend:
 *   - src/schemas/*.py        (request/response shapes)
 *   - src/enums/*.py          (closed sets / literals)
 *   - src/api/exception_handlers.py  (error envelope)
 *
 * Conventions
 *   - All ids are UUID strings.
 *   - All timestamps are ISO-8601 strings (UTC, e.g. "2026-06-08T12:34:56.789Z").
 *   - Money amounts (salary) are integers in the job's `currency`.
 *   - `null` means "not set / unknown"; absence of a key (rare) is noted inline.
 */

/* ──────────────────────────────────────────────────────────────────────────
 * Primitives
 * ────────────────────────────────────────────────────────────────────────── */

/** UUID v4 string, e.g. "3f8b...". */
export type UUID = string;
/** ISO-8601 datetime string in UTC. */
export type ISODateTime = string;

/* ──────────────────────────────────────────────────────────────────────────
 * Enums / closed sets
 * ────────────────────────────────────────────────────────────────────────── */

export type UserRole = "admin" | "hiring_manager";

export type JobStatus = "draft" | "open" | "closed";
/** Only these two are accepted by PATCH /jobs/{id}/status. */
export type JobStatusPatch = "open" | "closed";

export type EmploymentType = "permanent" | "contract" | "temporary";
export type WorkMode = "onsite" | "hybrid" | "remote";
export type NoticePeriod = "any" | "immediate" | "30d" | "60d" | "90d";
export type VisaRequirement = "any" | "citizen_or_resident" | "sponsorship_offered";

/** Pipeline stage an application sits in. Forward-only (see WORKFLOWS.md). */
export type ApplicationStage =
  | "vector_screen"
  | "hard_filter"
  | "whatsapp"
  | "interview"
  | "done";

/** Lifecycle flag, orthogonal to stage. */
export type ApplicationStatus = "active" | "rejected" | "accepted";

/** Score families recorded against an application. */
export type ScoreType = "similarity" | "hard_filter" | "authenticity";

/** Model / mechanism that produced a score (`model_used`). Open-ended on the
 *  backend (varchar); these are the values emitted today. */
export type ScoreModel =
  | "claude-opus"
  | "claude-sonnet"
  | "claude-haiku"
  | "openai-text-embedding-3-small"
  | "deterministic"
  | "blended"
  | (string & {}); // future-proof: backend may emit new values

/** Authenticity band derived from the score. authentic ≥75 / review ≥50 / fabricated <50. */
export type AuthenticityBand = "authentic" | "review" | "fabricated";

/** order= query value for the applications list. `-` prefix = descending. */
export type ApplicationListOrder =
  | "-created_at"
  | "created_at"
  | "-similarity_score"
  | "similarity_score"
  | "-hard_filter_score"
  | "hard_filter_score"
  | "-stage_updated_at";

/** type= query value for POST /applications/{id}/rescore. */
export type RescoreType = "similarity" | "hard_filter";

/** Per-file rejection reason in a bulk upload. */
export type BulkUploadRejectionReason =
  | "not_pdf"
  | "too_large"
  | "duplicate_in_batch"
  | "parse_failed_no_contact";

export type WhatsAppQuestionCategory =
  | "background_validation"
  | "skill_assessment"
  | "logistics"
  | "motivation";

/* ──────────────────────────────────────────────────────────────────────────
 * Error envelope (every non-2xx response)
 * ────────────────────────────────────────────────────────────────────────── */

/** Machine-readable error codes the backend emits in `error`. */
export type ErrorCode =
  | "bad_request"
  | "unauthorized"
  | "forbidden"
  | "not_found"
  | "method_not_allowed"
  | "conflict"
  | "unsupported_media_type"
  | "validation_error"
  | "rate_limited"
  | "http_error"
  | "internal_server_error"
  | (string & {}); // domain errors (KabilError) carry their own codes

export interface ApiError {
  error: ErrorCode;
  message: string;
  /** Present on 422 validation errors and some domain errors. */
  details?: unknown;
  /** Always present. Matches the X-Correlation-ID response header. */
  correlation_id: string;
  /** Dev/test only — never present in production. */
  exception?: string;
}

/* ──────────────────────────────────────────────────────────────────────────
 * Pagination envelope
 * ────────────────────────────────────────────────────────────────────────── */

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
}

/* ──────────────────────────────────────────────────────────────────────────
 * Auth
 * ────────────────────────────────────────────────────────────────────────── */

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: "bearer";
  /** Token expiry (8 hours after login). Use this to schedule re-auth. */
  expires_at: ISODateTime;
}

export interface MeResponse {
  id: UUID;
  email: string;
  full_name: string;
  role: UserRole;
  created_at: ISODateTime;
  last_login_at: ISODateTime | null;
}

/* ──────────────────────────────────────────────────────────────────────────
 * Jobs
 * ────────────────────────────────────────────────────────────────────────── */

export interface JobCreateRequest {
  title: string;
  hiring_company: string;
  /** ISO-3166 alpha-2, uppercased server-side (e.g. "AE"). */
  country: string;
  city: string;
  employment_type: EmploymentType;
  work_mode: WorkMode;
  /** ISO-4217, 3 letters (e.g. "AED"). */
  currency: string;
  min_salary?: number | null;
  max_salary?: number | null;
  notice_period?: NoticePeriod | null;
  min_experience_years: number;
  required_skills?: string[];
  preferred_skills?: string[];
  visa_requirement?: VisaRequirement | null;
  nationality_preference?: string[];
  languages_required?: string[];
  job_description: string;
}

export interface JobCreateResponse {
  id: UUID;
}

/** Per-step async pipeline state. Keys appear as steps run; values are the
 *  status. On failure a companion `{step}_error` string key is present. */
export type PipelineStatus = Record<string, "pending" | "ok" | "failed" | string>;

export interface JobListItem {
  id: UUID;
  title: string;
  hiring_company: string;
  status: JobStatus;
  country: string;
  city: string;
  employment_type: EmploymentType;
  work_mode: WorkMode;
  public_slug: string;
  pipeline_status: PipelineStatus;
  ready_for_applications: boolean;
  created_at: ISODateTime;
  updated_at: ISODateTime;
}

export type JobListResponse = Paginated<JobListItem>;

export interface JobDetail {
  id: UUID;
  created_by: UUID;
  title: string;
  hiring_company: string;
  country: string;
  city: string;
  employment_type: EmploymentType;
  work_mode: WorkMode;
  currency: string;
  min_salary: number | null;
  max_salary: number | null;
  notice_period: NoticePeriod | null;
  min_experience_years: number;
  required_skills: string[];
  preferred_skills: string[];
  visa_requirement: VisaRequirement | null;
  nationality_preference: string[];
  languages_required: string[];
  job_description: string;
  whatsapp_questions: WhatsAppQuestion[];
  status: JobStatus;
  public_slug: string;
  pipeline_status: PipelineStatus;
  ready_for_applications: boolean;
  closed_at: ISODateTime | null;
  created_at: ISODateTime;
  updated_at: ISODateTime;
}

export interface JobStatusUpdateRequest {
  status: JobStatusPatch;
}

/* ──────────────────────────────────────────────────────────────────────────
 * WhatsApp screening questions
 * ────────────────────────────────────────────────────────────────────────── */

export interface WhatsAppQuestion {
  /** "q_" + 8 url-safe chars, e.g. "q_Ab12Cd34". */
  id: string;
  /** 1-based display order, 1..10. */
  order: number;
  category: WhatsAppQuestionCategory;
  subcategory: string;
  question_en: string;
  question_ar: string;
  reasoning: string;
  is_ai_generated: boolean;
  source_field: string | null;
}

export interface WhatsAppQuestionsResponse {
  questions: WhatsAppQuestion[];
}

export interface WhatsAppQuestionsUpdateRequest {
  /** Full ordered list (1..10). `order` values must be unique; `id` unique. */
  questions: WhatsAppQuestion[];
}

/* ──────────────────────────────────────────────────────────────────────────
 * Applications
 * ────────────────────────────────────────────────────────────────────────── */

export interface ApplicationScore {
  /** null for the synthesized `authenticity` entry (no backing row). */
  id: UUID | null;
  score_type: ScoreType;
  value: number;
  /** Per-signal detail; shape varies by score_type (see ASYNC_AND_POLLING.md). */
  breakdown: Record<string, unknown>;
  prompt_version: string;
  model_used: ScoreModel;
  computed_at: ISODateTime;
}

export interface CandidateNested {
  id: UUID;
  email: string;
  phone_e164: string;
  full_name: string;
  authenticity_score: number | null;
  authenticity_band: AuthenticityBand | null;
  authenticity_computed_at: ISODateTime | null;
  /** Structured CV (skills, work_history, education, languages,
   *  total_experience_years). `{}` until the parse step runs. */
  parsed_profile: Record<string, unknown>;
}

export interface CvDocumentNested {
  id: UUID;
  blob_url: string;
  blob_sha256: string;
  language: string | null;
  uploaded_at: ISODateTime;
}

export interface ApplicationListItem {
  id: UUID;
  candidate_id: UUID;
  candidate_full_name: string;
  candidate_email: string;
  job_id: UUID;
  stage: ApplicationStage;
  status: ApplicationStatus;
  similarity_score: number | null;
  hard_filter_score: number | null;
  stage_updated_at: ISODateTime;
  created_at: ISODateTime;
}

export type ApplicationListResponse = Paginated<ApplicationListItem>;

export interface ApplicationDetail {
  id: UUID;
  job_id: UUID;
  candidate: CandidateNested;
  cv_document: CvDocumentNested;
  stage: ApplicationStage;
  status: ApplicationStatus;
  similarity_score: number | null;
  hard_filter_score: number | null;
  /** Human-readable rejection summary; null unless rejected (and only for
   *  rows with a populated similarity breakdown). */
  rejection_reason: string | null;
  pipeline_status: PipelineStatus;
  consent_context: Record<string, unknown>;
  consented_at: ISODateTime;
  /** Chronological score history + the synthesized authenticity entry. */
  scores: ApplicationScore[];
  stage_updated_at: ISODateTime;
  created_at: ISODateTime;
  updated_at: ISODateTime;
}

export interface ApplicationStageUpdateRequest {
  stage: ApplicationStage;
  /** Optional HR justification, ≤500 chars; lands in the audit log. */
  reason?: string | null;
}

export interface ApplicationStatusUpdateRequest {
  status: ApplicationStatus;
  reason?: string | null;
}

export interface RescoreResponse {
  application_id: UUID;
  type: RescoreType;
  enqueued: boolean; // always true
}

/* ──────────────────────────────────────────────────────────────────────────
 * Audit log
 * ────────────────────────────────────────────────────────────────────────── */

export interface AuditLogEntry {
  id: UUID;
  user_id: UUID | null;
  entity_type: string;
  entity_id: UUID;
  action: string;
  before_state: Record<string, unknown> | null;
  after_state: Record<string, unknown>;
  ip_address: string | null;
  created_at: ISODateTime;
}

export interface AuditLogResponse {
  /** Newest-first. */
  items: AuditLogEntry[];
  total: number;
}

/* ──────────────────────────────────────────────────────────────────────────
 * Bulk upload (HR)
 * ────────────────────────────────────────────────────────────────────────── */

export interface BulkUploadCreatedApplication {
  application_id: UUID;
  candidate_id: UUID;
  filename: string;
}

export interface BulkUploadAlreadyAppliedItem {
  application_id: UUID;
  candidate_id: UUID;
  filename: string;
}

export interface BulkUploadRejectedItem {
  filename: string;
  reason: BulkUploadRejectionReason;
}

export interface BulkUploadResponse {
  batch_id: UUID;
  accepted_count: number;
  rejected_count: number;
  applications: BulkUploadCreatedApplication[];
  already_applied: BulkUploadAlreadyAppliedItem[];
  rejected: BulkUploadRejectedItem[];
}

/* ──────────────────────────────────────────────────────────────────────────
 * Public apply (anonymous candidate)
 * ────────────────────────────────────────────────────────────────────────── */

/** Multipart form fields for POST /public/apply/{slug}/upload. */
export interface PublicApplyForm {
  pdf: File;
  email: string;
  phone: string;
  full_name: string;
  consent: boolean;
  /** Hidden honeypot field — leave empty for real users. */
  honeypot?: string;
}

export interface PublicApplyResponse {
  /** 32-char hex application id, shown to the candidate. */
  reference_number: string;
}

/* ──────────────────────────────────────────────────────────────────────────
 * Health
 * ────────────────────────────────────────────────────────────────────────── */

export interface HealthResponse {
  status: "ok";
  version: string;
}
