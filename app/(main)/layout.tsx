// The main layout for the application, including navbar and session management.
// app/(main)/layout.tsx

import { Navbar } from "@/components/shared/navbar";
import { MobileDrawer } from "@/components/shared/mobile-drawer";
import { SessionManager } from "@/components/shared/session-manager";
import { Footer } from "@/components/shared/footer";
import { ScrollToTop } from "@/components/shared/scroll-to-top";
import { Toaster } from "react-hot-toast";

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
        <ScrollToTop />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: "#333",
              color: "#fff",
            },
            success: {
              iconTheme: {
                primary: "#10b981",
                secondary: "#fff",
              },
            },
            error: {
              iconTheme: {
                primary: "#ef4444",
                secondary: "#fff",
              },
            },
          }}
        />
      </div>
    </MobileDrawer>
  );
}
