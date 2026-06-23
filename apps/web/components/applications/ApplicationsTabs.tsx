"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { label: "ACTIVE", count: 12, href: "/candidate/applications" },
  { label: "INTERVIEWING", count: 4, href: "/candidate/applications/interviewing" },
  { label: "OFFERS", count: 1, href: "/candidate/applications/offers" },
  { label: "ARCHIVED", count: 28, href: "/candidate/applications/archived" },
];

export default function ApplicationsTabs() {
  const pathname = usePathname();
  return (
    <div className="flex border-b border-outline-variant mt-sm">
      {tabs.map((t) => {
        const active = pathname === t.href;
        return (
          <Link
            key={t.label}
            href={t.href}
            className={`px-md py-sm font-label-caps text-label-caps transition-colors ${
              active ? "text-primary border-b-2 border-primary" : "text-secondary hover:text-primary"
            }`}
          >
            {t.label} ({t.count})
          </Link>
        );
      })}
    </div>
  );
}
