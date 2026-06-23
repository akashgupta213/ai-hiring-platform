"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

const applications = [
  {
    id: 1,
    role: "Senior Product Designer",
    company: "Neuralink",
    location: "San Francisco, CA",
    icon: "corporate_fare",
    status: "Interviewing",
    statusVariant: "interviewing",
    nextStepTitle: "Onsite Technical Presentation",
    nextStepMeta: "Scheduled: Tomorrow, 2:00 PM",
    highlight: false,
    actions: ["visibility", "chat_bubble", "more_vert"],
  },
  {
    id: 2,
    role: "Lead AI Engineer",
    company: "Anthropic",
    location: "Remote",
    icon: "terminal",
    status: "Offer Received",
    statusVariant: "offer",
    nextStepTitle: "Review Compensation Package",
    nextStepMeta: "Expires in 3 days",
    highlight: true,
    primaryAction: "VIEW OFFER",
    actions: ["more_vert"],
  },
  {
    id: 3,
    role: "Head of Growth",
    company: "Stripe",
    location: "Dublin, IE",
    icon: "account_balance",
    status: "Under Review",
    statusVariant: "review",
    nextStepTitle: "Waiting for recruiter response...",
    nextStepTitleItalic: true,
    nextStepMeta: "Applied 4 days ago",
    highlight: false,
    actions: ["visibility", "mail", "more_vert"],
  },
  {
    id: 4,
    role: "Principal UX Researcher",
    company: "Shopify",
    location: "Ottawa, CA (Remote)",
    icon: "shopping_bag",
    status: "Interviewing",
    statusVariant: "interviewing",
    nextStepTitle: "Hiring Manager Screen",
    nextStepMeta: "Thursday, Oct 24 • 11:00 AM",
    highlight: false,
    actions: ["calendar_today", "more_vert"],
  },
];

const tabs = [
  { label: "ACTIVE", count: 12, href: "/candidate/applications" },
  { label: "INTERVIEWING", count: 4, href: "/candidate/applications/interviewing" },
  { label: "OFFERS", count: 1, href: "/candidate/applications/offers" },
  { label: "ARCHIVED", count: 28, href: "/candidate/applications/archived" },
];

const upcomingEvents = [
  { month: "OCT", day: "23", title: "Technical Interview", meta: "Neuralink • 2:00 PM", primary: true },
  { month: "OCT", day: "24", title: "Hiring Manager Screen", meta: "Shopify • 11:00 AM", primary: false },
];

const funnel = [
  { label: "APPLIED", value: 42, width: "100%" },
  { label: "INTERVIEWED", value: 8, width: "19%" },
  { label: "OFFERS", value: 2, width: "5%" },
];

function StatusBadge({ variant, children }: { variant: string; children: React.ReactNode }) {
  const base =
    "inline-flex items-center px-xs py-1 rounded font-label-caps text-[10px] uppercase tracking-widest";
  if (variant === "offer") return <span className={`${base} bg-primary text-on-primary`}>{children}</span>;
  if (variant === "interviewing")
    return (
      <span className={`${base} bg-secondary-container text-on-secondary-fixed-variant border border-outline-variant`}>
        {children}
      </span>
    );
  return (
    <span className={`${base} bg-surface-variant text-on-surface-variant border border-outline-variant`}>
      {children}
    </span>
  );
}

export default function ApplicationsPage() {
  const pathname = usePathname(); // ✅ moved inside the component

  return (
    <div className="bg-background text-on-background min-h-screen mx-auto px-margin-safe">
        {/* Tabs — Link-based with active state from pathname */}
          <div className="flex border-b border-outline-variant mt-sm">
            {tabs.map((t) => {
              const active = pathname === t.href;
              return (
                <Link
                  key={t.label}
                  href={t.href}
                  className={`px-md py-sm font-label-caps text-label-caps transition-colors ${
                    active
                      ? "text-primary border-b-2 border-primary"
                      : "text-secondary hover:text-primary"
                  }`}
                >
                  {t.label} ({t.count})
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
              <p className="font-body-lg text-body-lg text-secondary mt-xs">
                Track and manage your ongoing career opportunities.
              </p>
            </div>
            <button className="bg-primary text-on-primary px-md py-sm rounded-lg font-title-md text-sm flex items-center gap-xs hover:bg-on-tertiary-fixed-variant transition-all cursor-pointer">
              <span className="material-symbols-outlined text-[20px]">add</span>
              Track External Job
            </button>
          </div>

          
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-12 gap-gutter">
          {/* Main list */}
          <div className="col-span-12 lg:col-span-9 flex flex-col gap-md">
            <div className="grid grid-cols-12 px-md py-sm bg-surface-container-low rounded-lg">
              <div className="col-span-4 font-label-caps text-label-caps text-secondary uppercase">
                Company &amp; Role
              </div>
              <div className="col-span-2 font-label-caps text-label-caps text-secondary uppercase">Status</div>
              <div className="col-span-4 font-label-caps text-label-caps text-secondary uppercase">Next Step</div>
              <div className="col-span-2 font-label-caps text-label-caps text-secondary uppercase text-right">
                Actions
              </div>
            </div>

            {applications.map((a) => (
              <div
                key={a.id}
                className={`grid grid-cols-12 items-center px-md py-gutter bg-surface-container-lowest border border-outline-variant transition-all group ${
                  a.highlight ? "ai-insight-border hover:shadow-lg" : "hover:border-primary"
                }`}
              >
                <div className="col-span-4 flex items-center gap-md">
                  <div className="w-12 h-12 bg-surface-container-highest border border-outline-variant flex items-center justify-center rounded">
                    <span className="material-symbols-outlined text-primary">{a.icon}</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-xs">
                      <h3 className="font-title-md text-title-md text-primary">{a.role}</h3>
                      {a.highlight && (
                        <span
                          className="material-symbols-outlined text-[16px]"
                          style={{ color: "#D4AF37" }}
                        >
                          auto_awesome
                        </span>
                      )}
                    </div>
                    <p className="font-body-sm text-body-sm text-secondary">
                      {a.company} • {a.location}
                    </p>
                  </div>
                </div>

                <div className="col-span-2">
                  <StatusBadge variant={a.statusVariant}>{a.status}</StatusBadge>
                </div>

                <div className="col-span-4">
                  <div className="flex flex-col gap-1">
                    <span
                      className={`font-body-sm text-body-sm ${
                        a.nextStepTitleItalic
                          ? "text-secondary italic"
                          : "text-primary font-bold"
                      }`}
                    >
                      {a.nextStepTitle}
                    </span>
                    <span className="font-body-sm text-body-sm text-secondary">{a.nextStepMeta}</span>
                  </div>
                </div>

                <div className="col-span-2 flex justify-end gap-sm">
                  {a.primaryAction && (
                    <button className="bg-primary text-on-primary px-sm py-1 font-label-caps text-[10px] rounded hover:opacity-90 transition-opacity">
                      {a.primaryAction}
                    </button>
                  )}
                  {a.actions.map((icon, i) => (
                    <button
                      key={i}
                      className="p-xs hover:bg-surface-container-high rounded transition-colors"
                    >
                      <span className="material-symbols-outlined text-secondary group-hover:text-primary">
                        {icon}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Sidebar */}
          <aside className="col-span-12 lg:col-span-3 flex flex-col gap-gutter">
            {/* AI Insights */}
            <div className="bg-surface-container-lowest border border-outline-variant p-md ai-insight-border">
              <div className="flex items-center gap-xs mb-sm">
                <span className="material-symbols-outlined text-[18px]" style={{ color: "#D4AF37" }}>
                  auto_awesome
                </span>
                <h4 className="font-label-caps text-label-caps text-primary uppercase">
                  Application Insights
                </h4>
              </div>
              <p className="font-body-sm text-body-sm text-secondary mb-md">
                Based on your activity, you have a{" "}
                <span className="text-primary font-bold">82% success rate</span> for onsite technical rounds this
                month.
              </p>
              <div className="flex flex-col gap-sm">
                <div className="p-sm bg-surface-container-low rounded border border-outline-variant">
                  <span className="font-label-caps text-[10px] text-secondary uppercase block mb-1">
                    Recommended Prep
                  </span>
                  <p className="font-body-sm text-body-sm text-primary font-semibold">
                    Review Neuralink's Design Philosophy (2024 Whitepaper)
                  </p>
                </div>
                <div className="p-sm bg-surface-container-low rounded border border-outline-variant">
                  <span className="font-label-caps text-[10px] text-secondary uppercase block mb-1">
                    Salary Benchmark
                  </span>
                  <p className="font-body-sm text-body-sm text-primary font-semibold">
                    Your Anthropic offer is in the top 15% for the Bay Area.
                  </p>
                </div>
              </div>
            </div>

            {/* Calendar */}
            <div className="bg-surface-container-lowest border border-outline-variant p-md">
              <h4 className="font-label-caps text-label-caps text-primary uppercase mb-md">Upcoming Events</h4>
              <div className="flex flex-col gap-md">
                {upcomingEvents.map((e, i) => (
                  <div key={i} className="flex gap-md">
                    <div
                      className={`flex flex-col items-center justify-center min-w-[44px] h-[44px] rounded ${
                        e.primary
                          ? "bg-primary text-on-primary"
                          : "bg-surface-container-highest text-primary border border-outline-variant"
                      }`}
                    >
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
              <button className="w-full mt-md py-sm border border-outline-variant font-label-caps text-[10px] text-secondary hover:text-primary hover:border-primary transition-all">
                VIEW FULL CALENDAR
              </button>
            </div>

            {/* Funnel */}
            <div className="bg-surface-container-lowest border border-outline-variant p-md">
              <h4 className="font-label-caps text-label-caps text-primary uppercase mb-md">Monthly Funnel</h4>
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