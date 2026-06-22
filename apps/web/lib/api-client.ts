const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

6
export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = { ...(options.headers as Record<string, string>) };

  
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