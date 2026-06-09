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

### 3.3 Pagination

List endpoints accept `page` (≥1, default `1`) and `page_size` (1..100,
default `20`) and return:

```json
{ "items": [ ... ], "total": 137, "page": 1, "page_size": 20 }
```

### 3.4 Correlation ID

Every response carries an `X-Correlation-ID` header, and every **error** body
repeats it as `correlation_id`. You may send your own `X-Correlation-ID` on a
request to thread it through the logs. Surface it in error toasts so support can
trace a report to a server log line.

### 3.5 Status codes you'll see

| Code | Meaning |
|---|---|
| `200` | OK (GET / PATCH success) |
| `202` | Accepted — work enqueued asynchronously (job create, status→open, public apply, bulk upload, rescore) |
| `204` | No content (logout) |
| `400` | Bad request (e.g. invalid email/phone on apply, file-count out of bounds) |
| `401` | Missing/invalid/expired token |
| `404` | Not found |
| `409` | Conflict (illegal job status transition) |
| `410` | Gone (inactive/unknown public slug) |
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
Entering `hard_filter` enqueues **Claude Opus** hard-filter scoring (async).
Illegal edge → `422`. → `200` `ApplicationDetail`.

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
