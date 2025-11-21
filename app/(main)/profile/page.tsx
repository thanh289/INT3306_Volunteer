// A protected page for users to view and edit their profile.
// app/(main)/profile/page.tsx

import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import { ProfileForm } from '@/components/features/profile-form';
import { AvatarUpload } from '@/components/features/avatar-upload';

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
        </div>
    );
}