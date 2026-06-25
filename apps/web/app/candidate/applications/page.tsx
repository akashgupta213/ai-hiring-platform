"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { getMyApplications } from "@/lib/api-client";

const tabs = [
  { label: "ACTIVE", href: "/candidate/applications" },
  { label: "INTERVIEWING", href: "/candidate/applications/interviewing" },
  { label: "OFFERS", href: "/candidate/applications/offers" },
  { label: "ARCHIVED", href: "/candidate/applications/archived" },
];

const STATUS_VARIANT: Record<string, string> = {
  applied: "review",
  shortlisted: "interviewing",
  hired: "offer",
  rejected: "archived",
};

const STATUS_LABEL: Record<string, string> = {
  applied: "Under Review",
  shortlisted: "Interviewing",
  hired: "Offer Received",
  rejected: "Not Selected",
};

const COMPANY_ICONS: Record<string, string> = {};
function getIcon(company: string) {
  const icons = ["corporate_fare", "terminal", "account_balance", "shopping_bag", "analytics", "cloud"];
  let h = 0;
  for (let i = 0; i < company.length; i++) h = (h * 31 + company.charCodeAt(i)) >>> 0;
  return icons[h % icons.length];
}

function StatusBadge({ variant, children }: { variant: string; children: React.ReactNode }) {
  const base = "inline-flex items-center px-xs py-1 rounded font-label-caps text-[10px] uppercase tracking-widest";
  if (variant === "offer") return <span className={`${base} bg-primary text-on-primary`}>{children}</span>;
  if (variant === "interviewing") return <span className={`${base} bg-secondary-container text-on-secondary-fixed-variant border border-outline-variant`}>{children}</span>;
  return <span className={`${base} bg-surface-variant text-on-surface-variant border border-outline-variant`}>{children}</span>;
}

function timeAgo(dateStr: string) {
  const days = Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  return `${Math.floor(days / 7)}w ago`;
}

export default function ApplicationsPage() {
  const pathname = usePathname();
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyApplications()
      .then((data: any) => setApplications(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  }, []);

  const active = applications.filter((a) => a.status !== "rejected");
  const interviewing = applications.filter((a) => a.status === "shortlisted");
  const offers = applications.filter((a) => a.status === "hired");
  const archived = applications.filter((a) => a.status === "rejected");

  const tabCounts: Record<string, number> = {
    "/candidate/applications": active.length,
    "/candidate/applications/interviewing": interviewing.length,
    "/candidate/applications/offers": offers.length,
    "/candidate/applications/archived": archived.length,
  };

  const upcomingEvents = interviewing.slice(0, 2).map((a) => ({
    month: new Date(a.appliedAt).toLocaleString("default", { month: "short" }).toUpperCase(),
    day: new Date(a.appliedAt).getDate().toString(),
    title: a.job?.title ?? "Interview",
    meta: `${a.job?.company?.name ?? "Company"} • TBD`,
    primary: true,
  }));

  const funnel = [
    { label: "APPLIED", value: applications.length, width: "100%" },
    { label: "SHORTLISTED", value: interviewing.length, width: applications.length ? `${Math.round((interviewing.length / applications.length) * 100)}%` : "0%" },
    { label: "HIRED", value: offers.length, width: applications.length ? `${Math.round((offers.length / applications.length) * 100)}%` : "0%" },
  ];

  return (
    <div className="bg-background text-on-background min-h-screen mx-auto px-margin-safe">
      {/* Tabs */}
      <div className="flex border-b border-outline-variant mt-sm">
        {tabs.map((t) => {
          const active = pathname === t.href;
          return (
            <Link key={t.label} href={t.href}
              className={`px-md py-sm font-label-caps text-label-caps transition-colors ${active ? "text-primary border-b-2 border-primary" : "text-secondary hover:text-primary"}`}>
              {t.label} ({tabCounts[t.href] ?? 0})
            </Link>
          );
        })}
      </div>

      <main className="max-w-[1440px] mx-auto px-margin-safe py-lg">
        {/* Header */}
        <div className="flex flex-col gap-md mb-lg">
          <div className="flex justify-between items-end">
            <div>
              <h1 className="font-headline-lg text-headline-lg text-primary tracking-tight">My Applications</h1>
              <p className="font-body-lg text-body-lg text-secondary mt-xs">Track and manage your ongoing career opportunities.</p>
            </div>
          </div>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-12 gap-gutter">
          {/* Main list */}
          <div className="col-span-12 lg:col-span-9 flex flex-col gap-md">
            <div className="grid grid-cols-12 px-md py-sm bg-surface-container-low rounded-lg">
              <div className="col-span-4 font-label-caps text-label-caps text-secondary uppercase">Company & Role</div>
              <div className="col-span-2 font-label-caps text-label-caps text-secondary uppercase">Status</div>
              <div className="col-span-4 font-label-caps text-label-caps text-secondary uppercase">Next Step</div>
              <div className="col-span-2 font-label-caps text-label-caps text-secondary uppercase text-right">Actions</div>
            </div>

            {loading && (
              <div className="text-center py-xl text-secondary font-body-sm">Loading applications…</div>
            )}

            {!loading && active.length === 0 && (
              <div className="text-center py-xl text-secondary font-body-sm">
                No active applications yet. <Link href="/candidate/jobs" className="text-primary underline">Browse jobs →</Link>
              </div>
            )}

            {active.map((a) => {
              const isOffer = a.status === "hired";
              const variant = STATUS_VARIANT[a.status] ?? "review";
              const icon = getIcon(a.job?.company?.name ?? "");
              return (
                <div key={a.id}
                  className={`grid grid-cols-12 items-center px-md py-gutter bg-surface-container-lowest border border-outline-variant transition-all group ${isOffer ? "ai-insight-border hover:shadow-lg" : "hover:border-primary"}`}>
                  <div className="col-span-4 flex items-center gap-md">
                    <div className="w-12 h-12 bg-surface-container-highest border border-outline-variant flex items-center justify-center rounded">
                      <span className="material-symbols-outlined text-primary">{icon}</span>
                    </div>
                    <div>
                      <div className="flex items-center gap-xs">
                        <h3 className="font-title-md text-title-md text-primary">{a.job?.title ?? "Unknown Role"}</h3>
                        {isOffer && <span className="material-symbols-outlined text-[16px]" style={{ color: "#D4AF37" }}>auto_awesome</span>}
                      </div>
                      <p className="font-body-sm text-body-sm text-secondary">
                        {a.job?.company?.name ?? "Company"} • {a.job?.company?.industry ?? "—"}
                      </p>
                    </div>
                  </div>

                  <div className="col-span-2">
                    <StatusBadge variant={variant}>{STATUS_LABEL[a.status]}</StatusBadge>
                  </div>

                  <div className="col-span-4">
                    <div className="flex flex-col gap-1">
                      <span className={`font-body-sm text-body-sm ${a.status === "applied" ? "text-secondary italic" : "text-primary font-bold"}`}>
                        {a.status === "applied" && "Waiting for recruiter response..."}
                        {a.status === "shortlisted" && "Shortlisted — awaiting interview schedule"}
                        {a.status === "hired" && "Review Offer"}
                        {a.status === "rejected" && "Application closed"}
                      </span>
                      <span className="font-body-sm text-body-sm text-secondary">Applied {timeAgo(a.appliedAt)}</span>
                    </div>
                  </div>

                  <div className="col-span-2 flex justify-end gap-sm">
                    {isOffer && (
                      <button className="bg-primary text-on-primary px-sm py-1 font-label-caps text-[10px] rounded hover:opacity-90 transition-opacity">
                        VIEW OFFER
                      </button>
                    )}
                    <button className="p-xs hover:bg-surface-container-high rounded transition-colors">
                      <span className="material-symbols-outlined text-secondary group-hover:text-primary">visibility</span>
                    </button>
                    <button className="p-xs hover:bg-surface-container-high rounded transition-colors">
                      <span className="material-symbols-outlined text-secondary group-hover:text-primary">more_vert</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Sidebar */}
          <aside className="col-span-12 lg:col-span-3 flex flex-col gap-gutter">
            {/* AI Insights */}
            <div className="bg-surface-container-lowest border border-outline-variant p-md ai-insight-border">
              <div className="flex items-center gap-xs mb-sm">
                <span className="material-symbols-outlined text-[18px]" style={{ color: "#D4AF37" }}>auto_awesome</span>
                <h4 className="font-label-caps text-label-caps text-primary uppercase">Application Insights</h4>
              </div>
              <p className="font-body-sm text-body-sm text-secondary mb-md">
                {applications.length > 0
                  ? `You have ${applications.length} total application${applications.length !== 1 ? "s" : ""}. ${interviewing.length > 0 ? `${interviewing.length} shortlisted!` : "Keep applying to increase your chances."}`
                  : "Apply to jobs to start tracking your progress here."}
              </p>
              <div className="flex flex-col gap-sm">
                <div className="p-sm bg-surface-container-low rounded border border-outline-variant">
                  <span className="font-label-caps text-[10px] text-secondary uppercase block mb-1">Shortlist Rate</span>
                  <p className="font-body-sm text-body-sm text-primary font-semibold">
                    {applications.length > 0 ? `${Math.round((interviewing.length / applications.length) * 100)}%` : "—"} of applications
                  </p>
                </div>
              </div>
            </div>

            {/* Calendar */}
            {upcomingEvents.length > 0 && (
              <div className="bg-surface-container-lowest border border-outline-variant p-md">
                <h4 className="font-label-caps text-label-caps text-primary uppercase mb-md">Shortlisted Roles</h4>
                <div className="flex flex-col gap-md">
                  {upcomingEvents.map((e, i) => (
                    <div key={i} className="flex gap-md">
                      <div className="flex flex-col items-center justify-center min-w-[44px] h-[44px] rounded bg-primary text-on-primary">
                        <span className="text-[10px] font-bold">{e.month}</span>
                        <span className="text-title-md leading-none">{e.day}</span>
                      </div>
                      <div>
                        <h5 className="font-body-sm text-body-sm font-bold text-primary">{e.title}</h5>
                        <p className="font-body-sm text-[12px] text-secondary">{e.meta}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Funnel */}
            <div className="bg-surface-container-lowest border border-outline-variant p-md">
              <h4 className="font-label-caps text-label-caps text-primary uppercase mb-md">My Funnel</h4>
              <div className="space-y-4">
                {funnel.map((f) => (
                  <div key={f.label}>
                    <div className="flex justify-between font-label-caps text-[10px] mb-1">
                      <span>{f.label}</span>
                      <span>{f.value}</span>
                    </div>
                    <div className="h-1 bg-surface-container-high w-full">
                      <div className="h-full bg-primary" style={{ width: f.width }} />
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