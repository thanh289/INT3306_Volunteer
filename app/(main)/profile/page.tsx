// A protected page for users to view and edit their profile with push notification setting.
// app/(main)/profile/page.tsx

import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import { ProfileForm } from '@/components/features/profile-form';
import { AvatarUpload } from '@/components/features/avatar-upload';
import { PushNotificationSetting } from '@/components/features/push-notification-setting';

export default async function ProfilePage() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        redirect('/login');
    }

    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
    });

    if (!user) {
        redirect('/login');
    }

    return (
        <div className="max-w-4xl mx-auto p-4 md:p-8">
            <h1 className="text-3xl font-bold mb-8">Hồ sơ cá nhân</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Avatar Section */}
                <div className="lg:col-span-1">
                    <div className="card bg-base-100 shadow-lg border border-base-300">
                        <div className="card-body items-center">
                            <h2 className="card-title text-lg mb-4">Ảnh đại diện</h2>
                            <AvatarUpload
                                currentImageUrl={user.imageUrl}
                                userName={user.name}
                            />
                        </div>
                    </div>
                </div>

                {/* Profile Form Section */}
                <div className="lg:col-span-2">
                    <div className="card bg-base-100 shadow-lg border border-base-300">
                        <div className="card-body">
                            <h2 className="card-title text-lg mb-4">Thông tin cá nhân</h2>
                            <ProfileForm user={user} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Push Notification Settings */}
            <div className="card bg-base-100 shadow-lg border border-base-300 mt-6">
                <div className="card-body">
                    <h2 className="card-title text-lg mb-4 flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        Cài đặt
                    </h2>
                    <PushNotificationSetting />
                </div>
            </div>
        </div>
    );
}