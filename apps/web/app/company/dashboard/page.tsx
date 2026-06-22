"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getCompanyJobs, createJob, apiFetch } from "@/lib/api-client";

function timeAgo(dateStr: string) {
  const days = Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000);
  if (days === 0) return "Today";
  if (days === 1) return "1d ago";
  if (days < 7) return `${days}d ago`;
  return `${Math.floor(days / 7)}w ago`;
}

const STATUS_PILL: Record<string, { bg: string; color: string }> = {
  open:   { bg: "rgba(63,217,199,0.1)",  color: "#3FD9C7" },
  draft:  { bg: "rgba(242,184,75,0.1)",  color: "#F2B84B" },
  closed: { bg: "rgba(100,116,139,0.1)", color: "#64748B" },
};

export default function CompanyDashboardPage() {
  const router = useRouter();
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [tab, setTab] = useState<"all" | "open" | "draft" | "closed">("all");
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Create job form state
  const [form, setForm] = useState({ title: "", description: "", skillsRequired: [] as string[], status: "open" as "open" | "draft" });
  const [skillInput, setSkillInput] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  async function loadAll(status?: string) {
    setLoading(true);
    setError(null);
    try {
      const [res, me] = await Promise.all([
        getCompanyJobs({ status: status === "all" ? undefined : status }),
        apiFetch<any>("/auth/me"),
      ]);
      setJobs(res.data ?? []);
      setUser(me.user);
    } catch (e: any) {
      // Don't crash — just show empty state
      setJobs([]);
      setError(null);
      try { const me = await apiFetch<any>("/auth/me"); setUser(me.user); } catch {}
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadAll(tab); }, [tab]);

  async function handleCreateJob() {
    if (!form.title.trim() || !form.description.trim() || form.skillsRequired.length === 0) {
      setFormError("Please fill in all fields and add at least one skill.");
      return;
    }
    setSubmitting(true);
    setFormError(null);
    try {
      const job = await createJob(form);
      setJobs((prev) => [job, ...prev]);
      setShowModal(false);
      setForm({ title: "", description: "", skillsRequired: [], status: "open" });
    } catch (e: any) {
      setFormError(e?.message ?? "Failed to create job");
    } finally {
      setSubmitting(false);
    }
  }

  function addSkill() {
    const s = skillInput.trim();
    if (s && !form.skillsRequired.includes(s)) {
      setForm((f) => ({ ...f, skillsRequired: [...f.skillsRequired, s] }));
    }
    setSkillInput("");
  }

  const counts = {
    all: jobs.length,
    open: jobs.filter((j) => j.status === "open").length,
    draft: jobs.filter((j) => j.status === "draft").length,
    closed: jobs.filter((j) => j.status === "closed").length,
  };

  const initials = user?.email?.slice(0, 2).toUpperCase() ?? "CO";

  return (
    <div style={{ minHeight: "100vh", background: "#080C12", color: "#E2E8F0", fontFamily: "system-ui, sans-serif" }}>

      {/* ── Create Job Modal ──────────────────────────────────────── */}
      {showModal && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 100,
          display: "flex", alignItems: "center", justifyContent: "center", padding: 24,
        }}>
          <div style={{
            background: "#0D1117", border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 18, width: "100%", maxWidth: 560,
            maxHeight: "90vh", overflowY: "auto",
          }}>
            <div style={{ padding: "22px 26px", borderBottom: "1px solid rgba(255,255,255,0.08)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h2 style={{ fontSize: 17, fontWeight: 700, color: "#F1F5F9", margin: 0 }}>Post a New Job</h2>
              <button onClick={() => setShowModal(false)} style={{ background: "none", border: "none", color: "#64748B", fontSize: 20, cursor: "pointer", lineHeight: 1 }}>×</button>
            </div>

            <div style={{ padding: "22px 26px", display: "flex", flexDirection: "column", gap: 18 }}>
              {/* Title */}
              <div>
                <label style={{ display: "block", fontSize: 11, color: "#64748B", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 8 }}>Job Title</label>
                <input
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  placeholder="e.g. Senior Frontend Engineer"
                  style={{
                    width: "100%", padding: "11px 14px", borderRadius: 9,
                    background: "#080C12", border: "1px solid rgba(255,255,255,0.1)",
                    color: "#E2E8F0", fontSize: 14, outline: "none", boxSizing: "border-box",
                  }}
                />
              </div>

              {/* Description */}
              <div>
                <label style={{ display: "block", fontSize: 11, color: "#64748B", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 8 }}>Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  rows={5}
                  placeholder="Describe the role, responsibilities, and what makes it exciting…"
                  style={{
                    width: "100%", padding: "11px 14px", borderRadius: 9,
                    background: "#080C12", border: "1px solid rgba(255,255,255,0.1)",
                    color: "#E2E8F0", fontSize: 14, outline: "none",
                    resize: "vertical", boxSizing: "border-box",
                  }}
                />
              </div>

              {/* Skills */}
              <div>
                <label style={{ display: "block", fontSize: 11, color: "#64748B", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 8 }}>Required Skills</label>
                <div style={{ display: "flex", gap: 8 }}>
                  <input
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addSkill(); } }}
                    placeholder="e.g. React"
                    style={{
                      flex: 1, padding: "11px 14px", borderRadius: 9,
                      background: "#080C12", border: "1px solid rgba(255,255,255,0.1)",
                      color: "#E2E8F0", fontSize: 14, outline: "none",
                    }}
                  />
                  <button onClick={addSkill} style={{
                    padding: "11px 16px", borderRadius: 9,
                    border: "1px solid rgba(255,255,255,0.1)", background: "transparent",
                    color: "#94A3B8", fontSize: 13, cursor: "pointer",
                  }}>+ Add</button>
                </div>
                {form.skillsRequired.length > 0 && (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 10 }}>
                    {form.skillsRequired.map((s) => (
                      <span key={s} style={{
                        display: "flex", alignItems: "center", gap: 6,
                        padding: "4px 10px", borderRadius: 6,
                        background: "rgba(242,184,75,0.08)", border: "1px solid rgba(242,184,75,0.2)",
                        color: "#F2B84B", fontSize: 12,
                      }}>
                        {s}
                        <button onClick={() => setForm((f) => ({ ...f, skillsRequired: f.skillsRequired.filter((x) => x !== s) }))}
                          style={{ background: "none", border: "none", color: "#92A2B5", cursor: "pointer", fontSize: 14, lineHeight: 1, padding: 0 }}>×</button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Status */}
              <div>
                <label style={{ display: "block", fontSize: 11, color: "#64748B", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 8 }}>Publish Status</label>
                <select
                  value={form.status}
                  onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as any }))}
                  style={{
                    width: "100%", padding: "11px 14px", borderRadius: 9,
                    background: "#080C12", border: "1px solid rgba(255,255,255,0.1)",
                    color: "#E2E8F0", fontSize: 14, outline: "none",
                  }}>
                  <option value="open">Open — visible to candidates</option>
                  <option value="draft">Draft — hidden for now</option>
                </select>
              </div>

              {formError && (
                <div style={{ padding: "10px 14px", borderRadius: 8, background: "rgba(248,113,113,0.1)", border: "1px solid rgba(248,113,113,0.2)", color: "#fca5a5", fontSize: 13 }}>
                  {formError}
                </div>
              )}

              <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", paddingTop: 4 }}>
                <button onClick={() => setShowModal(false)} style={{
                  padding: "10px 20px", borderRadius: 9, border: "1px solid rgba(255,255,255,0.1)",
                  background: "transparent", color: "#64748B", fontSize: 13, cursor: "pointer",
                }}>Cancel</button>
                <button onClick={handleCreateJob} disabled={submitting} style={{
                  padding: "10px 24px", borderRadius: 9, border: "none",
                  background: "linear-gradient(135deg, #F2B84B, #E09030)",
                  color: "#080C12", fontSize: 13, fontWeight: 700, cursor: "pointer",
                  opacity: submitting ? 0.6 : 1,
                }}>
                  {submitting ? "Posting…" : "Post Job"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Sidebar ─────────────────────────────────────────────────── */}
      <aside style={{
        position: "fixed", top: 0, left: 0, width: 220, height: "100vh",
        background: "#0D1117", borderRight: "1px solid rgba(255,255,255,0.07)",
        display: "flex", flexDirection: "column", zIndex: 40,
      }}>
        <div style={{ padding: "20px 20px 16px", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 8,
              background: "linear-gradient(135deg, #F2B84B, #E09030)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontWeight: 700, fontSize: 12, color: "#080C12",
            }}>AI</div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#E2E8F0" }}>HireAI</div>
              <div style={{ fontSize: 10, color: "#64748B", letterSpacing: "0.05em" }}>COMPANY</div>
            </div>
          </div>
        </div>
        <nav style={{ flex: 1, padding: "12px 12px" }}>
          {[
            { icon: "⊞", label: "Dashboard", href: "/company/dashboard", active: true },
            { icon: "📝", label: "Post a Job", href: "#", active: false, action: () => setShowModal(true) },
          ].map((item) => (
            <button key={item.label}
              onClick={item.action ?? (() => router.push(item.href))}
              style={{
                width: "100%", display: "flex", alignItems: "center", gap: 10,
                padding: "9px 12px", borderRadius: 8, border: "none", cursor: "pointer", marginBottom: 2,
                background: item.active ? "rgba(242,184,75,0.1)" : "transparent",
                color: item.active ? "#F2B84B" : "#64748B",
                fontSize: 13, fontWeight: item.active ? 600 : 400, textAlign: "left",
              }}>
              <span style={{ fontSize: 14 }}>{item.icon}</span>{item.label}
            </button>
          ))}
        </nav>
        <div style={{ padding: "12px 16px", borderTop: "1px solid rgba(255,255,255,0.07)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
            <div style={{
              width: 32, height: 32, borderRadius: "50%",
              background: "linear-gradient(135deg, #F2B84B, #E09030)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 11, fontWeight: 700, color: "#080C12",
            }}>{initials}</div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 12, color: "#E2E8F0", fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {user?.email ?? "…"}
              </div>
              <div style={{ fontSize: 10, color: "#64748B" }}>Company</div>
            </div>
          </div>
          <button onClick={async () => { await apiFetch("/auth/logout", { method: "POST" }).catch(() => {}); router.push("/login"); }} style={{
            width: "100%", padding: "7px 12px", borderRadius: 7,
            border: "1px solid rgba(255,255,255,0.08)", background: "transparent",
            color: "#64748B", fontSize: 12, cursor: "pointer", textAlign: "left",
          }}>Sign out →</button>
        </div>
      </aside>

      {/* ── Main ────────────────────────────────────────────────────── */}
      <main style={{ marginLeft: 220, padding: "32px 36px" }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 32 }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 700, color: "#F1F5F9", margin: 0 }}>Job Postings</h1>
            <p style={{ fontSize: 14, color: "#64748B", margin: "6px 0 0" }}>
              Manage your open roles and review candidates
            </p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            style={{
              display: "flex", alignItems: "center", gap: 8,
              padding: "11px 22px", borderRadius: 10, border: "none",
              background: "linear-gradient(135deg, #F2B84B, #E09030)",
              color: "#080C12", fontSize: 14, fontWeight: 700, cursor: "pointer",
            }}>
            + Post a Job
          </button>
        </div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 32 }}>
          {[
            { label: "Total Jobs", value: counts.all, color: "#94A3B8", bg: "rgba(148,163,184,0.06)" },
            { label: "Open", value: counts.open, color: "#3FD9C7", bg: "rgba(63,217,199,0.06)" },
            { label: "Draft", value: counts.draft, color: "#F2B84B", bg: "rgba(242,184,75,0.06)" },
            { label: "Closed", value: counts.closed, color: "#64748B", bg: "rgba(100,116,139,0.06)" },
          ].map((s) => (
            <div key={s.label} style={{
              background: s.bg, border: `1px solid ${s.color}22`, borderRadius: 14, padding: "20px 22px",
            }}>
              <div style={{ fontSize: 11, color: "#64748B", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 10 }}>{s.label}</div>
              <div style={{ fontSize: 36, fontWeight: 700, color: s.color, lineHeight: 1 }}>
                {loading ? "—" : s.value}
              </div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 4, marginBottom: 24, background: "#0D1117", borderRadius: 10, padding: 4, width: "fit-content", border: "1px solid rgba(255,255,255,0.07)" }}>
          {(["all", "open", "draft", "closed"] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)} style={{
              padding: "7px 18px", borderRadius: 7, border: "none", cursor: "pointer",
              background: tab === t ? "#F2B84B" : "transparent",
              color: tab === t ? "#080C12" : "#64748B",
              fontSize: 12, fontWeight: tab === t ? 700 : 400,
              textTransform: "uppercase", letterSpacing: "0.06em",
              transition: "all 0.15s",
            }}>{t}</button>
          ))}
        </div>

        {/* Jobs */}
        {loading ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
            {[...Array(3)].map((_, i) => (
              <div key={i} style={{ background: "#0D1117", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, height: 200 }} />
            ))}
          </div>
        ) : jobs.length === 0 ? (
          <div style={{
            textAlign: "center", padding: "80px 40px",
            background: "#0D1117", border: "1px dashed rgba(242,184,75,0.2)", borderRadius: 16,
          }}>
            <div style={{ fontSize: 40, marginBottom: 16 }}>📋</div>
            <h2 style={{ fontSize: 18, fontWeight: 600, color: "#F1F5F9", margin: "0 0 8px" }}>No jobs posted yet</h2>
            <p style={{ fontSize: 14, color: "#64748B", margin: "0 0 24px" }}>
              Post your first role and let AI rank candidates by semantic fit
            </p>
            <button onClick={() => setShowModal(true)} style={{
              padding: "12px 28px", borderRadius: 10, border: "none",
              background: "linear-gradient(135deg, #F2B84B, #E09030)",
              color: "#080C12", fontSize: 14, fontWeight: 700, cursor: "pointer",
            }}>+ Post a Job</button>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
            {jobs.map((job) => {
              const pill = STATUS_PILL[job.status] ?? STATUS_PILL.closed;
              return (
                <div key={job.id}
                  onClick={() => router.push(`/company/jobs/${job.id}`)}
                  style={{
                    background: "#0D1117", border: "1px solid rgba(255,255,255,0.07)",
                    borderRadius: 14, padding: "20px 22px", cursor: "pointer",
                    transition: "border-color 0.2s",
                  }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                    <div style={{
                      width: 38, height: 38, borderRadius: 9,
                      background: "rgba(242,184,75,0.1)", border: "1px solid rgba(242,184,75,0.2)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 16,
                    }}>💼</div>
                    <span style={{
                      padding: "3px 10px", borderRadius: 20,
                      background: pill.bg, color: pill.color,
                      fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em",
                    }}>{job.status}</span>
                  </div>

                  <h3 style={{ fontSize: 15, fontWeight: 600, color: "#F1F5F9", margin: "0 0 8px", lineHeight: 1.3 }}>
                    {job.title}
                  </h3>
                  <p style={{
                    fontSize: 13, color: "#94A3B8", lineHeight: 1.6, margin: "0 0 14px",
                    display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden",
                  }}>
                    {job.description}
                  </p>

                  {job.skillsRequired?.length > 0 && (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 14 }}>
                      {job.skillsRequired.slice(0, 3).map((s: string) => (
                        <span key={s} style={{
                          fontSize: 10, padding: "3px 8px", borderRadius: 5,
                          border: "1px solid rgba(255,255,255,0.09)",
                          color: "#94A3B8", background: "rgba(255,255,255,0.04)",
                        }}>{s}</span>
                      ))}
                      {job.skillsRequired.length > 3 && (
                        <span style={{ fontSize: 10, color: "#475569", padding: "3px 0" }}>+{job.skillsRequired.length - 3}</span>
                      )}
                    </div>
                  )}

                  <div style={{ display: "flex", justifyContent: "space-between", paddingTop: 12, borderTop: "1px solid rgba(255,255,255,0.07)" }}>
                    <span style={{ fontSize: 12, color: "#3FD9C7", fontWeight: 600 }}>
                      {job._count?.applications ?? 0} applicant{job._count?.applications !== 1 ? "s" : ""}
                    </span>
                    <span style={{ fontSize: 12, color: "#475569" }}>
                      {timeAgo(job.createdAt)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}