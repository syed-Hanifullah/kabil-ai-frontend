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
