import { Navbar } from "@/components/shared/navbar";
import { SessionManager } from '@/components/shared/session-manager';

export default function MainLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div>
            <SessionManager />
            <Navbar />
            <main className="container mx-auto p-6">
                {children}
            </main>
        </div>
    );
}