// Admin page for managing all events
// app/admin/event-management/page.tsx

import { AdminAllEventsList } from "@/components/features/admin-all-events-list";

export default function AdminEventManagementPage() {
  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Quản lý sự kiện</h1>
        <p className="text-base-content/60">
          Quản lý tất cả sự kiện trong hệ thống
        </p>
      </div>
      <AdminAllEventsList />
    </div>
  );
}
