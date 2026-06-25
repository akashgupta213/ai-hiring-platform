const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

async function req<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    ...init,
    credentials: "include",
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export const messagesApi = {
  listConversations: () => req<any[]>("/conversations"),
  getMessages: (cid: string) => req<any[]>(`/conversations/${cid}/messages`),
  send: (cid: string, body: string) =>
    req<any>(`/conversations/${cid}/messages`, {
      method: "POST",
      body: JSON.stringify({ body }),
    }),
  smartReplies: (cid: string) =>
    req<{ replies: string[] }>(`/conversations/${cid}/smart-replies`),
  markRead: (cid: string) =>
    req<void>(`/conversations/${cid}/read`, { method: "POST" }),
};