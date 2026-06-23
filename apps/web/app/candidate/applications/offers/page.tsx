"use client";

import React from "react";
import ApplicationsTabs from "@/components/applications/ApplicationsTabs";

const offers = [
  {
    id: 1,
    role: "Senior Product Designer",
    company: "NexaSystems",
    location: "San Francisco, CA (Remote)",
    logo: "https://lh3.googleusercontent.com/aida-public/AB6AXuBt5gw5K73HnyZmpoMI936hlaZbuCLqsIImrcHMigm9URqPIuZApkLDkdcL7Hk2auXWV-5AUFEN76qmeDUKUOJpQyV59hZ0mkln8ERRgsy70wW4aCLj0dzsuXFryFma_5wBMzDPbYZ-6j6eMp4bwF7hdD-2wuFgO08Bgn4wsNE_GRv_94El8kkcq8otFhIS9xyvAG3Ew3ksq2OKX2Il2X6ArvxyKtJDdECbuN0dkG14bNQb6F4wBRtJAcSUnnHf2gr9uZlzJgqafcU",
    tags: ["Design", "Full-Time", "Series C"],
    expires: "EXPIRES IN 48 HOURS",
    urgent: true,
    salary: "$185,000 — $210,000",
    extra: "0.15% Equity Stake",
    benefits: [
      { icon: "medical_services", label: "Premium Health" },
      { icon: "flight_takeoff", label: "Unlimited PTO" },
    ],
  },
  {
    id: 2,
    role: "Lead UX Researcher",
    company: "QuantEdge",
    location: "New York, NY (Hybrid)",
    logo: "https://lh3.googleusercontent.com/aida-public/AB6AXuAPXBsm0vN3ULxfkJTHBQtnEOVHMgUYZ_YIJZCzZikV4MNH2n63a9yfkYz7g1tkcrULr1Vj2nh1h4QZZ9xNaPv4Tud81LClmHjQFYa35fxnAHrPMDKkwD_q_Jb1ldLlbnpE9mHrwYiM9OogM5PkDYkzAua7FJmVP_d63-eWLuye0S-WOZrj6uF1AfX-9lz_8VYn4p29GP86Nu6lWYMVzuAMCzJQ_lmA74V6IHEyuaUzblWFUHD0gKgr_I2H8MFSLXQrlQk-7-JDekY",
    tags: ["Research", "Lead", "Fintech"],
    expires: "EXPIRES IN 5 DAYS",
    urgent: false,
    salary: "$195,000 — $225,000",
    extra: "Bonus: $25k Signing",
    benefits: [
      { icon: "savings", label: "4% 401k Match" },
      { icon: "fitness_center", label: "Wellness Stipend" },
    ],
  },
];

const totalValueRows = [
  { company: "NexaSystems (Year 1)", value: "$242,500", highlight: false },
  { company: "QuantEdge (Year 1)",   value: "$255,000", highlight: true  },
];

const marketContext = [
  {
    icon: "trending_up",
    title: "Demand is High",
    body: "Similar roles have seen a 12% increase in base offers this quarter.",
  },
  {
    icon: "schedule",
    title: "Time to Decide",
    body: "On average, candidates in your tier accept offers within 4.2 days.",
  },
];

export default function OffersPage() {
  return (
    <div className="bg-background text-on-background min-h-screen mx-auto px-margin-safe">
      <ApplicationsTabs />

      <main className="max-w-[1440px] mx-auto px-margin-safe pt-md pb-lg">
        <div className="mb-lg">
          <h1 className="font-headline-lg text-headline-lg text-primary">Offer Management</h1>
          <p className="font-body-lg text-body-lg text-secondary mt-xs">
            Review and compare your active employment offers.
          </p>
        </div>

        <div className="grid grid-cols-12 gap-gutter">

          {/* ── MAIN OFFERS LIST ── */}
          <div className="col-span-12 lg:col-span-8 space-y-md">
            {offers.map((o) => (
              <div
                key={o.id}
                className="bg-surface-container-lowest border border-outline-variant rounded-lg p-md transition-all hover:border-primary group"
              >
                <div className="flex flex-col md:flex-row justify-between items-start gap-md">
                  <div className="flex gap-md">
                    <div className="w-16 h-16 rounded-xl border border-outline-variant bg-white flex items-center justify-center overflow-hidden shrink-0">
                      <img className="w-12 h-12 object-contain" src={o.logo} alt={o.company} />
                    </div>
                    <div>
                      <h3 className="font-title-md text-title-md text-primary mb-1">{o.role}</h3>
                      <p className="font-body-lg text-body-lg text-secondary">{o.company} • {o.location}</p>
                      <div className="mt-sm flex flex-wrap gap-xs">
                        {o.tags.map((t) => (
                          <span key={t} className="bg-surface-container-low text-secondary px-3 py-1 rounded-full font-label-caps text-label-caps uppercase">
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="text-right flex flex-col items-end gap-1">
                    <span className={`font-label-caps text-label-caps flex items-center gap-1 ${o.urgent ? "text-error" : "text-secondary"}`}>
                      <span className="material-symbols-outlined text-sm">schedule</span>
                      {o.expires}
                    </span>
                    <p className="font-title-md text-title-md text-primary">{o.salary}</p>
                    <p className="font-body-sm text-body-sm text-secondary">{o.extra}</p>
                  </div>
                </div>
                <div className="mt-lg pt-md border-t border-outline-variant flex justify-between items-center">
                  <div className="flex gap-md">
                    {o.benefits.map((b) => (
                      <div key={b.label} className="flex items-center gap-2 text-secondary">
                        <span className="material-symbols-outlined text-lg">{b.icon}</span>
                        <span className="font-body-sm text-body-sm">{b.label}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-sm">
                    <button className="px-md py-2 border border-outline rounded text-primary font-body-lg hover:bg-surface-container-low transition-colors">
                      View Details
                    </button>
                    <button className="px-md py-2 bg-primary text-on-primary rounded font-body-lg hover:opacity-90 transition-opacity">
                      Accept Offer
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {/* Waiting state */}
            <div className="border-2 border-dashed border-outline-variant rounded-lg p-xl flex flex-col items-center justify-center text-center opacity-60">
              <span className="material-symbols-outlined text-display-lg text-secondary-fixed-dim mb-md">work_history</span>
              <p className="font-title-md text-title-md text-secondary">Waiting for more decisions?</p>
              <p className="font-body-sm text-body-sm text-secondary max-w-xs">
                3 applications are currently in the &apos;Final Interview&apos; stage. We&apos;ll notify you as soon as an offer is generated.
              </p>
            </div>
          </div>

          {/* ── RIGHT SIDEBAR ── */}
          <aside className="col-span-12 lg:col-span-4 flex flex-col gap-gutter">

            {/* HireAI Insight: Comparison */}
            <div className="bg-surface-container-lowest border border-outline-variant rounded-lg p-md">
              {/* Header */}
              <div className="flex items-center gap-xs mb-md pb-sm border-b border-outline-variant">
                <span className="material-symbols-outlined text-[16px]" style={{ color: "#D4AF37" }}>auto_awesome</span>
                <span className="font-label-caps text-[10px] uppercase tracking-widest font-bold" style={{ color: "#D4AF37" }}>
                  HireAI Insight: Comparison
                </span>
              </div>

              {/* Total Value Analysis */}
              <p className="font-body-sm text-body-sm text-primary font-bold mb-sm">Total Value Analysis</p>
              <div className="flex flex-col gap-xs mb-md">
                {totalValueRows.map((r) => (
                  <div key={r.company} className="flex justify-between items-center py-xs border-b border-outline-variant/40">
                    <span className="font-body-sm text-body-sm text-secondary">{r.company}</span>
                    <span
                      className="font-body-sm font-bold"
                      style={{ color: r.highlight ? "#2563EB" : "var(--md-sys-color-primary, #1a1a1a)" }}
                    >
                      {r.value}
                    </span>
                  </div>
                ))}
              </div>

              {/* Insight bullets */}
              <div className="flex flex-col gap-sm mb-md">
                <div className="flex gap-xs">
                  <span className="material-symbols-outlined text-[16px] text-secondary mt-[2px] shrink-0">trending_up</span>
                  <p className="font-body-sm text-body-sm text-secondary">
                    QuantEdge's base salary is{" "}
                    <span className="text-primary font-semibold">8% higher</span> than your current market average for Lead roles.
                  </p>
                </div>
                <div className="flex gap-xs">
                  <span className="material-symbols-outlined text-[16px] text-secondary mt-[2px] shrink-0">donut_large</span>
                  <p className="font-body-sm text-body-sm text-secondary">
                    NexaSystems offers{" "}
                    <span className="text-primary font-semibold">high-growth equity</span> that could outperform base salary in 3–5 years.
                  </p>
                </div>
              </div>

              {/* CTA */}
              <button className="w-full py-sm bg-primary text-on-primary rounded font-label-caps text-[11px] uppercase tracking-widest hover:opacity-90 transition-opacity">
                View Full Decision Matrix
              </button>
            </div>

            {/* Market Context */}
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

            {/* Assigned Agent */}
            <div className="bg-surface-container-lowest border border-outline-variant rounded-lg p-md">
              <p className="font-label-caps text-[10px] uppercase tracking-widest text-secondary mb-sm">Assigned Agent</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-sm">
                  {/* Avatar */}
                  <div className="w-10 h-10 rounded-full bg-surface-container-high border border-outline-variant flex items-center justify-center overflow-hidden shrink-0">
                    <span className="material-symbols-outlined text-[24px] text-secondary">person</span>
                  </div>
                  <span className="font-body-sm text-body-sm text-primary font-semibold">Sarah Jenkins</span>
                </div>
                <button className="w-9 h-9 border border-outline-variant rounded flex items-center justify-center hover:bg-surface-container-low transition-colors">
                  <span className="material-symbols-outlined text-[20px] text-secondary">chat_bubble_outline</span>
                </button>
              </div>
            </div>

          </aside>
        </div>
      </main>
    </div>
  );
}