# Kabil.ai API Reference (Frontend)

The complete HTTP contract for the Kabil.ai backend, written for frontend
engineers. For end-to-end journeys and the async pipeline timing, see
[`WORKFLOWS.md`](./WORKFLOWS.md) and [`ASYNC_AND_POLLING.md`](./ASYNC_AND_POLLING.md).
For the closed sets (stages, statuses, enums), see [`ENUMS.md`](./ENUMS.md).
TypeScript types for every shape below live in
[`kabil-api.types.ts`](./kabil-api.types.ts).

> The backend also serves **live, auto-generated OpenAPI docs** at
> `GET /docs` (Swagger UI) and `GET /openapi.json`. This file is the curated,
> task-oriented companion; the OpenAPI spec is the byte-exact source of truth.

---

## 1. Base URL & environments

| Environment | Base URL |
|---|---|
| Local dev | `http://localhost:8000` |
| Production | _(set by deployment; Railway)_ |

All paths below are relative to the base URL. There is **no `/api` prefix** and
**no version prefix** — routes are mounted at the root (`/auth`, `/jobs`, …).

---

## 2. Authentication

HR endpoints use a **Bearer token** obtained from `POST /auth/login`.

```
Authorization: Bearer <access_token>
```

- The token lives **8 hours** (`expires_at` in the login response). Schedule a
  silent re-login or prompt before it lapses; an expired/revoked token returns
  `401 unauthorized`.
- `POST /auth/logout` revokes the current session server-side.
- The **public apply** route (`/public/apply/...`) is anonymous — no token.

Roles: `admin`, `hiring_manager`. Both can use all HR routes today (no
per-role gating in the current surface).

### CORS / credentials

CORS is restricted to the origins configured on the backend
(`Settings.cors_origins`). Allowed methods: `GET, POST, PATCH, DELETE,
OPTIONS`. Allowed headers: `Authorization`, `Content-Type`, `X-Correlation-ID`.
`allow_credentials` is on. If your Next.js dev origin isn't in the allow-list,
add it to the backend env before debugging CORS.

---

## 3. Conventions

### 3.1 Content types

- JSON endpoints: send `Content-Type: application/json`.
- File endpoints (public apply, bulk upload): send `multipart/form-data`.
  **Do not set `Content-Type` manually** when posting `FormData` from the
  browser — let fetch set the multipart boundary.

### 3.2 IDs & timestamps

- All ids are UUID strings. Timestamps are ISO-8601 UTC strings.
- `null` = not set / unknown.

### 3.3 Scores are percentage strings

Application-level scores come back as **trimmed percentage strings**, not
numbers: `"82%"`, `"67.5%"`, `"35%"` (or `null` before the score lands). This
applies to:

- `similarity_score`, `hard_filter_score` (application list + detail),
- `candidate.authenticity_score`,
- each `scores[].value`,
- the `score` / `weight` numeric leaves **inside** a `scores[].breakdown`.

The values are stored numerically (0–100) on the backend and only formatted on
the way out, so they're directly displayable. When you need to sort or compare
in the UI, `parseFloat("82%") === 82`. Other breakdown leaves (reasoning text,
raw cosine `distance`, counts, skill lists) are unchanged.

> **Exception:** the talent-pool **search** `similarity_score` is a plain
> **number** (`0–100`), not a percentage string — see §7.3.

### 3.4 Pagination

List endpoints accept `page` (≥1, default `1`) and `page_size` (1..100,
default `20`) and return:

```json
{ "items": [ ... ], "total": 137, "page": 1, "page_size": 20 }
```

### 3.5 Correlation ID

Every response carries an `X-Correlation-ID` header, and every **error** body
repeats it as `correlation_id`. You may send your own `X-Correlation-ID` on a
request to thread it through the logs. Surface it in error toasts so support can
trace a report to a server log line.

### 3.6 Status codes you'll see

| Code | Meaning |
|---|---|
| `200` | OK (GET / PATCH success) |
| `201` | Created (talent-pool add / upload) |
| `202` | Accepted — work enqueued asynchronously (job create, status→open, public apply, bulk upload, rescore, talent-pool source) |
| `204` | No content (logout) |
| `400` | Bad request (e.g. invalid email/phone on apply, file-count out of bounds) |
| `401` | Missing/invalid/expired token |
| `404` | Not found (incl. `whatsapp_conversation_not_found`) |
| `409` | Conflict (illegal job status transition) |
| `410` | Gone (inactive/unknown public slug) |
| `413` | Payload too large (CV over the 10 MB cap on talent-pool upload) |
| `422` | Validation error (bad body, illegal stage/status transition) |

---

## 4. Error envelope

Every non-2xx response has the same JSON shape:

```json
{
  "error": "validation_error",
  "message": "Request validation failed.",
  "details": [ /* present on 422 and some domain errors */ ],
  "correlation_id": "8c2a0b14-..."
}
```

- `error` — machine code (`unauthorized`, `not_found`, `conflict`,
  `validation_error`, … or a domain-specific code).
- `message` — human-readable. In **production** the catch-all 500 hides the
  detail; in dev/test it includes the exception type + message.
- `details` — on `422` this is FastAPI's field-level error list (`loc`, `msg`,
  `type`). Use it to map errors back onto form fields.

> See [`kabil-api.types.ts`](./kabil-api.types.ts) → `ApiError`.

---

## 5. Endpoints

### Health

#### `GET /health`
No auth. → `200` `{ "status": "ok", "version": "0.1.0" }`

---

### Auth

#### `POST /auth/login`
No auth. Body `LoginRequest`:
```json
{ "email": "hr@example.com", "password": "••••••••" }
```
→ `200` `LoginResponse`:
```json
{ "access_token": "ey...", "token_type": "bearer", "expires_at": "2026-06-08T20:00:00Z" }
```
Wrong credentials → `401`.

#### `GET /auth/me`
Auth required. → `200` `MeResponse` (id, email, full_name, role, created_at,
last_login_at).

#### `POST /auth/logout`
Auth required. Revokes the session. → `204` (no body).

---

### Dashboard

#### `GET /dashboard`
Auth. Workspace-wide aggregate counts for the HR home screen. No query params —
the system is a single shared workspace, so there's nothing to scope by.
Read-only and cheap; safe to poll/refetch on focus.

→ `200` `DashboardSummaryResponse`:
```json
{
  "jobs": {
    "total": 12,
    "by_status": { "draft": 2, "open": 7, "closed": 3 }
  },
  "applications": {
    "total": 184,
    "by_stage": {
      "vector_screen": 90, "hard_filter": 40,
      "whatsapp": 30, "interview": 20, "done": 4
    },
    "by_status": { "active": 150, "rejected": 30, "accepted": 4 }
  },
  "candidates": { "total": 161 },
  "talent_pool": { "active": 22 }
}
```
- `by_status` / `by_stage` always carry **every** enum value as a key,
  zero-filled — render them directly, no missing-key guards.
- `jobs.total` / `applications.total` equal the sum of their breakdown.
- `candidates.total` counts unique people (one row per email+phone, shared
  across their applications); `talent_pool.active` excludes deactivated entries.

Use the `useDashboard()` hook in `lib/kabil/queries.js`.

The `GET /dashboard` summary feeds the **Overview** cards. The four endpoints
below feed the rest of the home screen (Performance, Candidate Pipeline,
Upcoming Interviews, Pending Feedback). All HR-authed, read-only, safe to poll.

#### `GET /dashboard/performance`
Auth. One row per **non-draft** job (open + closed) for the Performance table,
sorted **at-risk first, then `days_open` descending**.

→ `200` `JobPerformanceResponse`:
```json
{
  "rows": [
    {
      "job_id": "<uuid>", "title": "Product Designer", "status": "open",
      "candidates": 18, "shortlisted": 0, "days_open": 21, "health": "at_risk"
    }
  ]
}
```
- `candidates` / `shortlisted` **exclude archived** stints; `shortlisted` counts
  apps that reached the `done` stage. `days_open` = `(closed_at or now) −
  created_at` in whole days. `health` is `JobHealth` (precedence: shortlisted →
  at-risk → healthy; at-risk = open > 20 days with nobody shortlisted).
- Hook: `usePerformance()`.

#### `GET /dashboard/pipeline`
Auth. Query: `job_id` (uuid, optional — omit for the **All Jobs** view). The
Candidate Pipeline funnel.

→ `200` `CandidatePipelineResponse`:
```json
{
  "job_id": "<uuid|null>",
  "by_bucket": { "sourcing": 3, "screening": 2, "interview": 0, "final_shortlist": 0 },
  "applied": 12, "offers": 0, "conversion_rate": 0.0
}
```
- `by_bucket` counts **active** apps collapsed into the four `PipelineBucket`
  columns, zero-filled (sourcing = vector_screen+hard_filter, screening =
  whatsapp, interview, final_shortlist = done). Conversion: `applied` =
  non-archived apps, `offers` = `accepted`, `conversion_rate` = a 0–100 percent.
- Hook: `useCandidatePipeline(jobId)`.

#### `GET /dashboard/upcoming-interviews`
Auth. Query: `limit` (1..200, default **3**). Nearest booked, future interviews
(soonest first). `total` is the full count of future booked interviews so the
"View all" view knows whether more exist than shown.

→ `200` `UpcomingInterviewsResponse`:
```json
{
  "interviews": [
    {
      "application_id": "<uuid>", "job_id": "<uuid>",
      "candidate_name": "Sara Al-Mansouri", "job_title": "Senior Product Designer",
      "scheduled_start_at": "2026-06-19T10:00:00Z", "scheduled_end_at": "2026-06-19T10:45:00Z",
      "location_type": "zoom", "join_url": "https://zoom.us/j/...",
      "location_text": null, "invitee_timezone": "Asia/Dubai"
    }
  ],
  "total": 7
}
```
- Show `join_url` for virtual meetings, else `location_text`. `invitee_timezone`
  localizes the slot. Hook: `useUpcomingInterviews({ limit })`.

#### `GET /dashboard/pending-feedback`
Auth. Applications stalled at the `interview` stage awaiting a decision — active,
`stage == interview`, last moved **> 3 days ago**. Oldest first.

→ `200` `PendingFeedbackResponse`:
```json
{
  "items": [
    {
      "application_id": "<uuid>", "job_id": "<uuid>",
      "candidate_name": "Rania Khalil", "job_title": "Backend Engineer",
      "stage": "interview", "stage_updated_at": "2026-06-13T09:00:00Z", "days_waiting": 10
    }
  ]
}
```
- `days_waiting` is whole days since `stage_updated_at`. Hook: `usePendingFeedback()`.

---

### Jobs

#### `POST /jobs`
Auth. Body `JobCreateRequest` (see types). Creates a job in `draft`.
→ `202` `{ "id": "<uuid>" }`.
Validation: `country` must be ISO-3166 alpha-2; `currency` 3 letters;
`min_salary ≤ max_salary`; skills ≤50 etc. (→ `422`).
`screening_fields` (optional) is the list of Job-field keys HR ticked to ask
about on WhatsApp; members must come from the allowed set (see
`JobCreateRequest.screening_fields` in the types) or it's a `422`. `min_experience`
is always asked regardless of selection.

#### `POST /jobs/generate-description`
Auth. **AI JD Builder.** Body `JobDescriptionGenerateRequest` — the Role-Basics
fields only (same shape as `JobCreateRequest` minus `job_description` and
`screening_fields`; unknown fields → `422`). Drafts a complete job description
from those fields with Claude. **Synchronous and stateless** — no job is
created; the create-job wizard calls it on the JD Builder step to pre-fill the
description, which HR can then edit.
Query: `regenerate` (bool, default `false`) — bypasses the server-side Claude
cache so a repeat click yields a fresh draft.
→ `200` `{ "job_description": "<text>" }`.
- `503 ai_service_unavailable` if Claude isn't configured.
- `502 job_description_generation_failed` on a transient AI error or an
  unusably short draft.

#### `GET /jobs`
Auth. Query: `status` (`draft|open|closed`), `search` (1..120 chars),
`page`, `page_size`. → `200` `JobListResponse` (paginated `JobListItem`).

#### `GET /jobs/{job_id}`
Auth. → `200` `JobDetail` (full job incl. `whatsapp_questions`,
`screening_fields`, `pipeline_status`, `ready_for_applications`, `public_slug`).

#### `PATCH /jobs/{job_id}/status`
Auth. Body `{ "status": "open" | "closed" }`.
- `draft → open` triggers the **job pipeline** (embed JD + generate WhatsApp
  questions, async). `ready_for_applications` flips `true` when both finish.
  The generated list = one deterministic question per selected `screening_field`
  (categories `commitment`/`salary`, plus the always-on `min_experience`
  background-validation question) + up to 3 AI-authored `background_validation`
  questions that verify work history and hands-on use of the role's required
  skills.
- Illegal transition → `409 conflict`.
- `status` outside `{open, closed}` → `422`.
→ `200` `JobDetail`.

#### `GET /jobs/{job_id}/whatsapp-questions`
Auth. → `200` `{ "questions": WhatsAppQuestion[] }`.

#### `PATCH /jobs/{job_id}/whatsapp-questions`
Auth. Body `{ "questions": WhatsAppQuestion[] }` — the **full ordered list**
(1..15). `order` and `id` must each be unique. → `200` `{ "questions": [...] }`.

---

### Applications (HR)

#### `GET /jobs/{job_id}/applications`
Auth. Query:
- `stage` — `ApplicationStage` filter
- `status` — `ApplicationStatus` filter
- `order` — `ApplicationListOrder` (default `-created_at`)
- `page`, `page_size`

→ `200` `ApplicationListResponse` (paginated `ApplicationListItem`, with the
denormalized `similarity_score` / `hard_filter_score` for sorting/triage).

#### `GET /applications/{application_id}`
Auth. → `200` `ApplicationDetail` — full nested object: candidate snapshot,
current CV reference, denormalized scores, `rejection_reason`,
`pipeline_status`, and the chronological `scores[]` (incl. the synthesized
`authenticity` entry). → `404` if unknown.

#### `GET /applications/{application_id}/audit-log`
Auth. → `200` `AuditLogResponse` (newest-first audit entries).

#### `PATCH /applications/{application_id}/stage`
Auth. Body `{ "stage": ApplicationStage, "reason"?: string }`.
Forward-only transitions (see [`WORKFLOWS.md`](./WORKFLOWS.md) state machine).
- Entering `hard_filter` enqueues **Claude Opus** hard-filter scoring (async).
- Entering `whatsapp` enqueues the **WhatsApp screening invite** (async) — the
  candidate gets the opening greeting + Yes/No interest buttons; the
  conversation then becomes readable via `GET /applications/{id}/whatsapp`.

Illegal edge → `422`. → `200` `ApplicationDetail`.

#### `GET /applications/{application_id}/whatsapp`
Auth. The HR-facing **WhatsApp screening transcript** for one application.
→ `200` `WhatsAppConversationResponse` — the conversation `state`, the
`current_question_index`, the structured `answers[]`, and the full ordered
`messages[]` (oldest-first; both candidate and system messages, with
`direction`, `body`, and button payloads).
→ `404 whatsapp_conversation_not_found` until the application has entered the
`whatsapp` stage **and** the invite has opened a conversation. Poll after
moving to `whatsapp`, or after the candidate replies, to see new messages.

#### `PATCH /applications/{application_id}/status`
Auth. Body `{ "status": ApplicationStatus, "reason"?: string }`.
`active → rejected|accepted`, `rejected → active` (HR override, stage
preserved). `accepted` is terminal. Illegal edge → `422`.
→ `200` `ApplicationDetail`.

#### `PATCH /applications/{application_id}/candidate`
Auth. Edit the candidate's contact details.
Body `{ "full_name": string, "email"?: string|null, "phone"?: string|null }`.
`full_name` required; at least one of `email`/`phone` must remain. `phone` is
normalised to E.164 server-side; `email` is lower-cased. The candidate row is
**shared**, so the edit propagates to every application that person holds.
Allowed only while the application is in the `vector_screen` / `hard_filter`
stage — from `whatsapp` on it's locked (the screening/interview flow owns the
contact channel).
→ `200` `ApplicationDetail` (refreshed).
- `400` `invalid_email` / `invalid_phone` / `contact_required`
- `409` `candidate_identity_conflict` — the new email/phone already belongs to
  another candidate.
- `422` `candidate_contact_locked` — past the editable window
  (`details.stage` carries the current stage).

#### `POST /applications/{application_id}/rescore?type=similarity|hard_filter`
Auth. Query `type` required. Enqueues a forced rescore (bypasses idempotency;
hard_filter also bypasses the Claude cache). → `202`
`{ application_id, type, enqueued: true }`. The new score appears on the detail
endpoint when the worker finishes — poll for it.

#### `POST /jobs/{job_id}/applications/bulk-upload`
Auth. `multipart/form-data` with `files` (1..50 PDFs, ≤10 MB each).
Fail-soft per file. → `202` `BulkUploadResponse`:
- `applications[]` — newly created
- `already_applied[]` — candidate already applied to this job
- `rejected[]` — `{ filename, reason }` (`not_pdf` / `too_large` /
  `duplicate_in_batch` / `parse_failed_no_contact`)

Whole request fails `400` only when file count is out of bounds; `401` without
auth; `422` if the job is closed.

---

### Public apply (anonymous candidate)

#### `GET /public/apply/{slug}`
No auth. The **candidate-facing job view** for a public apply link — render
this before the upload form so the candidate sees the role.
→ `200` `PublicJobResponse` — a trimmed projection of the job (title,
hiring_company, country, city, employment_type, work_mode, salary range,
notice_period, min_experience_years, skills, visa/nationality/languages,
job_description, `status`). **No** HR/internal fields (no `id`, `public_slug`,
`pipeline_status`, `whatsapp_questions`, …).
- `410` — inactive/unknown slug.
- Keep rendering on `status: "closed"` so a stale link shows a "this role is
  closed" state rather than a hard error.

#### `POST /public/apply/{slug}/upload`
No auth. `multipart/form-data` fields:

| Field | Type | Notes |
|---|---|---|
| `pdf` | file | the CV (PDF, ≤10 MB) |
| `email` | text | candidate email |
| `phone` | text | raw phone (normalized server-side to E.164) |
| `full_name` | text | |
| `consent` | text `"true"` | must be truthy |
| `honeypot` | text | hidden anti-bot field — leave empty |

→ `202` `{ "reference_number": "<32-hex>" }`.

**Privacy by design:** the response is identical for new vs. duplicate
submissions and for honeypot hits — never branch UI on "already applied".
- `410` — inactive/unknown slug
- `400` — missing consent, invalid email, invalid phone

The `slug` comes from a job's `public_slug` (on `JobDetail` / `JobListItem`).

---

### Talent Pool (HR)

A holding area of good candidates that aren't tied to a live job. HR can drop
candidates in, upload CVs straight into it, **semantically search** it, and
**source** a pooled candidate onto a specific job (which creates a fresh,
fully-scored application). All routes require HR auth.

#### `POST /talent-pool/entries`
Auth. Body `{ "candidate_id": "<uuid>", "source_job_id"?: "<uuid>" }`.
Adds an **existing** candidate to the pool (idempotent on the candidate).
→ `201` `TalentPoolEntry` (entry + nested candidate snapshot).

#### `POST /talent-pool/upload`
Auth. `multipart/form-data` with a single `file` (PDF, ≤10 MB).
Uploads a CV **directly** into the pool — no job needed. Identity is parsed
from the CV; the candidate is created or matched, then the parse → authenticity
→ embed pipeline runs so they become searchable.
→ `201` `TalentPoolUploadResponse`:
`{ entry, candidate_created, cv_created, enqueued }`.
`enqueued: true` means the embed pipeline was dispatched — the candidate
isn't searchable until it finishes (poll `GET /talent-pool/search`).
- `413` — CV exceeds the 10 MB cap.

#### `GET /talent-pool/search`
Auth. Query: `q` (1..1000 chars, **required**), `limit` (1..50, default 10),
`active_only` (default `true`). Embeds `q` and ranks pooled candidates by
cosine similarity of their current CV.
→ `200` `TalentPoolSearchResponse`:
`{ query, items: TalentPoolSearchResultItem[], total }`. Each item carries a
`similarity_score` — here a plain **number** `0–100` (higher = closer), *not* a
percentage string like the application scores (see §3.3). Candidates whose CV
isn't embedded yet are excluded.

#### `GET /talent-pool`
Auth. Query: `active_only` (default `true`), `page`, `page_size` (1..100,
default 20). → `200` `TalentPoolListResponse`: `{ items, total }` (newest-first).

#### `POST /talent-pool/source`
Auth. Body `{ "candidate_id": "<uuid>", "job_id": "<uuid>" }`.
Sources a pooled candidate onto a job: creates a fresh application at
`vector_screen` (unless one already exists for that candidate+job), flagged
`sourced_from_talent_pool`, then dispatches the CV scoring pipeline.
→ `202` `TalentPoolSourceResponse`:
`{ application_id, candidate_id, job_id, sourced_from_talent_pool,
already_existed, enqueued }`.
- `already_existed: true` → no new application was created and nothing was
  enqueued; the returned `application_id` is the existing one.
- When the application later reaches the `whatsapp` stage, the candidate gets
  a **talent-pool-specific greeting** ("we came across your profile…") instead
  of the "thanks for applying" one.

---

### WhatsApp webhook (Meta → backend, **not** the frontend)

`GET|POST /webhooks/whatsapp` are called by **Meta's Cloud API**, not the
frontend — listed here only so you don't mistake them for a UI surface. The
frontend never calls these. HR reads the resulting conversation through
`GET /applications/{id}/whatsapp` (above).

---

## 6. Quick fetch example (Next.js)

```ts
import type { LoginResponse, JobListResponse } from "@/lib/kabil/types";

const BASE = process.env.NEXT_PUBLIC_KABIL_API!; // e.g. http://localhost:8000

async function login(email: string, password: string): Promise<LoginResponse> {
  const res = await fetch(`${BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) throw await res.json(); // ApiError
  return res.json();
}

async function listJobs(token: string): Promise<JobListResponse> {
  const res = await fetch(`${BASE}/jobs?status=open&page=1&page_size=20`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw await res.json();
  return res.json();
}

// Public apply — note: do NOT set Content-Type for FormData
async function apply(slug: string, form: FormData): Promise<{ reference_number: string }> {
  const res = await fetch(`${BASE}/public/apply/${slug}/upload`, {
    method: "POST",
    body: form, // append pdf, email, phone, full_name, consent
  });
  if (!res.ok) throw await res.json();
  return res.json();
}
```

A reusable typed client wrapper pattern is sketched in
[`WORKFLOWS.md`](./WORKFLOWS.md#appendix-a-minimal-typed-client).
