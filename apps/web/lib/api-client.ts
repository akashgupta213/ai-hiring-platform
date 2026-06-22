const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  };

  if (options.body) {
    headers["Content-Type"] = "application/json";
  }

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    credentials: "include",
    headers,
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    const message =
      data?.error?.formErrors?.[0] ||
      data?.error?.message ||
      data?.message ||
      "Request failed";
    throw new Error(typeof message === "string" ? message : "Request failed");
  }

  return data as T;
}

// ── Jobs ─────────────────────────────────────────────────────────────────────

export function getJobs(params?: {
  page?: number;
  limit?: number;
  search?: string;
}) {
  const q = new URLSearchParams();
  if (params?.page) q.set("page", String(params.page));
  if (params?.limit) q.set("limit", String(params.limit));
  if (params?.search) q.set("search", params.search);
  return apiFetch<any>(`/jobs?${q}`);
}

export function getJob(id: string) {
  return apiFetch<any>(`/jobs/${id}`);
}

export function createJob(data: any) {
  return apiFetch<any>("/jobs", { method: "POST", body: JSON.stringify(data) });
}

export function updateJobStatus(id: string, status: string) {
  return apiFetch<any>(`/jobs/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}

export function getCompanyJobs(params?: { page?: number; status?: string }) {
  const q = new URLSearchParams();
  if (params?.page) q.set("page", String(params.page));
  if (params?.status) q.set("status", params.status);
  return apiFetch<any>(`/company/jobs?${q}`);
}

// ── Applications ─────────────────────────────────────────────────────────────

export function applyToJob(jobId: string) {
  return apiFetch<any>(`/applications/${jobId}`, { method: "POST" });
}

export function getMyApplications() {
  return apiFetch<any>("/applications/me");
}

export function getJobApplications(jobId: string) {
  return apiFetch<any>(`/jobs/${jobId}/applications`);
}

export function updateApplicationStatus(id: string, status: string) {
  return apiFetch<any>(`/applications/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}