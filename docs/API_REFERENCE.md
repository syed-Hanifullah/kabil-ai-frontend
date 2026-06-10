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

### Jobs

#### `POST /jobs`
Auth. Body `JobCreateRequest` (see types). Creates a job in `draft`.
→ `202` `{ "id": "<uuid>" }`.
Validation: `country` must be ISO-3166 alpha-2; `currency` 3 letters;
`min_salary ≤ max_salary`; skills ≤50 etc. (→ `422`).

#### `GET /jobs`
Auth. Query: `status` (`draft|open|closed`), `search` (1..120 chars),
`page`, `page_size`. → `200` `JobListResponse` (paginated `JobListItem`).

#### `GET /jobs/{job_id}`
Auth. → `200` `JobDetail` (full job incl. `whatsapp_questions`,
`pipeline_status`, `ready_for_applications`, `public_slug`).

#### `PATCH /jobs/{job_id}/status`
Auth. Body `{ "status": "open" | "closed" }`.
- `draft → open` triggers the **job pipeline** (embed JD + generate WhatsApp
  questions, async). `ready_for_applications` flips `true` when both finish.
- Illegal transition → `409 conflict`.
- `status` outside `{open, closed}` → `422`.
→ `200` `JobDetail`.

#### `GET /jobs/{job_id}/whatsapp-questions`
Auth. → `200` `{ "questions": WhatsAppQuestion[] }`.

#### `PATCH /jobs/{job_id}/whatsapp-questions`
Auth. Body `{ "questions": WhatsAppQuestion[] }` — the **full ordered list**
(1..10). `order` and `id` must each be unique. → `200` `{ "questions": [...] }`.

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
