"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema, type RegisterInput } from "@ai-hiring/shared-types";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { apiFetch } from "@/lib/api-client";

interface AuthResponse {
  user: { id: string; email: string; role: "candidate" | "company" };
}

export default function RegisterPage() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: { role: "candidate" },
  });

  const role = watch("role");

  async function onSubmit(values: RegisterInput) {
    setServerError(null);
    try {
      const { user } = await apiFetch<AuthResponse>("/auth/register", {
        method: "POST",
        body: JSON.stringify(values),
      });
      router.push(user.role === "company" ? "/company/dashboard" : "/candidate/dashboard");
    } catch (err) {
      setServerError(err instanceof Error ? err.message : "Something went wrong");
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-12">
      <Card className="w-full max-w-sm">
        <h1 className="mb-6 text-xl font-semibold">Create your account</h1>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" {...register("email")} />
            {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>}
          </div>

          <div>
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" {...register("password")} />
            {errors.password && (
              <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="role">I am a</Label>
            <select
              id="role"
              {...register("role")}
              className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
            >
              <option value="candidate">Candidate</option>
              <option value="company">Company</option>
            </select>
          </div>

          {role === "company" && (
            <div>
              <Label htmlFor="companyName">Company name</Label>
              <Input id="companyName" {...register("companyName")} />
              {errors.companyName && (
                <p className="mt-1 text-xs text-red-600">{errors.companyName.message}</p>
              )}
            </div>
          )}

          {serverError && <p className="text-sm text-red-600">{serverError}</p>}

          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? "Creating account..." : "Create account"}
          </Button>
        </form>

        <p className="mt-4 text-center text-sm text-slate-500">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-brand-600 hover:underline">
            Log in
          </Link>
        </p>
      </Card>
    </main>
  );
}
