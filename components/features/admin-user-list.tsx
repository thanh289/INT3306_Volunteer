// A client component that fetches and displays the list of users for admins

'use client';

import { useState } from 'react';
import useSWR from 'swr';
import axios from 'axios';
import { User } from '@prisma/client';
import { AdminUserActions } from './admin-user-actions';

const fetcher = (url: string) => axios.get(url).then(res => res.data);

export const UserList = () => {
    const { data: users, isLoading, error } = useSWR<User[]>('/api/admin/users', fetcher);
    const [isExporting, setIsExporting] = useState(false);

    const handleExport = async () => {
        setIsExporting(true);
        try {
            const response = await axios.get('/api/admin/users/export', {
                responseType: 'blob', // binary blob, raw data
            });

            const bom = '\uFEFF'; // Byte Order Mark, for utf8
            const blobWithBom = new Blob([bom, response.data], { type: 'text/csv;charset=utf-8;' });

            // create a temporary URL to download
            const url = window.URL.createObjectURL(blobWithBom);
            const link = document.createElement('a');
            link.href = url;


            const contentDisposition = response.headers['content-disposition']; // take header Content-Disposition
            let fileName = 'users_export.csv';
            if (contentDisposition) {
                const fileNameMatch = contentDisposition.match(/filename="(.+)"/); // @@, welp, use regex to get filename
                if (fileNameMatch.length === 2) fileName = fileNameMatch[1];
            }

            link.setAttribute('download', fileName);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url); // after download, delete <a> and take back URL to release memory

        } catch (err) {
            console.error('Export failed', err);
        } finally {
            setIsExporting(false);
        }
    };

    if (isLoading) return <p>Đang tải danh sách...</p>;
    if (error) return <p>Không thể tải danh sách người dùng.</p>;
    if (!users) return null;

    return (
        <div>
            <div className="flex justify-end mb-4">
                <button
                    onClick={handleExport}
                    disabled={isExporting}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-blue-400"
                >
                    {isExporting ? 'Đang xuất...' : 'Xuất ra CSV'}
                </button>
            </div>

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
        </div>

    );
};