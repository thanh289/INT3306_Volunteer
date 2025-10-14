// Renders the main navigation bar, dynamically displaying content based on auth status.

'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { Role } from '@prisma/client';

export const Navbar = () => {
    // use session to get in4 of user
    // data:session -> name, email, ...
    // status: loading, authenticated, unauthenticated
    const { data: session, status } = useSession();
    const userRole = session?.user?.role as Role;

    return (
        <nav className="bg-white shadow-md">
            <div className="container mx-auto px-6 py-3 flex justify-between items-center">
                <Link href="/" className="text-xl font-bold text-indigo-600">
                    VolunteerHub
                </Link>
                <div className="flex items-center space-x-4">
                    {/* loading state */}
                    {status === 'loading' && (
                        <div className="h-5 w-20 bg-gray-200 rounded animate-pulse"></div>
                    )}

                    {/* if user signed in */}
                    {status === 'authenticated' && session?.user && (
                        <>
                            <Link
                                href="/dashboard"
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                            >
                                Bảng tin
                            </Link>
                            <Link
                                href="/my-events"
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                            >
                                Sự kiện của tôi
                            </Link>

                            {/* This button only shown for manager and admin */}
                            {(userRole === 'EVENT_MANAGER' || userRole === 'ADMIN') && (
                                <Link
                                    href="/events/create"
                                    className="px-4 py-2 text-sm font-medium text-white bg-green-500 rounded-md hover:bg-green-600"
                                >
                                    Tạo sự kiện
                                </Link>
                            )}

                            <Link
                                href="/profile"
                                className="px-4 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100"
                            >
                                Hồ sơ
                            </Link>

                            <span className="text-gray-700">Chào, {session.user.name || session.user.email}</span>
                            <button
                                onClick={() => signOut({ callbackUrl: '/login' })}
                                className="px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-md hover:bg-red-600"
                            >
                                Đăng xuất
                            </button>
                        </>
                    )}

                    {/* if user haven't signed in */}
                    {status === 'unauthenticated' && (
                        <>
                            <Link
                                href="/login"
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                            >
                                Đăng nhập
                            </Link>
                            <Link
                                href="/register"
                                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
                            >
                                Đăng ký
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
};