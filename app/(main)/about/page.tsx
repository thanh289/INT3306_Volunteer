// About Us page
// app/(main)/about/page.tsx

import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Về chúng tôi - VolunteerHub",
  description:
    "Tìm hiểu về VolunteerHub - nền tảng kết nối tình nguyện viên và tổ chức",
};

export default function AboutPage() {
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
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-secondary mb-6 shadow-2xl">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-10 w-10 text-primary-content"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
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

      {/* Mission & Vision */}
      <section className="grid md:grid-cols-2 gap-6">
        <div className="card bg-gradient-to-br from-blue-50 to-cyan-50 shadow-xl border-2 border-primary/20 hover:shadow-2xl hover:border-primary/40 transition-all hover:-translate-y-1">
          <div className="card-body">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br from-primary to-secondary mb-4 shadow-lg">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h2 className="card-title text-3xl mb-4 text-primary font-bold">
              Sứ mệnh
            </h2>
            <p className="text-gray-700 leading-relaxed">
              Kết nối tình nguyện viên với các tổ chức và hoạt động thiện
              nguyện, tạo cơ hội cho mọi người đóng góp cho cộng đồng. Chúng tôi
              tin rằng mỗi hành động nhỏ đều có thể tạo nên sự thay đổi lớn.
            </p>
          </div>
        </div>

        <div className="card bg-gradient-to-br from-purple-50 to-pink-50 shadow-xl border-2 border-secondary/20 hover:shadow-2xl hover:border-secondary/40 transition-all hover:-translate-y-1">
          <div className="card-body">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br from-secondary to-accent mb-4 shadow-lg">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
            </div>
            <h2 className="card-title text-3xl mb-4 text-secondary font-bold">
              Tầm nhìn
            </h2>
            <p className="text-gray-700 leading-relaxed">
              Trở thành nền tảng tình nguyện hàng đầu Việt Nam, nơi mọi người có
              thể dễ dàng tìm kiếm và tham gia các hoạt động thiện nguyện phù
              hợp với đam mê và khả năng của mình.
            </p>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="space-y-6">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h2 className="text-4xl font-bold mb-4">Giá trị cốt lõi</h2>
          <p className="text-lg text-base-content/70">
            Những giá trị định hướng mọi hoạt động của chúng tôi
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Value 1 */}
          <div className="card bg-gradient-to-br from-red-50 to-pink-50 shadow-xl border-2 border-red-200 hover:shadow-2xl hover:border-red-300 transition-all hover:-translate-y-2">
            <div className="card-body items-center text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-red-500 to-pink-500 mb-4 shadow-lg">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8 text-white"
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
              <h3 className="card-title text-xl mb-2 text-red-600 font-bold">
                Yêu thương
              </h3>
              <p className="text-gray-700">
                Đặt tình yêu thương và sự quan tâm đến cộng đồng lên hàng đầu
              </p>
            </div>
          </div>

          {/* Value 2 */}
          <div className="card bg-gradient-to-br from-green-50 to-emerald-50 shadow-xl border-2 border-green-200 hover:shadow-2xl hover:border-green-300 transition-all hover:-translate-y-2">
            <div className="card-body items-center text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 mb-4 shadow-lg">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
              </div>
              <h3 className="card-title text-xl mb-2 text-green-600 font-bold">
                Kết nối
              </h3>
              <p className="text-gray-700">
                Xây dựng cầu nối giữa các cá nhân và tổ chức cùng chí hướng
              </p>
            </div>
          </div>

          {/* Value 3 */}
          <div className="card bg-gradient-to-br from-yellow-50 to-orange-50 shadow-xl border-2 border-yellow-200 hover:shadow-2xl hover:border-yellow-300 transition-all hover:-translate-y-2">
            <div className="card-body items-center text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-yellow-500 to-orange-500 mb-4 shadow-lg">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
              <h3 className="card-title text-xl mb-2 text-yellow-600 font-bold">
                Hành động
              </h3>
              <p className="text-gray-700">
                Biến ý tưởng thành hành động cụ thể để tạo ra sự thay đổi
              </p>
            </div>
          </div>

          {/* Value 4 */}
          <div className="card bg-gradient-to-br from-blue-50 to-indigo-50 shadow-xl border-2 border-blue-200 hover:shadow-2xl hover:border-blue-300 transition-all hover:-translate-y-2">
            <div className="card-body items-center text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 mb-4 shadow-lg">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
              </div>
              <h3 className="card-title text-xl mb-2 text-blue-600 font-bold">
                Minh bạch
              </h3>
              <p className="text-gray-700">
                Đảm bảo tính minh bạch trong mọi hoạt động và giao dịch
              </p>
            </div>
          </div>

          {/* Value 5 */}
          <div className="card bg-gradient-to-br from-purple-50 to-violet-50 shadow-xl border-2 border-purple-200 hover:shadow-2xl hover:border-purple-300 transition-all hover:-translate-y-2">
            <div className="card-body items-center text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-violet-500 mb-4 shadow-lg">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                  />
                </svg>
              </div>
              <h3 className="card-title text-xl mb-2 text-purple-600 font-bold">
                Học hỏi
              </h3>
              <p className="text-gray-700">
                Không ngừng học hỏi và cải thiện để phục vụ tốt hơn
              </p>
            </div>
          </div>

          {/* Value 6 */}
          <div className="card bg-base-100 shadow-lg border border-base-300 hover:shadow-2xl transition-all hover:-translate-y-1">
            <div className="card-body items-center text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-secondary/10 mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8 text-secondary"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                  />
                </svg>
              </div>
              <h3 className="card-title text-xl mb-2">Chất lượng</h3>
              <p className="text-base-content/70">
                Cam kết mang đến trải nghiệm tốt nhất cho người dùng
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="card bg-gradient-to-br from-primary to-secondary text-primary-content shadow-2xl">
        <div className="card-body py-12">
          <h2 className="text-3xl font-bold text-center mb-10">
            Con số ấn tượng
          </h2>
          <div className="stats stats-vertical lg:stats-horizontal shadow-lg bg-base-100 text-base-content">
            <div className="stat place-items-center">
              <div className="stat-figure text-primary">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-12 w-12"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
              <div className="stat-title">Tình nguyện viên</div>
              <div className="stat-value text-primary">1,000+</div>
              <div className="stat-desc">Người dùng đã đăng ký</div>
            </div>

            <div className="stat place-items-center">
              <div className="stat-figure text-secondary">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-12 w-12"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <div className="stat-title">Sự kiện</div>
              <div className="stat-value text-secondary">500+</div>
              <div className="stat-desc">Hoạt động đã tổ chức</div>
            </div>

            <div className="stat place-items-center">
              <div className="stat-figure text-accent">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-12 w-12"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div className="stat-title">Giờ tình nguyện</div>
              <div className="stat-value text-accent">10,000+</div>
              <div className="stat-desc">Giờ đóng góp cho cộng đồng</div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="card bg-base-100 shadow-lg border border-base-300">
        <div className="card-body items-center text-center py-12">
          <h2 className="text-3xl font-bold mb-4">Tham gia cùng chúng tôi</h2>
          <p className="text-lg text-base-content/70 max-w-2xl mb-8">
            Hãy trở thành một phần của cộng đồng tình nguyện VolunteerHub. Cùng
            nhau, chúng ta có thể tạo ra những thay đổi tích cực cho xã hội.
          </p>
          <div className="flex gap-4 flex-wrap justify-center">
            <a href="/register" className="btn btn-primary btn-lg gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                />
              </svg>
              Đăng ký ngay
            </a>
            <a href="/" className="btn btn-outline btn-lg gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              Khám phá sự kiện
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
