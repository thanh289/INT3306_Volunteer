// A client component for displaying user notifications.

'use client';

import { useState } from 'react';
import useSWR from 'swr';
import axios from 'axios';
import { useRouter } from 'next/navigation';

interface Notification {
    id: string;
    message: string;
    href: string | null;
    isRead: boolean;
    createdAt: string;
}

// fetcher function cho SWR
const fetcher = (url: string) => axios.get(url).then(res => res.data);

export const NotificationBell = () => {
    const [isOpen, setIsOpen] = useState(false);
    const router = useRouter();

    // Use swr for auto fetch và data cache 
    const { data: notifications, mutate } = useSWR<Notification[]>('/api/notifications', fetcher, {
        refreshInterval: 60000 // auto fetch after each 60s
    });

    const unreadCount = notifications?.filter(n => !n.isRead).length || 0;
    console.log(unreadCount)

    const handleToggle = async () => {
        setIsOpen(!isOpen);
        // If the action is open, we want to mark all unread notification to read immediately
        if (!isOpen && unreadCount > 0) {
            await axios.patch('/api/notifications');
            // tell SWR update local data immidiately (optimistic update)
            // false: tell SWR not to fetch now, just update local cache
            // we do this since is just an action of read or undread, not really important
            mutate(notifications?.map(n => ({ ...n, isRead: true })), false);
        }
    };

    const handleNotificationClick = (notification: Notification) => {
        setIsOpen(false);
        if (notification.href) {
            router.push(notification.href);
        }
    };

    return (
        <div className="relative">
            <button onClick={handleToggle} className="relative">
                {/*Bel icon */}
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {/* Number of unread icon */}
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                        {unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown */}
            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg border z-10">
                    <div className="p-4 font-bold border-b">Thông báo</div>
                    <div className="max-h-96 overflow-y-auto">
                        {notifications && notifications.length > 0 ? (
                            notifications.map(n => (
                                <div key={n.id} onClick={() => handleNotificationClick(n)} className={`p-4 border-b hover:bg-gray-100 cursor-pointer ${!n.isRead ? 'bg-indigo-50' : ''}`}>
                                    <p className="text-sm text-gray-700">{n.message}</p>
                                    <p className="text-xs text-gray-400 mt-1">{new Date(n.createdAt).toLocaleString('vi-VN')}</p>
                                </div>
                            ))
                        ) : (
                            <p className="p-4 text-sm text-gray-500">Bạn không có thông báo nào.</p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};