// Collapsible sidebar for dashboard
// components/features/dashboard-sidebar.tsx

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Calendar, Heart, Menu } from "lucide-react";
import { usePathname } from "next/navigation";
import { Event, User } from "@prisma/client";

type EventWithCreator = Event & { creator: User };

type DashboardSidebarProps = {
  upcomingEvents: EventWithCreator[];
  interestedEvents: EventWithCreator[];
};

export const DashboardSidebar = ({
  upcomingEvents,
  interestedEvents,
}: DashboardSidebarProps) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();

  // Persist collapse state across navigations
  useEffect(() => {
    const saved = localStorage.getItem("dashboardSidebarCollapsed");
    if (saved !== null) {
      setIsCollapsed(saved === "true");
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("dashboardSidebarCollapsed", String(isCollapsed));
  }, [isCollapsed]);

  // If route changes while this component is mounted, collapse the sidebar
  useEffect(() => {
    setIsCollapsed(true);
    localStorage.setItem("dashboardSidebarCollapsed", "true");
  }, [pathname]);

  // Auto-close when mobile drawer opens
  useEffect(() => {
    const checkDrawer = () => {
      const drawer = document.getElementById(
        "mobile-drawer"
      ) as HTMLInputElement | null;
      if (drawer?.checked) {
        setIsCollapsed(true);
        localStorage.setItem("dashboardSidebarCollapsed", "true");
      }
    };

    const drawer = document.getElementById("mobile-drawer");
    if (drawer) {
      drawer.addEventListener("change", checkDrawer);
      return () => drawer.removeEventListener("change", checkDrawer);
    }
  }, []);

  return (
    <>
      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-20 h-[calc(100vh-5rem)] bg-base-100 border-r border-base-300 transition-all duration-300 z-30 ${
          isCollapsed ? "w-0" : "w-80"
        } overflow-hidden`}
      >
        <div className="h-full overflow-y-auto p-4 space-y-6">
          {/* Upcoming Events Section */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold">Sự kiện sắp tới</h2>
            </div>
            {upcomingEvents.length > 0 ? (
              <div className="space-y-2">
                {upcomingEvents.map((event) => (
                  <Link
                    key={event.id}
                    href={`/events/${event.id}`}
                    onClick={() => {
                      setIsCollapsed(true);
                      try {
                        localStorage.setItem(
                          "dashboardSidebarCollapsed",
                          "true"
                        );
                      } catch {}
                    }}
                    className="block p-3 border border-base-300 rounded-lg hover:bg-base-200 transition-colors"
                  >
                    <p className="font-semibold text-sm text-primary line-clamp-2">
                      {event.title}
                    </p>
                    <p className="text-xs text-base-content/60 mt-1">
                      {event.creator.name}
                    </p>
                    <p className="text-xs text-base-content/40 mt-1">
                      📅{" "}
                      {new Date(event.startDateTime).toLocaleDateString(
                        "vi-VN"
                      )}
                    </p>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-sm text-base-content/60">
                Bạn không có sự kiện nào sắp diễn ra.
              </p>
            )}
          </section>

          {/* Divider */}
          <div className="divider"></div>

          {/* Interested Events Section */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <Heart className="w-5 h-5 text-error" />
              <h2 className="text-lg font-semibold">Sự kiện quan tâm</h2>
            </div>
            {interestedEvents.length > 0 ? (
              <div className="space-y-2">
                {interestedEvents.map((event) => (
                  <Link
                    key={event.id}
                    href={`/events/${event.id}`}
                    onClick={() => {
                      setIsCollapsed(true);
                      try {
                        localStorage.setItem(
                          "dashboardSidebarCollapsed",
                          "true"
                        );
                      } catch {}
                    }}
                    className="block p-3 border border-base-300 rounded-lg hover:bg-base-200 transition-colors"
                  >
                    <p className="font-semibold text-sm text-primary line-clamp-2">
                      {event.title}
                    </p>
                    <p className="text-xs text-base-content/60 mt-1">
                      {event.creator.name}
                    </p>
                    <p className="text-xs text-base-content/40 mt-1">
                      📅{" "}
                      {new Date(event.startDateTime).toLocaleDateString(
                        "vi-VN"
                      )}
                    </p>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-sm text-base-content/60">
                Bạn chưa quan tâm sự kiện nào.
              </p>
            )}
          </section>
        </div>
      </aside>

      {/* Toggle Button - centered vertically */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className={`fixed top-1/2 -translate-y-1/2 ${
          isCollapsed ? "left-3" : "left-[19rem]"
        } z-[35] btn btn-circle btn-sm bg-primary text-white border border-primary shadow-xl transition-all duration-300`}
        title={isCollapsed ? "Mở thanh bên" : "Đóng thanh bên"}
      >
        {isCollapsed ? (
          <Menu className="w-4 h-4" />
        ) : (
          <ChevronLeft className="w-4 h-4" />
        )}
      </button>

      {/* Spacer for content */}
      <div
        className={`transition-all duration-300 ${
          isCollapsed ? "w-0" : "w-80"
        }`}
      />
    </>
  );
};
