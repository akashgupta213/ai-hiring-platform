"use client";
import { useEffect, useState } from "react";
import ApplicationsTabs from "@/components/applications/ApplicationsTabs";
import { getMyApplications } from "@/lib/api-client";

function getInitial(name: string) {
  return name?.charAt(0)?.toUpperCase() ?? "?";
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function ArchivedPage() {
  const [archived, setArchived] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyApplications()
      .then((data: any) => {
        const all = Array.isArray(data) ? data : [];
        setArchived(all.filter((a: any) => a.status === "rejected"));
      })
      .finally(() => setLoading(false));
  }, []);

  const summaryStats = [
    { label: "Total Archived", value: archived.length, highlight: false },
    { label: "Not Selected", value: archived.length, highlight: true },
  ];

  return (
    <div className="bg-background text-on-surface min-h-screen mx-auto px-margin-safe">
      <ApplicationsTabs />

      <main className="max-w-[1440px] mx-auto px-margin-safe py-lg grid grid-cols-12 gap-gutter">
        {/* Sidebar */}
        <aside className="col-span-12 lg:col-span-3 flex flex-col gap-gutter">
          <div className="bg-surface-container-lowest border border-outline-variant rounded-lg p-md">
            <h4 className="font-title-md text-title-md text-primary font-bold mb-md">Archived Summary</h4>
            <div className="flex flex-col divide-y divide-outline-variant/30">
              {summaryStats.map((s) => (
                <div key={s.label} className="flex justify-between items-center py-sm">
                  <span className="font-body-sm text-secondary">{s.label}</span>
                  <span className="font-title-md font-bold" style={{ color: s.highlight ? "#E07B39" : "var(--md-sys-color-primary, inherit)" }}>
                    {loading ? "—" : s.value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-surface-container-lowest border border-outline-variant rounded-lg p-md">
            <div className="flex items-center gap-xs mb-sm">
              <span className="material-symbols-outlined text-[16px]" style={{ color: "#D4AF37" }}>auto_awesome</span>
              <span className="font-label-caps text-[10px] uppercase tracking-widest font-bold" style={{ color: "#D4AF37" }}>AI Insight</span>
            </div>
            <p className="font-body-sm text-body-sm text-secondary italic leading-relaxed">
              {archived.length > 0
                ? `You've had ${archived.length} application${archived.length !== 1 ? "s" : ""} not move forward. Each one is a learning opportunity — review the job requirements to sharpen your profile.`
                : "No archived applications yet. Keep applying!"}
            </p>
          </div>

          {/* Career trajectory visual */}
          <div className="rounded-lg overflow-hidden relative" style={{ minHeight: "140px" }}>
            <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, #1c1c1c 0%, #2a2a2a 40%, #111 100%)" }} />
            <div className="absolute inset-0 flex items-end justify-center gap-[3px] pb-8 px-4 opacity-60">
              {[18, 30, 55, 42, 70, 90, 65, 110, 80, 95, 60, 75, 50, 85, 40].map((h, i) => (
                <div key={i} className="rounded-sm flex-1" style={{ height: `${h}px`, background: i % 3 === 0 ? "rgba(255,255,255,0.5)" : "rgba(255,255,255,0.2)" }} />
              ))}
            </div>
            <div className="relative z-10 flex items-end h-full p-md" style={{ minHeight: "140px" }}>
              <p className="font-body-sm text-[13px] font-bold text-white leading-snug">
                Reviewing your career trajectory<br />helps optimize future matches.
              </p>
            </div>
          </div>
        </aside>

        {/* Main */}
        <section className="col-span-12 lg:col-span-9 space-y-md">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-headline-lg text-headline-lg text-primary tracking-tight">Applications: Archived</h1>
              <p className="font-body-lg text-secondary">View and analyze your past job application history.</p>
            </div>
          </div>

          <div className="bg-surface-container-lowest border border-outline-variant rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-surface-container-low">
                  <tr>
                    <th className="px-md py-sm font-label-caps text-label-caps text-on-surface-variant border-b border-outline-variant">COMPANY</th>
                    <th className="px-md py-sm font-label-caps text-label-caps text-on-surface-variant border-b border-outline-variant">ROLE</th>
                    <th className="px-md py-sm font-label-caps text-label-caps text-on-surface-variant border-b border-outline-variant">REASON</th>
                    <th className="px-md py-sm font-label-caps text-label-caps text-on-surface-variant border-b border-outline-variant">DATE</th>
                    <th className="px-md py-sm font-label-caps text-label-caps text-on-surface-variant border-b border-outline-variant text-right">ACTION</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/30">
                  {loading && (
                    <tr><td colSpan={5} className="px-md py-xl text-center text-secondary font-body-sm">Loading…</td></tr>
                  )}
                  {!loading && archived.length === 0 && (
                    <tr><td colSpan={5} className="px-md py-xl text-center text-secondary font-body-sm">No archived applications yet.</td></tr>
                  )}
                  {archived.map((a) => (
                    <tr key={a.id} className="hover:bg-surface-container-low/50 transition-colors cursor-default">
                      <td className="px-md py-md">
                        <div className="flex items-center gap-sm">
                          <div className="w-8 h-8 bg-surface-container-high rounded flex items-center justify-center font-bold text-primary">
                            {getInitial(a.job?.company?.name ?? "?")}
                          </div>
                          <span className="font-body-lg font-semibold text-primary">{a.job?.company?.name ?? "Unknown"}</span>
                        </div>
                      </td>
                      <td className="px-md py-md"><span className="font-body-sm text-on-surface">{a.job?.title ?? "Unknown Role"}</span></td>
                      <td className="px-md py-md">
                        <span className="px-xs py-1 rounded bg-slate-100 text-slate-700 font-label-caps text-[10px] uppercase">Not Selected</span>
                      </td>
                      <td className="px-md py-md"><span className="font-body-sm text-secondary">{formatDate(a.appliedAt)}</span></td>
                      <td className="px-md py-md text-right">
                        <button className="text-secondary hover:text-primary transition-colors">
                          <span className="material-symbols-outlined text-[20px]">visibility</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="p-md bg-surface-container-low/30 border-t border-outline-variant flex justify-between items-center">
              <span className="font-body-sm text-secondary">Showing {archived.length} archived applications</span>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}