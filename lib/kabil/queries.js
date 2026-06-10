/**
 * TanStack Query hooks, one per backend endpoint we use. All requests go
 * through the axios instance in lib/api/client.js (token + error interceptors).
 *
 * Polling: for async pipelines we set `refetchInterval` and stop once the
 * target field/state lands (see docs/ASYNC_AND_POLLING.md).
 */
"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiJson, apiUpload, apiPublic } from "@/lib/api/client";
import {
  TALENT_POOL_SEARCH_MIN_LENGTH,
  TALENT_POOL_SEARCH_DEFAULT_LIMIT,
} from "@/lib/kabil/constants";

/* ── Jobs ──────────────────────────────────────────────────────────────── */

export const useJobs = ({ status, search, page = 1, pageSize = 20 } = {}) => {
  const params = new URLSearchParams();
  if (status) params.set("status", status);
  if (search) params.set("search", search);
  params.set("page", page);
  params.set("page_size", pageSize);
  return useQuery({
    queryKey: ["jobs", { status, search, page, pageSize }],
    queryFn: () => apiJson.get(`/jobs?${params.toString()}`),
  });
};

export const useJob = (jobId, { poll = false } = {}) =>
  useQuery({
    queryKey: ["job", jobId],
    queryFn: () => apiJson.get(`/jobs/${jobId}`),
    enabled: !!jobId,
    // While the job pipeline runs, poll until it's ready for applications.
    refetchInterval: (q) =>
      poll && q.state.data && !q.state.data.ready_for_applications ? 2500 : false,
  });

export const useCreateJob = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body) => apiJson.post("/jobs", body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["jobs"] }),
  });
};

export const useUpdateJobStatus = (jobId) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (status) => apiJson.patch(`/jobs/${jobId}/status`, { status }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["job", jobId] });
      qc.invalidateQueries({ queryKey: ["jobs"] });
    },
  });
};

/**
 * Open a job by id (`draft → open`). This enqueues the job pipeline — embed the
 * JD and AI-generate the WhatsApp screening questions — so it's the trigger the
 * create wizard fires before polling `useJob` for the generated questions.
 */
export const useOpenJob = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (jobId) => apiJson.patch(`/jobs/${jobId}/status`, { status: "open" }),
    onSuccess: (_data, jobId) => {
      qc.invalidateQueries({ queryKey: ["job", jobId] });
      qc.invalidateQueries({ queryKey: ["jobs"] });
    },
  });
};

/** Replace a job's full ordered WhatsApp question list (1..10, unique id/order). */
export const useSaveWhatsAppQuestions = (jobId) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (questions) =>
      apiJson.patch(`/jobs/${jobId}/whatsapp-questions`, { questions }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["job", jobId] }),
  });
};

/* ── Applications ──────────────────────────────────────────────────────── */

export const useApplications = (
  jobId,
  { stage, status, order = "-created_at", page = 1, pageSize = 20 } = {},
) => {
  const params = new URLSearchParams();
  if (stage) params.set("stage", stage);
  if (status) params.set("status", status);
  params.set("order", order);
  params.set("page", page);
  params.set("page_size", pageSize);
  return useQuery({
    queryKey: ["applications", jobId, { stage, status, order, page, pageSize }],
    queryFn: () => apiJson.get(`/jobs/${jobId}/applications?${params.toString()}`),
    enabled: !!jobId,
  });
};

/**
 * Application detail. Pass `poll: true` to keep refetching while a pipeline /
 * scoring run is in flight (similarity not yet "ok").
 */
export const useApplication = (appId, { poll = false } = {}) =>
  useQuery({
    queryKey: ["application", appId],
    queryFn: () => apiJson.get(`/applications/${appId}`),
    enabled: !!appId,
    refetchInterval: (q) => {
      if (!poll) return false;
      const a = q.state.data;
      if (!a) return 2500;
      const ps = a.pipeline_status || {};
      const cvDone = ps.similarity === "ok" || ps.similarity === "failed";
      return cvDone ? false : 2500;
    },
  });

export const useAuditLog = (appId) =>
  useQuery({
    queryKey: ["audit-log", appId],
    queryFn: () => apiJson.get(`/applications/${appId}/audit-log`),
    enabled: !!appId,
  });

/**
 * HR-facing WhatsApp screening transcript for one application. The backend 404s
 * with `whatsapp_conversation_not_found` until the application has entered the
 * `whatsapp` stage and the invite has opened a conversation — we treat that as
 * "no conversation yet" (resolve to `null`) rather than an error. While the
 * conversation is live (not completed/declined) we poll so new replies appear.
 */
export const useWhatsAppConversation = (appId, { enabled = true, poll = false } = {}) =>
  useQuery({
    queryKey: ["whatsapp", appId],
    queryFn: async () => {
      try {
        return await apiJson.get(`/applications/${appId}/whatsapp`);
      } catch (err) {
        if (err?.status === 404) return null;
        throw err;
      }
    },
    enabled: !!appId && enabled,
    refetchInterval: (q) => {
      if (!poll) return false;
      const c = q.state.data;
      // No conversation yet: keep checking so it appears once the invite opens.
      if (!c) return 4000;
      const terminal = c.state === "completed" || c.state === "declined";
      return terminal ? false : 4000;
    },
  });

export const useUpdateStage = (appId) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ stage, reason }) =>
      apiJson.patch(`/applications/${appId}/stage`, { stage, reason }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["application", appId] });
      qc.invalidateQueries({ queryKey: ["applications"] });
    },
  });
};

export const useUpdateStatus = (appId) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ status, reason }) =>
      apiJson.patch(`/applications/${appId}/status`, { status, reason }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["application", appId] });
      qc.invalidateQueries({ queryKey: ["applications"] });
    },
  });
};

/**
 * Board-level stage move: the application id is passed per call (not bound to a
 * hook instance), so a single mutation can serve every draggable card on the
 * pipeline board.
 */
export const useMoveStage = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ appId, stage, reason }) =>
      apiJson.patch(`/applications/${appId}/stage`, { stage, reason }),
    onSuccess: (_data, { appId }) => {
      qc.invalidateQueries({ queryKey: ["application", appId] });
      qc.invalidateQueries({ queryKey: ["applications"] });
    },
  });
};

/** Board-level status change (appId per call) — used to reactivate rejects. */
export const useSetStatus = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ appId, status, reason }) =>
      apiJson.patch(`/applications/${appId}/status`, { status, reason }),
    onSuccess: (_data, { appId }) => {
      qc.invalidateQueries({ queryKey: ["application", appId] });
      qc.invalidateQueries({ queryKey: ["applications"] });
    },
  });
};

/* ── Public apply (anonymous candidate) ────────────────────────────────────── */

/**
 * Public job details by slug for the candidate-facing apply page. Anonymous —
 * no token. The backend returns `410` for an inactive/unknown slug; we don't
 * retry that (a closed posting won't reopen on a refresh).
 */
export const usePublicJob = (slug) =>
  useQuery({
    queryKey: ["public-job", slug],
    queryFn: () => apiPublic.get(`/public/apply/${slug}`),
    enabled: !!slug,
    retry: (count, err) => err?.status !== 410 && count < 1,
    staleTime: 60_000,
  });

/**
 * Submit a candidate application (multipart). Privacy by design: the backend
 * returns an identical `{ reference_number }` for new, duplicate and honeypot
 * submissions, so the UI must NOT branch on "already applied".
 */
export const usePublicApply = (slug) =>
  useMutation({
    mutationFn: ({ pdf, full_name, email, phone, consent, honeypot }) => {
      const fd = new FormData();
      fd.append("pdf", pdf);
      fd.append("full_name", full_name);
      fd.append("email", email);
      fd.append("phone", phone);
      fd.append("consent", consent ? "true" : "false");
      fd.append("honeypot", honeypot ?? "");
      return apiPublic.upload(`/public/apply/${slug}/upload`, fd);
    },
  });

export const useRescore = (appId) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (type) => apiJson.post(`/applications/${appId}/rescore?type=${type}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["application", appId] }),
  });
};

export const useBulkUpload = (jobId) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (files) => {
      const fd = new FormData();
      for (const f of files) fd.append("files", f);
      return apiUpload(`/jobs/${jobId}/applications/bulk-upload`, fd);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["applications", jobId] }),
  });
};

/* ── Talent pool ───────────────────────────────────────────────────────── */

/** Browse the pool: paginated, newest-first. `activeOnly` hides expired entries. */
export const useTalentPool = ({
  activeOnly = true,
  page = 1,
  pageSize = 20,
  enabled = true,
} = {}) => {
  const params = new URLSearchParams();
  params.set("active_only", activeOnly);
  params.set("page", page);
  params.set("page_size", pageSize);
  return useQuery({
    queryKey: ["talent-pool", { activeOnly, page, pageSize }],
    queryFn: () => apiJson.get(`/talent-pool?${params.toString()}`),
    enabled,
  });
};

/**
 * Semantic search over the pool. Disabled until `q` clears the min length so we
 * don't fire on an empty box. Keeps the previous page of hits on screen while a
 * new query is in flight (placeholderData) to avoid a flash of empty results.
 */
export const useTalentPoolSearch = (
  q,
  { limit = TALENT_POOL_SEARCH_DEFAULT_LIMIT, activeOnly = true, enabled = true } = {},
) => {
  const query = (q ?? "").trim();
  const params = new URLSearchParams();
  params.set("q", query);
  params.set("limit", limit);
  params.set("active_only", activeOnly);
  return useQuery({
    queryKey: ["talent-pool-search", { q: query, limit, activeOnly }],
    queryFn: () => apiJson.get(`/talent-pool/search?${params.toString()}`),
    enabled: enabled && query.length >= TALENT_POOL_SEARCH_MIN_LENGTH,
    placeholderData: (prev) => prev,
  });
};

/**
 * Add an existing candidate to the pool (idempotent on the candidate). Pass the
 * application's job as `sourceJobId` for provenance. Used from the pipeline's
 * candidate dialog to collect shortlisted people.
 */
export const useAddToPool = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ candidateId, sourceJobId }) =>
      apiJson.post("/talent-pool/entries", {
        candidate_id: candidateId,
        source_job_id: sourceJobId ?? null,
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["talent-pool"] }),
  });
};

/** Upload a single CV (PDF ≤10 MB) straight into the pool. */
export const useTalentPoolUpload = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (file) => {
      const fd = new FormData();
      fd.append("file", file);
      return apiUpload("/talent-pool/upload", fd);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["talent-pool"] }),
  });
};

/**
 * Source a pooled candidate onto a job — creates a fresh `vector_screen`
 * application (or returns the existing one via `already_existed`).
 */
export const useSourceToJob = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ candidateId, jobId }) =>
      apiJson.post("/talent-pool/source", { candidate_id: candidateId, job_id: jobId }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["applications"] }),
  });
};
