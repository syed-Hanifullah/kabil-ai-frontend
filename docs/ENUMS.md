# Enums & Constants Reference (Frontend)

Every closed set the API uses, with the exact wire values and what they mean.
These map 1:1 to the TypeScript unions in
[`kabil-api.types.ts`](./kabil-api.types.ts). Treat the **string values** as
the contract — they're persisted and validated server-side; changing one needs
a backend data migration.

---

## User roles — `UserRole`

| Value | Meaning |
|---|---|
| `admin` | Full HR admin. |
| `hiring_manager` | HR user. |

Both roles can use all HR routes today.

---

## Job status — `JobStatus`

| Value | Meaning |
|---|---|
| `draft` | Created, not yet public. Default on create. |
| `open` | Public link live, accepting applications. Opening runs the job pipeline. |
| `closed` | No longer accepting applications. |

`PATCH /jobs/{id}/status` only accepts **`open`** or **`closed`** (`draft` is
server-set on create). Illegal transitions return `409`.

---

## Job descriptors

### `EmploymentType`
`permanent` · `contract` · `temporary`

### `WorkMode`
`onsite` · `hybrid` · `remote`

### `NoticePeriod` (nullable — `null` = not specified)
| Value | Meaning |
|---|---|
| `any` | HM accepts any notice period. |
| `immediate` | Immediate start. |
| `30d` / `60d` / `90d` | Max 30 / 60 / 90 days. |

### `VisaRequirement` (nullable — `null` = not specified)
| Value | Meaning |
|---|---|
| `any` | No preference. |
| `citizen_or_resident` | Must already be authorized. |
| `sponsorship_offered` | Sponsorship available. |

### Other field constraints (from create validation)
| Field | Rule |
|---|---|
| `country` | ISO-3166 alpha-2, uppercased (e.g. `AE`). |
| `currency` | ISO-4217, 3 letters (e.g. `AED`). |
| `min_salary` / `max_salary` | ≥0; `min ≤ max`. |
| `min_experience_years` | 0..50. |
| `required_skills` / `preferred_skills` | ≤50 items, each 1..80 chars. |
| `languages_required` | ≤20 items, each 1..40 chars. |
| `nationality_preference` | ≤50 items, each 1..40 chars. |
| `title` / `hiring_company` | 1..255 chars. |
| `job_description` | 1..20,000 chars. |

---

## Application stage — `ApplicationStage`

The pipeline position. **Forward-only** (see state machine in
[`WORKFLOWS.md`](./WORKFLOWS.md#application-state-machine)).

| Value | Meaning |
|---|---|
| `vector_screen` | Entry stage. Similarity scored; auto-reject runs here. |
| `hard_filter` | Claude Opus CV scoring stage. |
| `whatsapp` | WhatsApp screening (Phase 5). |
| `interview` | Interview scheduling (Phase 6). |
| `done` | Terminal pipeline stage. |

---

## Application status — `ApplicationStatus`

Orthogonal to stage.

| Value | Meaning |
|---|---|
| `active` | In pipeline. |
| `rejected` | Out of pipeline; **stage is preserved** so HR sees where it happened. |
| `accepted` | Terminal — offer accepted. No further transitions. |

---

## Application list ordering — `ApplicationListOrder`

`order=` query value. `-` prefix = descending.

`-created_at` (default) · `created_at` · `-similarity_score` ·
`similarity_score` · `-hard_filter_score` · `hard_filter_score` ·
`-stage_updated_at`

---

## Score families — `ScoreType`

| Value | Computed | Model | Where it lives |
|---|---|---|---|
| `similarity` | Auto (CV pipeline) | OpenAI embedding cosine | `applications.similarity_score` + a score row |
| `hard_filter` | When HR enters `hard_filter` stage (or rescore) | Claude Opus, 5 weighted signals | `applications.hard_filter_score` + a score row |
| `authenticity` | Auto (CV pipeline) | Blended (Haiku + deterministic) | Candidate row; **synthesized** into `scores[]` |

Hard-filter signal weights: skills/experience/industry/regional/role-seniority
= **35/35/10/10/10**.

---

## Score model — `ScoreModel` (`model_used`)

`claude-opus` · `claude-sonnet` · `claude-haiku` ·
`openai-text-embedding-3-small` · `deterministic` · `blended`

Open-ended on the backend (varchar) — treat unknown values gracefully. For the
`authenticity` blended score, per-signal provenance is in each signal's
`computed_by` inside the breakdown.

---

## Authenticity band — `AuthenticityBand`

Derived from the 0–100 authenticity score.

| Band | Range | Suggested UI |
|---|---|---|
| `authentic` | ≥ 75 | green |
| `review` | 50–74 | amber |
| `fabricated` | < 50 | red |

---

## Rescore type — `RescoreType`

`similarity` · `hard_filter` (query param on the rescore endpoint).

---

## Bulk upload rejection reasons — `BulkUploadRejectionReason`

| Value | Meaning / UI copy |
|---|---|
| `not_pdf` | File isn't a valid PDF. |
| `too_large` | Exceeds the 10 MB per-file cap. |
| `duplicate_in_batch` | Same CV appeared twice in this upload. |
| `parse_failed_no_contact` | Couldn't extract enough contact info to create a candidate. |

---

## Limits & defaults (cheat sheet)

| Thing | Value |
|---|---|
| Token lifetime | 8 hours |
| Pagination default `page_size` | 20 |
| Pagination max `page_size` | 100 |
| Bulk upload files per request | 1..50 |
| CV file size cap | 10 MB |
| WhatsApp questions per job | 1..10 |
| Transition `reason` max length | 500 chars |
| Job search query length | 1..120 chars |
| Public reference number | 32 hex chars |
