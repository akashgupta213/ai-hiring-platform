"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const NAV_LINKS = [
  { label: "Browse Jobs", href: "/candidate/jobs" },
  { label: "Applications", href: "/applications" },
  { label: "Messages", href: "/messages" },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();

  const [mobileOpen, setMobileOpen] = useState(false);

  async function handleLogout() {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch (err) {
      console.error(err);
    }

    router.push("/login");
  }

  return (
    <>
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap"
      />

      <header className="sticky top-0 z-50 w-full h-16 bg-white border-b border-gray-200">

        <nav className="h-full max-w-7xl mx-auto px-8 flex items-center justify-between">

          {/* Left */}
          <div className="flex items-center gap-10">

            {/* Logo */}
            <Link
              href="/candidate/dashboard"
              className="text-[28px] font-bold tracking-tight text-gray-900"
            >
              HireAI
            </Link>

            {/* Desktop Links */}
            <div className="hidden md:flex items-center gap-8">

              {NAV_LINKS.map((link) => {

                const isActive = pathname === link.href;

                return (
                  <Link
                    key={link.label}
                    href={link.href}
                    className={`
                      relative
                      pb-1
                      text-[16px]
                      transition-all
                      ${
                        isActive
                          ? "text-gray-900 font-semibold after:absolute after:left-0 after:bottom-0 after:w-full after:h-[2px] after:bg-gray-900"
                          : "text-gray-500 hover:text-gray-900"
                      }
                    `}
                  >
                    {link.label}
                  </Link>
                );
              })}

            </div>
          </div>

          {/* Right */}
          <div className="flex items-center gap-4">

            {/* Search */}
            <div className="relative hidden lg:block">

              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[20px]">
                search
              </span>

              <input
                type="text"
                placeholder="Search opportunities..."
                className="
                  w-64
                  pl-10
                  pr-4
                  py-2
                  rounded-xl
                  border
                  border-gray-200
                  bg-gray-50
                  text-sm
                  outline-none
                  focus:border-gray-900
                  transition-all
                  placeholder:text-gray-400
                "
              />

            </div>

            {/* Profile */}
            <div
              className="
                flex
                items-center
                gap-2
                px-3
                py-2
                rounded-xl
                hover:bg-gray-50
                cursor-pointer
                transition-all
              "
            >

              <div
                className="
                  w-9
                  h-9
                  rounded-full
                  bg-gray-900
                  text-white
                  flex
                  items-center
                  justify-center
                  font-semibold
                  text-sm
                "
              >
                JS
              </div>

              <span className="hidden sm:block text-[15px] font-semibold text-gray-900">
                Profile
              </span>

              <span className="material-symbols-outlined text-gray-500 text-[20px]">
                expand_more
              </span>

            </div>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="
                hidden
                sm:flex
                items-center
                gap-2
                px-4
                py-2
                rounded-xl
                border
                border-gray-200
                bg-white
                text-gray-700
                hover:bg-red-50
                hover:text-red-600
                hover:border-red-200
                transition-all
              "
            >

              <span className="material-symbols-outlined text-[20px]">
                logout
              </span>

              Logout

            </button>

            {/* Mobile Menu */}
            <button
              className="
                md:hidden
                w-10
                h-10
                rounded-lg
                hover:bg-gray-100
                flex
                items-center
                justify-center
              "
              onClick={() => setMobileOpen(!mobileOpen)}
            >

              <span className="material-symbols-outlined text-gray-900">

                {mobileOpen ? "close" : "menu"}

              </span>

            </button>

          </div>

        </nav>

        {/* Mobile Menu */}

        {mobileOpen && (

          <div className="md:hidden border-t border-gray-200 bg-white px-8 py-5 space-y-4">

            <div className="relative">

              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                search
              </span>

              <input
                type="text"
                placeholder="Search opportunities..."
                className="
                  w-full
                  pl-10
                  pr-4
                  py-2
                  rounded-xl
                  border
                  border-gray-200
                  bg-gray-50
                  text-sm
                  outline-none
                  focus:border-gray-900
                "
              />

            </div>

            {NAV_LINKS.map((link) => {

              const isActive = pathname === link.href;

              return (

                <Link
                  key={link.label}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={`
                    block
                    text-[16px]
                    py-2
                    ${
                      isActive
                        ? "font-semibold text-gray-900"
                        : "text-gray-500"
                    }
                  `}
                >

                  {link.label}

                </Link>

              );
            })}

            <button
              onClick={handleLogout}
              className="
                w-full
                flex
                items-center
                justify-center
                gap-2
                py-3
                rounded-xl
                border
                border-red-200
                text-red-600
                hover:bg-red-50
                transition-all
              "
            >

              <span className="material-symbols-outlined">

                logout

              </span>

              Logout

            </button>

          </div>

        )}

      </header>
    </>
  );
}