// The main layout for the application, including navbar and session management.
// app/(main)/layout.tsx

import { Navbar } from "@/components/shared/navbar";
import { MobileDrawer } from "@/components/shared/mobile-drawer";
import { SessionManager } from "@/components/shared/session-manager";
import { Footer } from "@/components/shared/footer";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <MobileDrawer>
      <div className="flex flex-col min-h-screen">
        <SessionManager />
        <Navbar />
        <main className="container mx-auto p-4 md:p-6 lg:p-8 flex-grow">
          {children}
        </main>
        <Footer />
      </div>
    </MobileDrawer>
  );
}
