"use client";
import { useEffect, useState } from "react";
import ApplicationsTabs from "@/components/applications/ApplicationsTabs";
import { getMyApplications } from "@/lib/api-client";

function timeAgo(dateStr: string) {
  const days = Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  return `${days} days ago`;
}

function getIcon(company: string) {
  const icons = ["corporate_fare", "terminal", "account_balance", "shopping_bag", "analytics", "cloud"];
  let h = 0;
  for (let i = 0; i < company.length; i++) h = (h * 31 + company.charCodeAt(i)) >>> 0;
  return icons[h % icons.length];
}

const marketContext = [
  { icon: "trending_up", title: "Demand is High", body: "Similar roles have seen a 12% increase in base offers this quarter." },
  { icon: "schedule", title: "Time to Decide", body: "On average, candidates accept offers within 4.2 days." },
];

export default function OffersPage() {
  const [offers, setOffers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyApplications()
      .then((data: any) => {
        const all = Array.isArray(data) ? data : [];
        setOffers(all.filter((a: any) => a.status === "hired"));
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="bg-background text-on-background min-h-screen mx-auto px-margin-safe">
      <ApplicationsTabs />

      <main className="max-w-[1440px] mx-auto px-margin-safe pt-md pb-lg">
        <div className="mb-lg">
          <h1 className="font-headline-lg text-headline-lg text-primary">Offer Management</h1>
          <p className="font-body-lg text-body-lg text-secondary mt-xs">Review your active employment offers.</p>
        </div>

        <div className="grid grid-cols-12 gap-gutter">
          {/* Main */}
          <div className="col-span-12 lg:col-span-8 space-y-md">
            {loading && <div className="p-xl text-center text-secondary font-body-sm">Loading…</div>}

            {!loading && offers.length === 0 && (
              <div className="border-2 border-dashed border-outline-variant rounded-lg p-xl flex flex-col items-center justify-center text-center">
                <span className="material-symbols-outlined text-display-lg text-secondary-fixed-dim mb-md">work_history</span>
                <p className="font-title-md text-title-md text-secondary">No offers yet</p>
                <p className="font-body-sm text-body-sm text-secondary max-w-xs">
                  Keep applying and acing those interviews. Offers will appear here once companies mark you as hired.
                </p>
              </div>
            )}

            {offers.map((o) => {
              const icon = getIcon(o.job?.company?.name ?? "");
              const skills = o.job?.skillsRequired ?? [];
              return (
                <div key={o.id}
                  className="bg-surface-container-lowest border border-outline-variant rounded-lg p-md transition-all hover:border-primary group">
                  <div className="flex flex-col md:flex-row justify-between items-start gap-md">
                    <div className="flex gap-md">
                      <div className="w-16 h-16 rounded-xl border border-outline-variant bg-white flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-primary text-3xl">{icon}</span>
                      </div>
                      <div>
                        <h3 className="font-title-md text-title-md text-primary mb-1">{o.job?.title ?? "Unknown Role"}</h3>
                        <p className="font-body-lg text-body-lg text-secondary">{o.job?.company?.name ?? "Company"} • {o.job?.company?.industry ?? "—"}</p>
                        <div className="mt-sm flex flex-wrap gap-xs">
                          {skills.slice(0, 3).map((t: string) => (
                            <span key={t} className="bg-surface-container-low text-secondary px-3 py-1 rounded-full font-label-caps text-label-caps uppercase">{t}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="text-right flex flex-col items-end gap-1">
                      <span className="font-label-caps text-label-caps flex items-center gap-1 text-secondary">
                        <span className="material-symbols-outlined text-sm">schedule</span>
                        Hired {timeAgo(o.appliedAt)}
                      </span>
                      <p className="font-body-sm text-body-sm text-secondary">Status: Hired 🎉</p>
                    </div>
                  </div>
                  <div className="mt-lg pt-md border-t border-outline-variant flex justify-between items-center">
                    <div className="flex gap-md">
                      <div className="flex items-center gap-2 text-secondary">
                        <span className="material-symbols-outlined text-lg">work</span>
                        <span className="font-body-sm text-body-sm">{o.job?.company?.industry ?? "Full-Time"}</span>
                      </div>
                    </div>
                    <div className="flex gap-sm">
                      <button className="px-md py-2 bg-primary text-on-primary rounded font-body-lg hover:opacity-90 transition-opacity">
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Pending note */}
            {!loading && (
              <div className="border-2 border-dashed border-outline-variant rounded-lg p-xl flex flex-col items-center justify-center text-center opacity-60">
                <span className="material-symbols-outlined text-display-lg text-secondary-fixed-dim mb-md">work_history</span>
                <p className="font-title-md text-title-md text-secondary">More decisions incoming?</p>
                <p className="font-body-sm text-body-sm text-secondary max-w-xs">
                  We&apos;ll notify you as soon as a company makes a decision on your applications.
                </p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <aside className="col-span-12 lg:col-span-4 flex flex-col gap-gutter">
            <div className="bg-surface-container-lowest border border-outline-variant rounded-lg p-md">
              <div className="flex items-center gap-xs mb-md pb-sm border-b border-outline-variant">
                <span className="material-symbols-outlined text-[16px]" style={{ color: "#D4AF37" }}>auto_awesome</span>
                <span className="font-label-caps text-[10px] uppercase tracking-widest font-bold" style={{ color: "#D4AF37" }}>
                  HireAI Insight
                </span>
              </div>
              <p className="font-body-sm text-body-sm text-primary font-bold mb-sm">Offer Summary</p>
              <div className="flex flex-col gap-xs mb-md">
                <div className="flex justify-between items-center py-xs border-b border-outline-variant/40">
                  <span className="font-body-sm text-body-sm text-secondary">Total Offers</span>
                  <span className="font-body-sm font-bold text-primary">{offers.length}</span>
                </div>
              </div>
              <button className="w-full py-sm bg-primary text-on-primary rounded font-label-caps text-[11px] uppercase tracking-widest hover:opacity-90 transition-opacity">
                View Decision Matrix
              </button>
            </div>

            <div className="bg-surface-container-lowest border border-outline-variant rounded-lg p-md">
              <h4 className="font-title-md text-title-md text-primary font-bold mb-md">Market Context</h4>
              <div className="flex flex-col gap-md">
                {marketContext.map((m) => (
                  <div key={m.title} className="flex gap-sm">
                    <div className="w-8 h-8 rounded bg-surface-container-low border border-outline-variant flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-[18px] text-secondary">{m.icon}</span>
                    </div>
                    <div>
                      <p className="font-body-sm text-body-sm text-primary font-semibold">{m.title}</p>
                      <p className="font-body-sm text-body-sm text-secondary">{m.body}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}