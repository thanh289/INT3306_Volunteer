// A client component that fetches and displays the list of users for admins

'use client';

import useSWR from 'swr';
import axios from 'axios';
import { User } from '@prisma/client';
import { AdminUserActions } from './admin-user-actions';

const fetcher = (url: string) => axios.get(url).then(res => res.data);

export const UserList = () => {
    const { data: users, isLoading, error } = useSWR<User[]>('/api/admin/users', fetcher);

    if (isLoading) return <p>Đang tải danh sách...</p>;
    if (error) return <p>Không thể tải danh sách người dùng.</p>;
    if (!users) return null;

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Họ và tên</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vai trò</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trạng thái</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hành động</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {users.map((user) => (
                        <tr key={user.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.name}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.role}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                    {user.status === 'ACTIVE' ? 'Hoạt động' : 'Bị khóa'}
                                </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <AdminUserActions user={user} />
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};