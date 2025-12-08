// Shared authentication container component with modern split layout design
// src/components/auth/AuthContainer.tsx

import { ReactNode } from "react";
import Image from "next/image";

interface AuthContainerProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
}

export default function AuthContainer({
  children,
  title,
  subtitle,
}: AuthContainerProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-base-100 to-secondary/10 p-4 lg:p-0">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/5 rounded-full blur-3xl animate-pulse"></div>
      </div>

      <div className="relative w-full max-w-7xl mx-auto">
        {/* Split Layout Container */}
        <div className="grid lg:grid-cols-2 gap-0 bg-base-100 shadow-2xl rounded-3xl overflow-hidden border border-base-300/50 backdrop-blur-xl">
          {/* Left Side - Image/Illustration (Hidden on mobile) */}
          <div className="hidden lg:flex relative bg-gradient-to-br from-primary to-secondary p-12 items-center justify-center overflow-hidden">
            {/* Animated background pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-10 left-10 w-32 h-32 border-4 border-white rounded-full animate-ping"></div>
              <div className="absolute bottom-20 right-20 w-24 h-24 border-4 border-white rounded-full animate-pulse"></div>
              <div
                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 border-4 border-white rounded-full animate-spin"
                style={{ animationDuration: "20s" }}
              ></div>
            </div>

            {/* Content */}
            <div className="relative z-10 text-white space-y-8 animate-fade-in">
              {/* Logo */}
              <div className="flex items-center gap-3">
                <div className="relative w-12 h-12">
                  <Image
                    src="/images/logo.webp"
                    alt="VolunteerHub Logo"
                    fill
                    className="object-contain"
                  />
                </div>
                <h2 className="text-2xl font-bold">VolunteerHub</h2>
              </div>

              {/* Main illustration/image area */}
              <div className="space-y-6">
                <h3 className="text-4xl font-bold leading-tight">
                  Kết nối những trái tim
                  <br />
                  thiện nguyện
                </h3>
                <p className="text-lg text-white/90 leading-relaxed">
                  Tham gia cộng đồng tình nguyện viên lớn nhất Việt Nam. Cùng
                  nhau tạo nên sự khác biệt cho xã hội.
                </p>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-6 pt-8 border-t border-white/20">
                <div>
                  <div className="text-3xl font-bold">1K+</div>
                  <div className="text-sm text-white/80">Tình nguyện viên</div>
                </div>
                <div>
                  <div className="text-3xl font-bold">500+</div>
                  <div className="text-sm text-white/80">Sự kiện</div>
                </div>
                <div>
                  <div className="text-3xl font-bold">10K+</div>
                  <div className="text-sm text-white/80">Giờ tình nguyện</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Form */}
          <div className="p-8 lg:p-12 flex flex-col justify-center animate-slide-in-right">
            {/* Mobile Logo (Shown on mobile only) */}
            <div className="lg:hidden text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-secondary mb-4 shadow-lg">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8 text-primary-content"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </svg>
              </div>
            </div>

            {/* Title */}
            <div className="mb-8">
              <h1 className="text-3xl lg:text-4xl font-bold mb-2">{title}</h1>
              {subtitle && <p className="text-base-content/60">{subtitle}</p>}
            </div>

            {/* Content (Form) */}
            <div className="space-y-6">{children}</div>

            {/* Footer text */}
            <p className="text-center text-sm text-base-content/50 mt-8">
              © 2025 VolunteerHub. Nền tảng kết nối tình nguyện viên.
            </p>
          </div>
        </div>
      </div>

      {/* Custom animations */}
      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes slide-in-right {
          from {
            opacity: 0;
            transform: translateX(30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }
        .animate-slide-in-right {
          animation: slide-in-right 0.6s ease-out;
        }
      `}</style>
    </div>
  );
}
