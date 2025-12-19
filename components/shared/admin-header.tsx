// A header component for the admin section.
// components/shared/admin-header.tsx

import Link from "next/link";

export const AdminHeader = () => {
  return (
    <header className="bg-base-100 text-base-content border-b border-base-300 backdrop-blur supports-[backdrop-filter]:bg-base-100/90 sticky top-0 z-40">
      <div className="container mx-auto px-3 md:px-6 py-3 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
        <h1 className="text-base sm:text-lg md:text-xl font-bold">
          Bảng điều khiển Admin
        </h1>
        <nav className="flex flex-wrap items-center gap-2 md:gap-3">
          <Link
            href="/admin/event-approval"
            className="btn btn-ghost btn-xs md:btn-sm"
          >
            Duyệt sự kiện
          </Link>
          <Link
            href="/admin/event-management"
            className="btn btn-ghost btn-xs md:btn-sm"
          >
            Quản lý sự kiện
          </Link>
          <Link
            href="/admin/user-management"
            className="btn btn-ghost btn-xs md:btn-sm"
          >
            Quản lý người dùng
          </Link>
          <Link href="/" className="btn btn-primary btn-xs md:btn-sm">
            Về trang chủ
          </Link>
        </nav>
      </div>
    </header>
  );
};
