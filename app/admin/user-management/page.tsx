// The main page for user management in the admin panel
// app/admin/user-management/page.tsx

import { UserList } from '@/components/features/admin-user-list';

export default function UserManagementPage() {
    return (
        <div className="max-w-6xl mx-auto p-4 md:p-8 text-base-content">
            <h1 className="text-3xl font-bold mb-8">Admin - Quản lý người dùng</h1>
            <div className="bg-base-100 text-base-content p-6 rounded-lg shadow-md border border-base-300">
                <UserList />
            </div>
        </div>
    );
}