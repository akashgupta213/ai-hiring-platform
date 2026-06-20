import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Hiring Platform",
  description: "AI-ranked resumes, graded interviews, one hiring recommendation.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
