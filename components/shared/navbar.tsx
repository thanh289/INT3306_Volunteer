// Renders the main navigation bar, dynamically displaying content based on auth status.
// components/shared/navbar.tsx

"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Role } from "@prisma/client";
import { NotificationBell } from "../features/notification-bell";
import Image from "next/image";
import { useEffect, useState } from "react";

export const Navbar = () => {
  // use session to get in4 of user
  // data:session -> name, email, ...
  // status: loading, authenticated, unauthenticated
  const { data: session, status } = useSession();
  const userRole = session?.user?.role as Role;
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div
      className={`navbar bg-base-100 shadow-lg sticky top-0 z-50 border-b border-base-300 transition-all duration-300 ${
        isScrolled ? "py-1" : "py-2"
      }`}
    >
      <div className="container mx-auto flex items-center">
        {/* Mobile menu button */}
        <div className="flex-none lg:hidden">
          <label
            htmlFor="mobile-drawer"
            className="btn btn-square btn-ghost text-2xl"
          >
            ☰
          </label>
        </div>

        {/* Logo */}
        <div className="flex-1">
          <Link
            href="/"
            className="btn btn-ghost normal-case text-xl gap-2 hover:scale-105 transition-all duration-300 px-3 py-2 h-auto min-h-0 bg-transparent hover:bg-transparent border-none shadow-none"
          >
            <div
              className={`relative transition-all duration-300 overflow-hidden rounded-full ${
                isScrolled ? "w-10 h-10" : "w-12 h-12"
              }`}
            >
              <Image
                src="/images/logo.webp"
                alt="VolunteerHub Logo"
                fill
                className="object-contain"
                priority
              />
            </div>
            <span
              className={`hidden sm:inline bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent font-extrabold bg-[length:200%_auto] animate-gradient drop-shadow-sm transition-all duration-300 ${
                isScrolled ? "text-2xl" : "text-3xl"
              }`}
            >
              VolunteerHub
            </span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <div className="flex-none hidden lg:flex items-center gap-1">
          {/* Home Link - Always visible */}
          <Link
            href="/"
            className="btn btn-ghost flex-col gap-0 px-3 py-2 h-auto min-h-0 hover:bg-base-200 transition-all duration-300"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-7 w-7"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              />
            </svg>
            <span
              className={`text-xs transition-all duration-700 overflow-hidden ${
                isScrolled ? "opacity-0 max-h-0" : "opacity-100 max-h-6 mt-1"
              }`}
            >
              Trang chủ
            </span>
          </Link>

          {/* About Link - Always visible */}
          <Link
            href="/about"
            className="btn btn-ghost flex-col gap-0 px-3 py-2 h-auto min-h-0 hover:bg-base-200 transition-all duration-300"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-7 w-7"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span
              className={`text-xs transition-all duration-700 overflow-hidden ${
                isScrolled ? "opacity-0 max-h-0" : "opacity-100 max-h-6 mt-1"
              }`}
            >
              Về chúng tôi
            </span>
          </Link>

          {/* Contact Link - Always visible */}
          <Link
            href="/contact"
            className="btn btn-ghost flex-col gap-0 px-3 py-2 h-auto min-h-0 hover:bg-base-200 transition-all duration-300"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-7 w-7"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
            <span
              className={`text-xs transition-all duration-700 overflow-hidden ${
                isScrolled ? "opacity-0 max-h-0" : "opacity-100 max-h-6 mt-1"
              }`}
            >
              Liên hệ
            </span>
          </Link>

          {status === "loading" && <div className="skeleton h-10 w-24"></div>}

          {status === "authenticated" && session?.user && (
            <>
              {/* Dashboard */}
              <Link
                href="/dashboard"
                className="btn btn-ghost flex-col gap-0 px-3 py-2 h-auto min-h-0 hover:bg-base-200 transition-all duration-300"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-7 w-7"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
                <span
                  className={`text-xs transition-all duration-700 overflow-hidden ${
                    isScrolled
                      ? "opacity-0 max-h-0"
                      : "opacity-100 max-h-6 mt-1"
                  }`}
                >
                  Bảng tin
                </span>
              </Link>

              {/* Volunteer: Registered Events */}
              {userRole === "VOLUNTEER" && (
                <>
                  <Link
                    href="/registered-events"
                    className="btn btn-ghost flex-col gap-0 px-3 py-2 h-auto min-h-0 hover:bg-base-200 transition-all duration-300"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-7 w-7"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                      />
                    </svg>
                    <span
                      className={`text-xs transition-all duration-700 overflow-hidden ${
                        isScrolled
                          ? "opacity-0 max-h-0"
                          : "opacity-100 max-h-6 mt-1"
                      }`}
                    >
                      Đã đăng ký
                    </span>
                  </Link>
                  <Link
                    href="/interested-events"
                    className="btn btn-ghost flex-col gap-0 px-3 py-2 h-auto min-h-0 hover:bg-base-200 transition-all duration-300"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-7 w-7"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                      />
                    </svg>
                    <span
                      className={`text-xs transition-all duration-700 overflow-hidden ${
                        isScrolled
                          ? "opacity-0 max-h-0"
                          : "opacity-100 max-h-6 mt-1"
                      }`}
                    >
                      Quan tâm
                    </span>
                  </Link>
                </>
              )}

              {/* Manager/Admin: Created Events */}
              {(userRole === "EVENT_MANAGER" || userRole === "ADMIN") && (
                <Link
                  href="/created-events"
                  className="btn btn-ghost flex-col gap-0 px-3 py-2 h-auto min-h-0 hover:bg-base-200 transition-all duration-300"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-7 w-7"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <span
                    className={`text-xs transition-all duration-700 overflow-hidden ${
                      isScrolled
                        ? "opacity-0 max-h-0"
                        : "opacity-100 max-h-6 mt-1"
                    }`}
                  >
                    Đã tạo
                  </span>
                </Link>
              )}

              {/* Manager/Admin: Create Event Button */}
              {(userRole === "EVENT_MANAGER" || userRole === "ADMIN") && (
                <Link
                  href="/events/create"
                  className="btn btn-primary flex-col gap-0 px-3 py-2 h-auto min-h-0 transition-all duration-300"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-7 w-7"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                  <span
                    className={`text-xs transition-all duration-700 overflow-hidden ${
                      isScrolled
                        ? "opacity-0 max-h-0"
                        : "opacity-100 max-h-6 mt-1"
                    }`}
                  >
                    Tạo sự kiện
                  </span>
                </Link>
              )}

              {/* Admin Panel */}
              {userRole === "ADMIN" && (
                <Link
                  href="/admin/event-approval"
                  className="btn btn-secondary flex-col gap-0 px-3 py-2 h-auto min-h-0 transition-all duration-300"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-7 w-7"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                    />
                  </svg>
                  <span
                    className={`text-xs transition-all duration-700 overflow-hidden ${
                      isScrolled
                        ? "opacity-0 max-h-0"
                        : "opacity-100 max-h-6 mt-1"
                    }`}
                  >
                    Admin
                  </span>
                </Link>
              )}

              {/* Notification Bell */}
              {/* <NotificationBell /> */}

              {/* User Dropdown */}
              <div className="dropdown dropdown-end">
                <label
                  tabIndex={0}
                  className="btn btn-ghost gap-2 px-3 py-2 h-auto min-h-0 hover:bg-base-200 transition-all duration-300"
                >
                  <div className="avatar placeholder w-10 h-10 relative rounded-full overflow-hidden">
                    {session.user.imageUrl ? (
                      <Image
                        src={
                          "/" +
                          session.user.imageUrl
                            .replace(/\\/g, "/")
                            .replace(/^\/+/, "")
                        }
                        alt="Avatar"
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="bg-primary text-primary-content w-full h-full flex items-center justify-center">
                        <span className="text-xs font-semibold">
                          {session.user.name?.charAt(0).toUpperCase() ||
                            session.user.email?.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                  </div>
                  <span className="hidden xl:inline">
                    {session.user.name || session.user.email}
                  </span>
                </label>
                <ul
                  tabIndex={0}
                  className="dropdown-content menu p-2 shadow-xl bg-base-100 rounded-box w-52 mt-4 border border-base-300"
                >
                  <li>
                    <Link href="/profile" className="gap-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                      Hồ sơ
                    </Link>
                  </li>
                  <li>
                    <button
                      onClick={() => signOut({ callbackUrl: "/" })}
                      className="gap-2 text-error"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                        />
                      </svg>
                      Đăng xuất
                    </button>
                  </li>
                </ul>
              </div>
            </>
          )}

          {status === "unauthenticated" && (
            <>
              <Link
                href="/login"
                className="btn flex-col gap-0 px-3 py-2 h-auto min-h-0 bg-cyan-600 hover:bg-cyan-700 text-white border-cyan-600 transition-all duration-300"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-7 w-7"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                  />
                </svg>
                <span
                  className={`text-xs transition-all duration-700 overflow-hidden ${
                    isScrolled
                      ? "opacity-0 max-h-0"
                      : "opacity-100 max-h-6 mt-1"
                  }`}
                >
                  Đăng nhập
                </span>
              </Link>
            </>
          )}
        </div>

        {/* Notification Bell - always visible if authenticated */}
        {status === "authenticated" && (
          <div className="flex-none">
            <NotificationBell />
          </div>
        )}
      </div>
    </div>
  );
};
