"use client";

import React from "react";
import ApplicationsTabs from "@/components/applications/ApplicationsTabs";

const interviews = [
  {
    id: 1,
    role: "Senior Product Designer",
    company: "Symmetry Cloud",
    logo: "https://lh3.googleusercontent.com/aida-public/AB6AXuAEG9ZYhr2Yh1G9_KcBiQEfnDXdq4eBpR-dTolCcb128BXJ65Cwix56YLPGFR38piWjNRf0_3_NV2hmu-cEj_N-1XlBWeJ7enaBMyOp-OJngkj5NU8JEdjmMShiGD9qxlzj2qf0KEN_B0Kgvrlp5oVIsbWWZGLUPJlm8121qp54YjjvnCAUPRfaKD1Vvh9HJ_-mtXd4stAFSpaUlbAMWXz1Gi0vmirT9lJ5qEf63U_vE-gVRANGURw-32GvHtLEm02KkT6lZOTE2aM",
    date: "Oct 24, 2023",
    time: "10:00 AM — 11:00 AM",
    urgent: false,
    interviewer: "Elena Rodriguez",
    avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuBSs_JIvtoAzogIRoAQS6XcF4uL5lCQKBh8_kwu8DtVWQZemS7-UxAgQLEVUazyMUtiQoIr6oeZ1gYlr0KZnOdMf-vWyXreRDXYmmrObMGtXnE7t7Nynd9x471KkolYb68ocpUfDnLQ3xfVEgjwSQYvOsVzR-Q3P7_RpdsnaYC847v0d2-hy_dJdK6trX0SZH6fy1NNrMM4LHjmF8_Yl0Bx6TM-FxJ5W1ACO5OWDMFxL9x5UhQr8XXy6aXKFZ-K42fnpBJxW3ExCSQ",
  },
  {
    id: 2,
    role: "Lead Systems Engineer",
    company: "Apex Systems",
    logo: "https://lh3.googleusercontent.com/aida-public/AB6AXuB5wzdMm2NAu0t1a2O0qoRPejTsOUS-vOcgScsDF1E_7gd7yNDYPFflMGHz8U7mnkkV1HqeVUIYZYnL3z3laROEv_BenAH8mNipUiYt6yTwyFQyksd1-_jrbW4VApfA4HMqMVZlRbLohmnlDvOx97ZqZNNkeZrj57B490bZimqVPWbESR2avrUlQhPWxT8cmtnhdOAGPqVHQ_qkiG6VaxwKTSemXiEYriY2JZR8MBuyImOnIg-bYThleCXGMbTpAW2C1p-9y0tX4gA",
    date: "Oct 26, 2023",
    time: "2:30 PM — 3:30 PM",
    urgent: false,
    interviewer: "Marcus Chen",
    avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuCGnzOFYmjAaTJfGoIsi2Ycp_f36gNiIP3iuDG2HcFGheif2YSDsOVr0snr3LzpN8FFdCA3AerQO03WgqHN5PJxRQCYcsUC0i7NWBpvYtQ1IwyKRhqX5X0zxvulnzN_Vplqnkq5qnhtDdbahG51JsNaIpt7a2FWdMA0dlhgPppuUh2HhvmJj26_KSADSEktf_FaCsBpa03kwdjzWVrhusd_YzCq3n-JJ6p2agEKWcoVj6b4-yfPKnNPTeDY190CrmdSMJaq6EauDd8",
  },
  {
    id: 3,
    role: "Fullstack Developer",
    company: "Flow Fintech",
    logo: "https://lh3.googleusercontent.com/aida-public/AB6AXuAtDV7qmxdiXzqiNxe_lLKbHA1QCjc_pAp5ORD5HBBHFdlUPIZ2cjq_ifUIYTmzryzqw12nhJFWE-6FwLB3hjxaLcZeOBiOOOojGt-qUUThznpBYrMXNIQ1QEAX7OBVg_q1MuGPuic0ss34X9p6r5pL92zzMto9-lbgPBhzjOUb4daBy4Uoc0oQSOCtRyP-m-xG0OrpIEDoGXyUFemx2pHPmFNBpTHRKuWpwoJwBc3iqoMUD8yEADWTv8vDAtEIRsdPOnRVaKjxKps",
    date: "Tomorrow",
    time: "9:00 AM — 10:00 AM",
    urgent: true,
    interviewer: "Sarah Jenkins",
    avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuCzJlN9xeN-fflsMnYBNklhQbCoUGWJMa9fAhIfHgYhrmEildPwNoSDbdHS__gfFMID5_Vf5--y8rETROhKGde-O9BE-GFC6mlUEmmYmPxM4gjhPbeFl-YqttdM_OCRb03-IF4vAcW2QZts4ijtre0KWcx665yi_Ety1xrm6PK9diTJe-BDPQgwh0D8UoyLFuDmeU8oUmRtkBwm9p10HjwQzLsmTP_yhPWJKO0Vt0zm52_f8aF81TBfM34kkeFXTOdq7_4bWBl0ffY",
  },
  {
    id: 4,
    role: "AI Research Scientist",
    company: "Orbit AI",
    logo: "https://lh3.googleusercontent.com/aida-public/AB6AXuBJCnf6FPplwgT7H8aYZqQ-Gvw7NmnW8a1M1t7xvetCHvRFhU5Qio_t2_Hp8ZDsDh6VQTR-ZQbpaKYufm0_MojRWWFOcklIy61BF4gYmFVXvAGSbwEJg7DnAXlq26Cj8D5lrirIfOhe0P8YtWUkb1SeHb4BFWnJWqccX6iEBRsf5xKmCZHi8tZM84xuO2FjfPNH5ckt1dzF1335i2gwbp809X-K2onLZVckd0P7eguu_HmvqQm3CSskiBTpiwEKZx9NHAB72o5gI5Q",
    date: "Nov 02, 2023",
    time: "11:00 AM — 12:30 PM",
    urgent: false,
    interviewer: "Dr. Arthur Vance",
    avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuB03JvS5N2JtpDNSVPsAeZW_0O7H_vmNfmUZUbWWxY-yoxBQ43_M_gVtvXoMi0YWnRMP6EZ3p6u9xabSNNJhIbqrqE0H-xm85p96ZC3tgDk6yRez3GOkXHxIxj-KAeUJNu1rjFNSRABbRHVcImTNzK4Avg8XKcF3tckL78KR-ZSoV7cdri2aKD98N0jbTTZDba3SEH08DjDd7aw_tMFf0xs2jfJfWIk3IzOZh6AOPCffAm8TDu1fVHKNV8-YuGD-KF37O9aJKm0ZyM",
  },
];

const events = [
  { month: "Oct", day: "24", title: "Symmetry: Final Round", meta: "Virtual — 10:00 AM", dim: false },
  { month: "Oct", day: "26", title: "Apex: Technical Assessment", meta: "In-person — 2:30 PM", dim: true },
];

const prepChips = ["Interview Guides", "Salary Calculator", "Portfolio Review", "Mock Interview"];

export default function InterviewingPage() {
  return (
    <div className="bg-background text-on-background min-h-screen mx-auto px-margin-safe">
      <ApplicationsTabs />

      <main className="max-w-[1440px] mx-auto px-margin-safe py-lg">
        <div className="mb-lg">
          <h1 className="font-headline-lg text-headline-lg text-primary mb-base">Interviewing</h1>
          <p className="text-secondary font-body-sm">Track your progress and upcoming interview schedules.</p>
        </div>

        <div className="grid grid-cols-12 gap-gutter">
          {/* Interviews table */}
          <div className="col-span-12 lg:col-span-8">
            <div className="bg-white border border-outline-variant rounded-lg overflow-hidden">
              <div className="p-md border-b border-outline-variant flex justify-between items-center bg-surface-container-low">
                <h2 className="font-title-md text-title-md">Upcoming Interviews ({interviews.length})</h2>
                <div className="flex items-center gap-xs">
                  <button className="material-symbols-outlined p-2 text-secondary hover:text-primary hover:bg-white rounded-lg transition-all border border-transparent hover:border-outline-variant">filter_list</button>
                  <button className="material-symbols-outlined p-2 text-secondary hover:text-primary hover:bg-white rounded-lg transition-all border border-transparent hover:border-outline-variant">sort</button>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-white border-b border-outline-variant">
                    <tr>
                      <th className="px-md py-4 font-label-caps text-label-caps text-secondary uppercase">Role & Company</th>
                      <th className="px-md py-4 font-label-caps text-label-caps text-secondary uppercase">Schedule</th>
                      <th className="px-md py-4 font-label-caps text-label-caps text-secondary uppercase">Interviewer</th>
                      <th className="px-md py-4 font-label-caps text-label-caps text-secondary uppercase text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant">
                    {interviews.map((i) => (
                      <tr key={i.id} className="hover:bg-surface-container-low transition-colors group">
                        <td className="px-md py-sm">
                          <div className="flex items-center gap-sm">
                            <div className="w-12 h-12 bg-surface-container-highest flex items-center justify-center rounded-lg border border-outline-variant">
                              <img className="w-8 h-8 object-contain" src={i.logo} alt={i.company} />
                            </div>
                            <div>
                              <div className="font-title-md text-[16px] text-primary">{i.role}</div>
                              <div className="text-secondary font-body-sm">{i.company}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-md py-sm">
                          <div className="flex flex-col">
                            <span className={`font-semibold font-body-sm ${i.urgent ? "text-error" : "text-primary"}`}>{i.date}</span>
                            <span className="text-secondary font-body-sm">{i.time}</span>
                          </div>
                        </td>
                        <td className="px-md py-sm">
                          <div className="flex items-center gap-xs">
                            <img className="w-6 h-6 rounded-full object-cover" src={i.avatar} alt={i.interviewer} />
                            <span className="text-primary font-body-sm">{i.interviewer}</span>
                          </div>
                        </td>
                        <td className="px-md py-sm text-right">
                          <button className="bg-primary text-white font-label-caps text-label-caps px-4 py-2 rounded-lg hover:bg-on-primary-fixed-variant transition-all">
                            PREPARE
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="p-md bg-surface border-t border-outline-variant flex items-center justify-between">
                <span className="text-body-sm text-secondary">Showing {interviews.length} of {interviews.length} active interviews</span>
                <div className="flex gap-xs">
                  <button className="p-2 border border-outline-variant rounded hover:bg-surface-container-low transition-all">
                    <span className="material-symbols-outlined text-sm">chevron_left</span>
                  </button>
                  <button className="p-2 border border-outline-variant rounded hover:bg-surface-container-low transition-all">
                    <span className="material-symbols-outlined text-sm">chevron_right</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="col-span-12 lg:col-span-4 space-y-gutter">
            <div className="bg-white border border-outline-variant rounded-lg p-md sidebar-border-gold">
              <div className="flex items-center gap-xs mb-sm">
                <span className="material-symbols-outlined text-tertiary" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
                <h3 className="font-title-md text-title-md text-primary">HireAI Insights</h3>
              </div>
              <p className="text-body-sm text-secondary mb-md">Based on your recent interviews, here is where you stand compared to other candidates.</p>
              <div className="space-y-md">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-body-sm font-semibold">Technical Skill Match</span>
                    <span className="text-body-sm font-bold">94%</span>
                  </div>
                  <div className="w-full bg-surface-container-low h-2 rounded-full overflow-hidden">
                    <div className="bg-primary h-full" style={{ width: "94%" }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-body-sm font-semibold">Market Salary Alignment</span>
                    <span className="text-body-sm font-bold">Optimal</span>
                  </div>
                  <div className="w-full bg-surface-container-low h-2 rounded-full overflow-hidden">
                    <div className="bg-primary h-full" style={{ width: "80%" }} />
                  </div>
                </div>
                <div className="bg-surface-container-low p-sm rounded-lg border border-outline-variant">
                  <span className="text-label-caps font-label-caps text-secondary uppercase block mb-1">AI Recommendation</span>
                  <p className="text-body-sm text-primary italic">
                    &quot;Your portfolio focus on accessibility was highlighted by Elena Rodriguez. Emphasize this in your upcoming Symmetry interview.&quot;
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white border border-outline-variant rounded-lg overflow-hidden">
              <div className="p-md border-b border-outline-variant">
                <h3 className="font-title-md text-title-md">Schedule Overview</h3>
              </div>
              <div className="p-md space-y-md">
                {events.map((e, idx) => (
                  <div key={idx} className={`flex gap-sm ${e.dim ? "opacity-50" : ""}`}>
                    <div className="flex flex-col items-center justify-center bg-surface-container-low border border-outline-variant rounded-lg w-12 h-12">
                      <span className="font-label-caps text-[10px] text-secondary uppercase">{e.month}</span>
                      <span className="font-bold text-lg leading-tight">{e.day}</span>
                    </div>
                    <div>
                      <p className="text-body-sm font-bold text-primary">{e.title}</p>
                      <p className="text-body-sm text-secondary">{e.meta}</p>
                    </div>
                  </div>
                ))}
              </div>
              <button className="w-full py-4 text-center text-body-sm font-bold border-t border-outline-variant hover:bg-surface-container-low transition-all">
                SYNC TO CALENDAR
              </button>
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
