const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

// Thin fetch wrapper used by every page that talks to the API.
// `credentials: "include"` is the important bit — it's what makes the
// browser actually send the httpOnly auth cookies on each request.
export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    const message =
      data?.error?.formErrors?.[0] ??
      data?.error?.fieldErrors?.[Object.keys(data?.error?.fieldErrors ?? {})[0]]?.[0] ??
      data?.error ??
      "Request failed";
    throw new Error(typeof message === "string" ? message : "Request failed");
  }

  return data as T;
}
