"use client";
import { useEffect, useState } from "react";
import ApplicationsTabs from "@/components/applications/ApplicationsTabs";
import { getMyApplications } from "@/lib/api-client";

function getIcon(company: string) {
  const icons = ["corporate_fare", "terminal", "account_balance", "shopping_bag", "analytics", "cloud"];
  let h = 0;
  for (let i = 0; i < company.length; i++) h = (h * 31 + company.charCodeAt(i)) >>> 0;
  return icons[h % icons.length];
}

const prepChips = ["Interview Guides", "Salary Calculator", "Portfolio Review", "Mock Interview"];

export default function InterviewingPage() {
  const [interviews, setInterviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyApplications()
      .then((data: any) => {
        const all = Array.isArray(data) ? data : [];
        setInterviews(all.filter((a: any) => a.status === "shortlisted"));
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="bg-background text-on-background min-h-screen mx-auto px-margin-safe">
      <ApplicationsTabs />

      <main className="max-w-[1440px] mx-auto px-margin-safe py-lg">
        <div className="mb-lg">
          <h1 className="font-headline-lg text-headline-lg text-primary mb-base">Interviewing</h1>
          <p className="text-secondary font-body-sm">Track your shortlisted applications and upcoming interviews.</p>
        </div>

        <div className="grid grid-cols-12 gap-gutter">
          {/* Table */}
          <div className="col-span-12 lg:col-span-8">
            <div className="bg-white border border-outline-variant rounded-lg overflow-hidden">
              <div className="p-md border-b border-outline-variant flex justify-between items-center bg-surface-container-low">
                <h2 className="font-title-md text-title-md">Shortlisted Applications ({interviews.length})</h2>
              </div>

              {loading ? (
                <div className="p-xl text-center text-secondary font-body-sm">Loading…</div>
              ) : interviews.length === 0 ? (
                <div className="p-xl text-center text-secondary font-body-sm">
                  No shortlisted applications yet. Keep applying!
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-white border-b border-outline-variant">
                      <tr>
                        <th className="px-md py-4 font-label-caps text-label-caps text-secondary uppercase">Role & Company</th>
                        <th className="px-md py-4 font-label-caps text-label-caps text-secondary uppercase">Applied</th>
                        <th className="px-md py-4 font-label-caps text-label-caps text-secondary uppercase">Skills Required</th>
                        <th className="px-md py-4 font-label-caps text-label-caps text-secondary uppercase text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant">
                      {interviews.map((a) => {
                        const icon = getIcon(a.job?.company?.name ?? "");
                        const appliedDate = new Date(a.appliedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
                        return (
                          <tr key={a.id} className="hover:bg-surface-container-low transition-colors group">
                            <td className="px-md py-sm">
                              <div className="flex items-center gap-sm">
                                <div className="w-12 h-12 bg-surface-container-highest flex items-center justify-center rounded-lg border border-outline-variant">
                                  <span className="material-symbols-outlined text-primary">{icon}</span>
                                </div>
                                <div>
                                  <div className="font-title-md text-[16px] text-primary">{a.job?.title ?? "Unknown Role"}</div>
                                  <div className="text-secondary font-body-sm">{a.job?.company?.name ?? "Company"}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-md py-sm">
                              <span className="font-semibold font-body-sm text-primary">{appliedDate}</span>
                            </td>
                            <td className="px-md py-sm">
                              <div className="flex flex-wrap gap-1">
                                {(a.job?.skillsRequired ?? []).slice(0, 3).map((s: string) => (
                                  <span key={s} className="px-2 py-0.5 bg-surface-container-low text-secondary text-[10px] rounded border border-outline-variant">{s}</span>
                                ))}
                              </div>
                            </td>
                            <td className="px-md py-sm text-right">
                              <button className="bg-primary text-white font-label-caps text-label-caps px-4 py-2 rounded-lg hover:opacity-90 transition-all">
                                PREPARE
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="col-span-12 lg:col-span-4 space-y-gutter">
            <div className="bg-white border border-outline-variant rounded-lg p-md sidebar-border-gold">
              <div className="flex items-center gap-xs mb-sm">
                <span className="material-symbols-outlined text-tertiary" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
                <h3 className="font-title-md text-title-md text-primary">HireAI Insights</h3>
              </div>
              <p className="text-body-sm text-secondary mb-md">
                {interviews.length > 0
                  ? `You have ${interviews.length} shortlisted application${interviews.length !== 1 ? "s" : ""}. Companies are interested in your profile!`
                  : "Get shortlisted to see personalized interview insights here."}
              </p>
              {interviews.length > 0 && (
                <div className="bg-surface-container-low p-sm rounded-lg border border-outline-variant">
                  <span className="text-label-caps font-label-caps text-secondary uppercase block mb-1">Top Tip</span>
                  <p className="text-body-sm text-primary italic">
                    "Research {interviews[0]?.job?.company?.name}'s recent projects and align your experience with their tech stack: {(interviews[0]?.job?.skillsRequired ?? []).slice(0, 2).join(", ")}."
                  </p>
                </div>
              )}
            </div>

            <div className="bg-white border border-outline-variant rounded-lg p-md">
              <h3 className="font-title-md text-title-md mb-sm">Prep Kit</h3>
              <div className="flex flex-wrap gap-xs">
                {prepChips.map((c) => (
                  <span key={c} className="px-3 py-1 bg-surface-container-low border border-outline-variant text-body-sm rounded-full cursor-pointer hover:bg-primary hover:text-white transition-all">
                    {c}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}