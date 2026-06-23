"use client";

import React from "react";
import ApplicationsTabs from "@/components/applications/ApplicationsTabs";

const archived = [
  { initial: "N", company: "Nexus Systems",   role: "Senior Frontend Engineer", reason: "Position Filled", date: "Oct 12, 2023" },
  { initial: "V", company: "Vanguard Labs",   role: "Product Design Lead",      reason: "Withdrawn",       date: "Sep 28, 2023" },
  { initial: "A", company: "Aetheric AI",     role: "ML Research Scientist",    reason: "Role Cancelled",  date: "Sep 15, 2023" },
  { initial: "Q", company: "Quant Analytics", role: "Data Engineer (L5)",       reason: "Not Selected",    date: "Aug 30, 2023" },
  { initial: "S", company: "Spectral Cloud",  role: "Full Stack Dev",           reason: "Position Filled", date: "Aug 22, 2023" },
];

const summaryStats = [
  { label: "Total Archived", value: 24, highlight: false },
  { label: "Withdrawn",      value: 8,  highlight: false },
  { label: "Position Filled",value: 12, highlight: true  },
  { label: "Role Cancelled", value: 4,  highlight: false },
];

export default function ArchivedPage() {
  return (
    <div className="bg-background text-on-surface min-h-screen mx-auto px-margin-safe">
      <ApplicationsTabs />

      <main className="max-w-[1440px] mx-auto px-margin-safe py-lg grid grid-cols-12 gap-gutter">

        {/* ── LEFT SIDEBAR ── */}
        <aside className="col-span-12 lg:col-span-3 flex flex-col gap-gutter">

          {/* Archived Summary */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-lg p-md">
            <h4 className="font-title-md text-title-md text-primary font-bold mb-md">Archived Summary</h4>
            <div className="flex flex-col divide-y divide-outline-variant/30">
              {summaryStats.map((s) => (
                <div key={s.label} className="flex justify-between items-center py-sm">
                  <span className="font-body-sm text-secondary">{s.label}</span>
                  <span
                    className="font-title-md font-bold"
                    style={{ color: s.highlight ? "#E07B39" : "var(--md-sys-color-primary, inherit)" }}
                  >
                    {s.value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* AI Insight */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-lg p-md">
            <div className="flex items-center gap-xs mb-sm">
              <span className="material-symbols-outlined text-[16px]" style={{ color: "#D4AF37" }}>auto_awesome</span>
              <span className="font-label-caps text-[10px] uppercase tracking-widest font-bold" style={{ color: "#D4AF37" }}>AI Insight</span>
            </div>
            <p className="font-body-sm text-body-sm text-secondary italic leading-relaxed">
              "Your profile is frequently shortlisted for 'Senior Product Designer' roles. 85% of your archives were due to high competition, not skill mismatch. Consider tailoring your portfolio more towards Fintech projects."
            </p>
          </div>

          {/* Career Trajectory Image Card */}
          <div className="rounded-lg overflow-hidden relative" style={{ minHeight: "140px" }}>
            {/* Dark photo-like background */}
            <div
              className="absolute inset-0"
              style={{
                background: "linear-gradient(to bottom, #1c1c1c 0%, #2a2a2a 40%, #111 100%)",
              }}
            />
            {/* Vertical bar lines to mimic a city/trajectory photo */}
            <div className="absolute inset-0 flex items-end justify-center gap-[3px] pb-8 px-4 opacity-60">
              {[18, 30, 55, 42, 70, 90, 65, 110, 80, 95, 60, 75, 50, 85, 40].map((h, i) => (
                <div
                  key={i}
                  className="rounded-sm flex-1"
                  style={{
                    height: `${h}px`,
                    background: i % 3 === 0 ? "rgba(255,255,255,0.5)" : "rgba(255,255,255,0.2)",
                  }}
                />
              ))}
            </div>
            {/* Text overlay */}
            <div className="relative z-10 flex items-end h-full p-md" style={{ minHeight: "140px" }}>
              <p className="font-body-sm text-[13px] font-bold text-white leading-snug">
                Reviewing your career trajectory<br />helps optimize future matches.
              </p>
            </div>
          </div>

        </aside>

        {/* ── MAIN CONTENT ── */}
        <section className="col-span-12 lg:col-span-9 space-y-md">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-headline-lg text-headline-lg text-primary tracking-tight">Applications: Archived</h1>
              <p className="font-body-lg text-secondary">View and analyze your past job application history.</p>
            </div>
            <div className="flex gap-xs">
              <button className="px-sm py-xs border border-outline-variant rounded font-body-sm font-semibold hover:bg-surface-container-low transition-colors">
                <span className="material-symbols-outlined align-middle mr-xs text-[18px]">filter_list</span>Filter
              </button>
              <button className="px-sm py-xs border border-outline-variant rounded font-body-sm font-semibold hover:bg-surface-container-low transition-colors">
                <span className="material-symbols-outlined align-middle mr-xs text-[18px]">download</span>Export CSV
              </button>
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
                    <th className="px-md py-sm font-label-caps text-label-caps text-on-surface-variant border-b border-outline-variant">ARCHIVED DATE</th>
                    <th className="px-md py-sm font-label-caps text-label-caps text-on-surface-variant border-b border-outline-variant text-right">ACTION</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/30">
                  {archived.map((a) => (
                    <tr key={a.company} className="hover:bg-surface-container-low/50 transition-colors cursor-default">
                      <td className="px-md py-md">
                        <div className="flex items-center gap-sm">
                          <div className="w-8 h-8 bg-surface-container-high rounded flex items-center justify-center font-bold text-primary">{a.initial}</div>
                          <span className="font-body-lg font-semibold text-primary">{a.company}</span>
                        </div>
                      </td>
                      <td className="px-md py-md"><span className="font-body-sm text-on-surface">{a.role}</span></td>
                      <td className="px-md py-md">
                        <span className="px-xs py-1 rounded bg-slate-100 text-slate-700 font-label-caps text-[10px] uppercase">{a.reason}</span>
                      </td>
                      <td className="px-md py-md"><span className="font-body-sm text-secondary">{a.date}</span></td>
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
              <span className="font-body-sm text-secondary">Showing {archived.length} of 24 applications</span>
              <div className="flex gap-base">
                <button className="p-base hover:bg-surface-container rounded transition-colors"><span className="material-symbols-outlined text-[18px]">chevron_left</span></button>
                <button className="w-8 h-8 flex items-center justify-center bg-primary text-on-primary rounded text-body-sm font-bold">1</button>
                <button className="w-8 h-8 flex items-center justify-center hover:bg-surface-container rounded text-body-sm">2</button>
                <button className="w-8 h-8 flex items-center justify-center hover:bg-surface-container rounded text-body-sm">3</button>
                <button className="p-base hover:bg-surface-container rounded transition-colors"><span className="material-symbols-outlined text-[18px]">chevron_right</span></button>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center py-lg opacity-40 grayscale pointer-events-none">
            <div className="text-center">
              <span className="material-symbols-outlined text-display-lg block mb-sm">inventory_2</span>
              <p className="font-body-sm">Detailed feedback for archived applications is available for 90 days.</p>
            </div>
          </div>
        </section>

      </main>
    </div>
  );
}