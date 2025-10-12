import { Navbar } from "@/components/shared/navbar";

export default function MainLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div>
            <Navbar />
            <main className="container mx-auto p-6">
                {children}
            </main>
        </div>
    );
}