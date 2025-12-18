// About Us page
// app/(main)/about/page.tsx

"use client";

import Image from "next/image";
import { useSession } from "next-auth/react";

export default function AboutPage() {
  const { status } = useSession();
  return (
    <div className="space-y-16">
      {/* Hero Section with Team Background */}
      <section className="relative h-96 md:h-[500px] rounded-2xl overflow-hidden shadow-2xl border border-base-300">
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('/images/team.jpg')" }}
        >
          {/* Overlay để text dễ đọc */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-black/40"></div>
        </div>

        {/* Content overlay */}
        <div className="relative h-full flex flex-col items-center justify-center text-center px-6">
          <div className="relative w-20 h-20 mb-6 mx-auto">
            <Image
              src="/images/logo.webp"
              alt="VolunteerHub Logo"
              fill
              className="object-contain drop-shadow-2xl"
            />
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-6 text-white drop-shadow-2xl">
            VolunteerHub
          </h1>
          <p className="text-xl md:text-2xl text-white/90 max-w-3xl leading-relaxed drop-shadow-lg">
            Nền tảng kết nối những trái tim thiện nguyện, tạo dựng một cộng đồng
            tình nguyện viên mạnh mẽ và lan tỏa giá trị nhân văn đến mọi người.
          </p>
        </div>
      </section>

      {/* Story */}
      <section className="max-w-3xl mx-auto">
        <div className="space-y-4 text-base-content/80 leading-relaxed">
          <p>
            VolunteerHub được ra đời từ mong muốn tạo ra một không gian kết nối giữa những người có chung niềm đam mê với hoạt động tình nguyện. 
            Chúng tôi nhận thấy rằng nhiều người muốn tham gia các hoạt động thiện nguyện nhưng không biết bắt đầu từ đâu, trong khi các tổ chức thiện nguyện 
            cũng gặp khó khăn trong việc tìm kiếm và quản lý tình nguyện viên.
          </p>
          <p>
            Nền tảng của chúng tôi giúp đơn giản hóa quy trình này, tạo điều kiện cho mọi người dễ dàng tìm thấy và tham gia các hoạt động phù hợp với 
            sở thích và khả năng của mình, đồng thời giúp các tổ chức thiện nguyện tiếp cận được nguồn nhân lực tình nguyện một cách hiệu quả.
          </p>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
        <div className="p-8 bg-primary/5 border border-primary/20 rounded-lg hover:shadow-md transition-shadow">
          <h2 className="text-2xl font-bold mb-4 text-primary">Sứ mệnh</h2>
          <p className="text-base-content/70 leading-relaxed">
            Kết nối tình nguyện viên với các hoạt động thiện nguyện có ý nghĩa, 
            tạo cơ hội cho mọi người đóng góp vào sự phát triển của cộng đồng.
          </p>
        </div>

        <div className="p-8 bg-secondary/5 border border-secondary/20 rounded-lg hover:shadow-md transition-shadow">
          <h2 className="text-2xl font-bold mb-4 text-secondary">Tầm nhìn</h2>
          <p className="text-base-content/70 leading-relaxed">
            Trở thành nền tảng tình nguyện hàng đầu tại Việt Nam, 
            nơi mọi người có thể dễ dàng tìm kiếm và tham gia các hoạt động thiện nguyện.
          </p>
        </div>
      </section>

      {/* What We Do */}
      <section className="max-w-5xl mx-auto">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="p-6 bg-base-100 border border-base-300 rounded-lg hover:shadow-md hover:border-primary/30 transition-all">
            <h3 className="text-lg font-semibold mb-3 text-primary">Kết nối tình nguyện viên</h3>
            <p className="text-base-content/70">
              Giúp người dùng tìm kiếm và đăng ký tham gia các hoạt động tình nguyện phù hợp với sở thích và thời gian của họ.
            </p>
          </div>
          <div className="p-6 bg-base-100 border border-base-300 rounded-lg hover:shadow-md hover:border-secondary/30 transition-all">
            <h3 className="text-lg font-semibold mb-3 text-secondary">Hỗ trợ tổ chức sự kiện</h3>
            <p className="text-base-content/70">
              Cung cấp công cụ để các tổ chức thiện nguyện dễ dàng đăng tải, quản lý sự kiện và tìm kiếm tình nguyện viên.
            </p>
          </div>
          <div className="p-6 bg-base-100 border border-base-300 rounded-lg hover:shadow-md hover:border-accent/30 transition-all">
            <h3 className="text-lg font-semibold mb-3 text-accent">Xây dựng cộng đồng</h3>
            <p className="text-base-content/70">
              Tạo không gian giao lưu, chia sẻ kinh nghiệm giữa các tình nguyện viên và tổ chức.
            </p>
          </div>
          <div className="p-6 bg-base-100 border border-base-300 rounded-lg hover:shadow-md hover:border-info/30 transition-all">
            <h3 className="text-lg font-semibold mb-3 text-info">Theo dõi đóng góp</h3>
            <p className="text-base-content/70">
              Giúp người dùng theo dõi lịch sử tham gia và những đóng góp của mình cho cộng đồng.
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-base-200/50 border-y border-base-300 py-12">
        <div className="grid grid-cols-3 gap-8 text-center max-w-4xl mx-auto">
          <div>
            <div className="text-4xl font-bold text-primary mb-2">1,000+</div>
            <div className="text-base-content/70">Tình nguyện viên</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-primary mb-2">500+</div>
            <div className="text-base-content/70">Sự kiện</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-primary mb-2">10,000+</div>
            <div className="text-base-content/70">Giờ tình nguyện</div>
          </div>
        </div>
      </section>

      {/* Call to Action - Only show when not authenticated */}
      {status === "unauthenticated" && (
        <section className="text-center space-y-6 py-8">
          <h2 className="text-2xl font-bold">Bắt đầu hành trình của bạn</h2>
          <p className="text-base-content/70 max-w-xl mx-auto">
            Tham gia cùng chúng tôi để tạo ra những thay đổi tích cực cho cộng đồng.
          </p>
          <div className="flex gap-4 justify-center">
            <a href="/register" className="btn btn-primary">
              Đăng ký ngay
            </a>
            <a href="/events" className="btn btn-outline">
              Xem sự kiện
            </a>
          </div>
        </section>
      )}
    </div>
  );
}
