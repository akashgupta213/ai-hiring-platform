import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 px-4 text-center">
      <h1 className="text-4xl font-bold">AI Hiring Platform</h1>
      <p className="max-w-md text-slate-600">
        Rank resumes by semantic fit, grade async video interviews with AI, and ship one
        weighted hiring recommendation per candidate.
      </p>
      <div className="flex gap-3">
        <Link href="/login">
          <Button>Log in</Button>
        </Link>
        <Link href="/register">
          <Button variant="ghost">Create account</Button>
        </Link>
      </div>
    </main>
  );
}
