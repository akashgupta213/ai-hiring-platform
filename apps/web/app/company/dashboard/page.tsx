"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api-client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface MeResponse {
  user: { id: string; email: string; role: "candidate" | "company" };
}

export default function CompanyDashboard() {
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);

  // Every protected page follows this same pattern: ask /auth/me, bounce
  // wrong-role or logged-out visitors, otherwise render.
  useEffect(() => {
    apiFetch<MeResponse>("/auth/me")
      .then((res) => {
        if (res.user.role !== "company") {
          router.replace("/candidate/dashboard");
          return;
        }
        setEmail(res.user.email);
      })
      .catch(() => router.replace("/login"));
  }, [router]);

  async function logout() {
    await apiFetch("/auth/logout", { method: "POST" });
    router.replace("/login");
  }

  if (!email) return null;

  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Company dashboard</h1>
        <Button variant="ghost" onClick={logout}>
          Log out
        </Button>
      </div>
      <Card>
        <p className="text-slate-600">
          Signed in as <span className="font-medium text-slate-900">{email}</span>.
        </p>
        <p className="mt-2 text-sm text-slate-500">
          Job postings and your AI-ranked shortlist land here once the jobs pipeline ships in
          Week 2.
        </p>
      </Card>
    </main>
  );
}
