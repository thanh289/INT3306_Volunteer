// A protected page for event managers to see the list of registered volunteers.

import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redirect, notFound } from 'next/navigation';
import prisma from '@/lib/prisma';
import Link from 'next/link';
import { RegistrationActions } from '@/components/features/registration-actions';

type ManageEventPageProps = {
    params: Promise<{
        eventId: string;
    }>;
};

export default async function ManageEventPage({ params }: ManageEventPageProps) {
    const session = await getServerSession(authOptions);
    const { eventId } = await params;

    const event = await prisma.event.findUnique({
        where: { id: eventId },
        include: {
            registrations: {
                include: {
                    user: true,
                },
                orderBy: {
                    createdAt: 'asc',
                },
            },
        },
    });

    if (!event) {
        notFound();
    }

    // Only this manager and admin
    if (!session || (event.creatorId !== session.user.id && session.user.role !== 'ADMIN')) {
        redirect(`/events/${eventId}`);
    }

    const registrations = event.registrations;

    return (
        <div className="max-w-6xl mx-auto p-4 md:p-8">
            <Link href={`/events/${eventId}`} className="text-indigo-600 hover:underline">
                &larr; Quay lại trang sự kiện
            </Link>
            <h1 className="text-3xl font-bold mt-4">Quản lý sự kiện</h1>
            <p className="text-xl text-gray-700 mb-8">{event.title}</p>

            <div className="bg-white p-8 rounded-lg shadow-md">
                <h2 className="text-2xl font-semibold mb-6">Danh sách tình nguyện viên đã đăng ký ({registrations.length})</h2>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">STT</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Họ và tên</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ngày đăng ký</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hành động</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {registrations.map((reg, index) => (
                                <tr key={reg.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{index + 1}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{reg.user.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{reg.user.email}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {new Date(reg.createdAt).toLocaleDateString('vi-VN')}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        {reg.isCompleted ? (
                                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                                Đã hoàn thành
                                            </span>
                                        ) : (
                                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                                                Chưa hoàn thành
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <RegistrationActions registration={reg} />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {registrations.length === 0 && (
                        <p className="text-center py-8 text-gray-500">Chưa có ai đăng ký sự kiện này.</p>
                    )}
                </div>
            </div>
        </div>
    );
}