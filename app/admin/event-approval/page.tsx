// A protected dashboard for Admins to manage pending events.
// app/admin/event-approval/page.tsx

import { AdminEventList } from '@/components/features/admin-event-list';

export default function EventApprovalPage() {
    return (
        <div className="max-w-4xl mx-auto p-4 md:p-8 text-base-content">
            <h1 className="text-3xl font-bold mb-8">Admin - Duyệt sự kiện</h1>
            <div className="bg-base-100 text-base-content p-6 rounded-lg shadow-md border border-base-300">
                <h2 className="text-2xl font-semibold mb-6">
                    Sự kiện đang chờ duyệt
                </h2>
                <AdminEventList />
            </div>
        </div>
    );
}