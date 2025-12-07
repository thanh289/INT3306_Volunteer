// Privacy Policy page
// app/(main)/privacy/page.tsx

import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Chính sách bảo mật - VolunteerHub",
  description: "Chính sách bảo mật thông tin người dùng của VolunteerHub",
};

export default function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl md:text-5xl font-bold">
          <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Chính sách bảo mật
          </span>
        </h1>
        <p className="text-base-content/60">Cập nhật lần cuối: 08/12/2025</p>
      </div>

      {/* Content */}
      <div className="card bg-base-100 shadow-lg border border-base-300">
        <div className="card-body prose prose-lg max-w-none">
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-primary">Mở đầu</h2>
            <p className="text-base-content/80 leading-relaxed">
              VolunteerHub cam kết tôn trọng quyền riêng tư và bảo vệ thông tin
              cá nhân của người dùng. Chính sách bảo mật này được xây dựng theo
              Nghị định 13/2023/NĐ-CP về Bảo vệ dữ liệu cá nhân và các quy định
              pháp luật liên quan của Việt Nam.
            </p>
            <div className="alert alert-info">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                className="stroke-current shrink-0 w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                ></path>
              </svg>
              <span className="text-sm">
                Bằng việc sử dụng dịch vụ, bạn đồng ý với chính sách bảo mật
                này.
              </span>
            </div>
          </section>

          <div className="divider"></div>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-primary">
              1. Mục đích và phạm vi thu thập
            </h2>

            <h3 className="text-xl font-semibold">1.1. Mục đích thu thập</h3>
            <p className="text-base-content/80 leading-relaxed">
              VolunteerHub thu thập thông tin cá nhân của bạn nhằm các mục đích
              sau:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4 text-base-content/80">
              <li>
                Cung cấp và vận hành dịch vụ nền tảng kết nối tình nguyện viên
              </li>
              <li>Xác thực danh tính và quản lý tài khoản người dùng</li>
              <li>Hỗ trợ liên hệ giữa tình nguyện viên và tổ chức sự kiện</li>
              <li>Gửi thông báo về sự kiện, hoạt động tình nguyện</li>
              <li>Cải thiện chất lượng dịch vụ và trải nghiệm người dùng</li>
              <li>Tuân thủ các quy định pháp luật hiện hành</li>
            </ul>

            <h3 className="text-xl font-semibold mt-4">
              1.2. Phạm vi thu thập
            </h3>
            <p className="text-base-content/80 leading-relaxed">
              Chúng tôi chỉ thu thập các thông tin cần thiết sau:
            </p>
            <div className="space-y-3">
              <div className="card bg-base-200 p-4">
                <p className="font-semibold mb-2">
                  📝 Thông tin bắt buộc khi đăng ký:
                </p>
                <ul className="text-sm space-y-1 text-base-content/80">
                  <li>• Họ và tên</li>
                  <li>• Địa chỉ email</li>
                </ul>
              </div>
              <div className="card bg-base-200 p-4">
                <p className="font-semibold mb-2">
                  📋 Thông tin tùy chọn (không bắt buộc):
                </p>
                <ul className="text-sm space-y-1 text-base-content/80">
                  <li>• Số điện thoại</li>
                  <li>• Ngày sinh</li>
                  <li>• Giới tính</li>
                  <li>• Địa chỉ</li>
                </ul>
              </div>
              <div className="card bg-base-200 p-4">
                <p className="font-semibold mb-2">📊 Thông tin hoạt động:</p>
                <ul className="text-sm space-y-1 text-base-content/80">
                  <li>• Sự kiện bạn đăng ký và tham gia</li>
                  <li>• Sự kiện bạn tạo (nếu là người tổ chức)</li>
                  <li>• Bài viết và bình luận trên nền tảng</li>
                </ul>
              </div>
            </div>
            <div className="alert alert-success mt-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                className="stroke-current shrink-0 w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                ></path>
              </svg>
              <span className="text-sm">
                Bạn có quyền không cung cấp thông tin tùy chọn. Tuy nhiên, điều
                này có thể ảnh hưởng đến khả năng sử dụng một số tính năng của
                dịch vụ.
              </span>
            </div>
          </section>

          <div className="divider"></div>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-primary">
              2. Phạm vi sử dụng thông tin
            </h2>
            <p className="text-base-content/80 leading-relaxed">
              VolunteerHub cam kết chỉ sử dụng thông tin cá nhân của bạn cho các
              mục đích đã nêu và trong phạm vi sau:
            </p>

            <div className="space-y-3">
              <div className="flex gap-3 items-start">
                <div className="badge badge-primary mt-1">1</div>
                <div>
                  <p className="font-semibold">Vận hành và cung cấp dịch vụ</p>
                  <p className="text-sm text-base-content/70">
                    Xác thực tài khoản, quản lý đăng ký sự kiện, gửi thông báo
                    quan trọng liên quan đến hoạt động của bạn trên nền tảng.
                  </p>
                </div>
              </div>
              <div className="flex gap-3 items-start">
                <div className="badge badge-primary mt-1">2</div>
                <div>
                  <p className="font-semibold">
                    Kết nối tình nguyện viên và tổ chức
                  </p>
                  <p className="text-sm text-base-content/70">
                    Chia sẻ thông tin cần thiết (họ tên, email, số điện thoại)
                    với người tổ chức sự kiện mà bạn đã đăng ký tham gia.
                  </p>
                </div>
              </div>
              <div className="flex gap-3 items-start">
                <div className="badge badge-primary mt-1">3</div>
                <div>
                  <p className="font-semibold">Liên lạc và hỗ trợ</p>
                  <p className="text-sm text-base-content/70">
                    Gửi email thông báo về sự kiện mới, cập nhật dịch vụ, hoặc
                    phản hồi yêu cầu hỗ trợ của bạn.
                  </p>
                </div>
              </div>
              <div className="flex gap-3 items-start">
                <div className="badge badge-primary mt-1">4</div>
                <div>
                  <p className="font-semibold">Cải thiện dịch vụ</p>
                  <p className="text-sm text-base-content/70">
                    Phân tích dữ liệu tổng hợp (không định danh cá nhân) để hiểu
                    nhu cầu người dùng và nâng cao chất lượng dịch vụ.
                  </p>
                </div>
              </div>
              <div className="flex gap-3 items-start">
                <div className="badge badge-primary mt-1">5</div>
                <div>
                  <p className="font-semibold">Đảm bảo an toàn</p>
                  <p className="text-sm text-base-content/70">
                    Phát hiện và ngăn chặn các hành vi gian lận, spam, hoặc vi
                    phạm điều khoản sử dụng.
                  </p>
                </div>
              </div>
            </div>

            <div className="alert alert-warning mt-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="stroke-current shrink-0 h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              <span className="text-sm">
                <strong>Cam kết:</strong> Chúng tôi KHÔNG bán, cho thuê hoặc
                trao đổi thông tin cá nhân của bạn cho bên thứ ba vì mục đích
                thương mại.
              </span>
            </div>
          </section>

          <div className="divider"></div>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-primary">
              3. Thời gian lưu trữ thông tin
            </h2>
            <p className="text-base-content/80 leading-relaxed">
              Thông tin cá nhân của bạn sẽ được lưu trữ trong các khoảng thời
              gian sau:
            </p>

            <div className="space-y-3">
              <div className="card bg-base-200 p-4">
                <p className="font-semibold mb-2">
                  ⏰ Trong thời gian sử dụng dịch vụ
                </p>
                <p className="text-sm text-base-content/70">
                  Thông tin tài khoản và hoạt động của bạn sẽ được lưu trữ khi
                  tài khoản còn hoạt động.
                </p>
              </div>
              <div className="card bg-base-200 p-4">
                <p className="font-semibold mb-2">🗑️ Sau khi xóa tài khoản</p>
                <p className="text-sm text-base-content/70">
                  Khi bạn yêu cầu xóa tài khoản, thông tin cá nhân sẽ được xóa
                  vĩnh viễn trong vòng <strong>30 ngày</strong>, trừ các thông
                  tin cần giữ lại theo quy định pháp luật.
                </p>
              </div>
              <div className="card bg-base-200 p-4">
                <p className="font-semibold mb-2">
                  📋 Thông tin lưu trữ theo quy định pháp luật
                </p>
                <p className="text-sm text-base-content/70">
                  Một số thông tin cần thiết (như hóa đơn, giao dịch) có thể
                  được lưu trữ tối đa <strong>5 năm</strong> theo quy định của
                  pháp luật Việt Nam về kế toán và thuế.
                </p>
              </div>
            </div>

            <div className="alert alert-info mt-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                className="stroke-current shrink-0 w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                ></path>
              </svg>
              <span className="text-sm">
                Thông tin đã được ẩn danh hóa (không còn định danh cá nhân) có
                thể được lưu trữ lâu dài để phục vụ mục đích thống kê và nghiên
                cứu.
              </span>
            </div>
          </section>

          <div className="divider"></div>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-primary">
              4. Những người hoặc tổ chức có thể được tiếp cận với thông tin cá
              nhân
            </h2>
            <p className="text-base-content/80 leading-relaxed">
              Chúng tôi <strong>KHÔNG</strong> bán hoặc cho thuê thông tin cá
              nhân của bạn. Tuy nhiên, trong một số trường hợp sau, thông tin
              của bạn có thể được chia sẻ:
            </p>

            <div className="space-y-3">
              <div className="card bg-base-200 p-4">
                <div className="flex gap-2 items-start">
                  <div className="badge badge-primary">1</div>
                  <div>
                    <p className="font-semibold">Người tổ chức sự kiện</p>
                    <p className="text-sm text-base-content/70 mt-1">
                      Khi bạn đăng ký tham gia một sự kiện, người tổ chức sẽ
                      được xem thông tin cơ bản của bạn (họ tên, email, số điện
                      thoại) để liên hệ và quản lý tình nguyện viên.
                    </p>
                  </div>
                </div>
              </div>
              <div className="card bg-base-200 p-4">
                <div className="flex gap-2 items-start">
                  <div className="badge badge-primary">2</div>
                  <div>
                    <p className="font-semibold">Nhà cung cấp dịch vụ</p>
                    <p className="text-sm text-base-content/70 mt-1">
                      Các đối tác cung cấp dịch vụ kỹ thuật (hosting, lưu trữ dữ
                      liệu, gửi email) được giám sát chặt chẽ và phải tuân thủ
                      các tiêu chuẩn bảo mật nghiêm ngặt.
                    </p>
                  </div>
                </div>
              </div>
              <div className="card bg-base-200 p-4">
                <div className="flex gap-2 items-start">
                  <div className="badge badge-primary">3</div>
                  <div>
                    <p className="font-semibold">Cơ quan có thẩm quyền</p>
                    <p className="text-sm text-base-content/70 mt-1">
                      Khi có yêu cầu hợp pháp từ cơ quan nhà nước (Công an, Tòa
                      án, Viện kiểm sát) hoặc để tuân thủ pháp luật Việt Nam.
                    </p>
                  </div>
                </div>
              </div>
              <div className="card bg-base-200 p-4">
                <div className="flex gap-2 items-start">
                  <div className="badge badge-primary">4</div>
                  <div>
                    <p className="font-semibold">Với sự đồng ý của bạn</p>
                    <p className="text-sm text-base-content/70 mt-1">
                      Trong các trường hợp khác, chúng tôi sẽ xin phép bạn trước
                      khi chia sẻ thông tin cá nhân.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="alert alert-warning">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                className="stroke-current shrink-0 w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                ></path>
              </svg>
              <span className="text-sm">
                Tất cả các bên thứ ba được tiếp cận thông tin đều phải ký cam
                kết bảo mật và chỉ được sử dụng thông tin cho mục đích đã thỏa
                thuận.
              </span>
            </div>
          </section>

          <div className="divider"></div>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-primary">
              5. Địa chỉ của đơn vị thu thập và quản lý thông tin cá nhân
            </h2>
            <div className="card bg-base-200 p-6">
              <div className="space-y-3">
                <div>
                  <p className="font-semibold text-lg">VolunteerHub</p>
                  <p className="text-sm text-base-content/70 italic">
                    Nền tảng kết nối tình nguyện viên và tổ chức sự kiện
                  </p>
                </div>
                <div className="divider my-2"></div>
                <div className="grid gap-3">
                  <div className="flex gap-2">
                    <span className="text-primary">📍</span>
                    <div>
                      <p className="font-medium">Địa chỉ:</p>
                      <p className="text-sm text-base-content/70">
                        144 Xuân Thủy, Cầu Giấy, Hà Nội, Việt Nam
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-primary">📧</span>
                    <div>
                      <p className="font-medium">Email:</p>
                      <p className="text-sm text-base-content/70">
                        support@volunteerhub.vn
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-primary">📞</span>
                    <div>
                      <p className="font-medium">Hotline:</p>
                      <p className="text-sm text-base-content/70">
                        1900-xxxx (8:00 - 18:00 từ T2-T6)
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-primary">👤</span>
                    <div>
                      <p className="font-medium">
                        Người chịu trách nhiệm bảo vệ dữ liệu cá nhân:
                      </p>
                      <p className="text-sm text-base-content/70">
                        Ông/Bà Trần Duy Thành
                      </p>
                      <p className="text-sm text-base-content/70">
                        Email: privacy@volunteerhub.vn
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="alert alert-info">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                className="stroke-current shrink-0 w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                ></path>
              </svg>
              <span className="text-sm">
                Mọi thắc mắc về chính sách bảo mật, vui lòng liên hệ theo thông
                tin trên.
              </span>
            </div>
          </section>

          <div className="divider"></div>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-primary">
              6. Phương tiện và công cụ để người dùng tiếp cận và chỉnh sửa dữ
              liệu cá nhân
            </h2>
            <p className="text-base-content/80 leading-relaxed">
              Bạn có toàn quyền kiểm soát thông tin cá nhân của mình thông qua
              các công cụ sau:
            </p>

            <div className="space-y-4">
              <div className="card bg-gradient-to-r from-primary/10 to-secondary/10 p-5">
                <div className="flex gap-3 items-start">
                  <div className="text-3xl">👤</div>
                  <div className="flex-1">
                    <p className="font-bold text-lg mb-2">
                      Trang Hồ sơ cá nhân
                    </p>
                    <p className="text-sm text-base-content/70 mb-3">
                      Đăng nhập vào tài khoản và truy cập phần "Hồ sơ" để:
                    </p>
                    <ul className="space-y-1 text-sm text-base-content/70">
                      <li>✓ Xem tất cả thông tin cá nhân đã cung cấp</li>
                      <li>
                        ✓ Cập nhật, chỉnh sửa thông tin (họ tên, email, số điện
                        thoại, ảnh đại diện)
                      </li>
                      <li>✓ Thay đổi mật khẩu</li>
                      <li>✓ Quản lý tùy chọn nhận thông báo</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="card bg-gradient-to-r from-info/10 to-success/10 p-5">
                <div className="flex gap-3 items-start">
                  <div className="text-3xl">📥</div>
                  <div className="flex-1">
                    <p className="font-bold text-lg mb-2">
                      Yêu cầu xuất dữ liệu
                    </p>
                    <p className="text-sm text-base-content/70 mb-2">
                      Bạn có quyền yêu cầu nhận bản sao toàn bộ dữ liệu cá nhân
                      mà chúng tôi lưu trữ về bạn.
                    </p>
                    <p className="text-sm text-base-content/70">
                      📧 Gửi email đến{" "}
                      <span className="font-semibold">
                        privacy@volunteerhub.vn
                      </span>{" "}
                      với tiêu đề "Yêu cầu xuất dữ liệu cá nhân". Chúng tôi sẽ
                      phản hồi trong vòng <strong>72 giờ</strong>.
                    </p>
                  </div>
                </div>
              </div>

              <div className="card bg-gradient-to-r from-warning/10 to-error/10 p-5">
                <div className="flex gap-3 items-start">
                  <div className="text-3xl">🗑️</div>
                  <div className="flex-1">
                    <p className="font-bold text-lg mb-2">
                      Yêu cầu xóa dữ liệu
                    </p>
                    <p className="text-sm text-base-content/70 mb-2">
                      Bạn có quyền yêu cầu xóa tài khoản và toàn bộ dữ liệu cá
                      nhân (trừ thông tin cần giữ theo quy định pháp luật).
                    </p>
                    <p className="text-sm text-base-content/70">
                      📧 Gửi email đến{" "}
                      <span className="font-semibold">
                        privacy@volunteerhub.vn
                      </span>{" "}
                      hoặc sử dụng chức năng "Xóa tài khoản" trong phần Hồ sơ.
                    </p>
                  </div>
                </div>
              </div>

              <div className="card bg-base-200 p-5">
                <div className="flex gap-3 items-start">
                  <div className="text-3xl">📞</div>
                  <div className="flex-1">
                    <p className="font-bold text-lg mb-2">Hỗ trợ trực tiếp</p>
                    <p className="text-sm text-base-content/70">
                      Nếu gặp khó khăn trong việc tiếp cận hoặc chỉnh sửa dữ
                      liệu, vui lòng liên hệ:
                    </p>
                    <div className="mt-2 space-y-1 text-sm">
                      <p>
                        📧 Email:{" "}
                        <span className="font-semibold">
                          support@volunteerhub.vn
                        </span>
                      </p>
                      <p>
                        📞 Hotline:{" "}
                        <span className="font-semibold">1900-xxxx</span>{" "}
                        (8:00-18:00, T2-T6)
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="alert alert-success mt-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                className="stroke-current shrink-0 w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                ></path>
              </svg>
              <span className="text-sm">
                <strong>Cam kết:</strong> Tất cả yêu cầu về dữ liệu cá nhân sẽ
                được xử lý miễn phí và trong thời gian sớm nhất.
              </span>
            </div>
          </section>

          <div className="divider"></div>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-primary">
              7. Cam kết bảo mật thông tin cá nhân khách hàng
            </h2>
            <p className="text-base-content/80 leading-relaxed">
              VolunteerHub cam kết thực hiện các biện pháp bảo vệ thông tin cá
              nhân của bạn một cách nghiêm túc và toàn diện:
            </p>

            <div className="space-y-4">
              <div className="card bg-gradient-to-r from-success/20 to-success/5 border-l-4 border-success p-5">
                <p className="font-bold text-lg mb-2">🛡️ Bảo mật kỹ thuật</p>
                <ul className="space-y-2 text-sm text-base-content/80">
                  <li className="flex gap-2">
                    <span>•</span>
                    <span>
                      Sử dụng <strong>mã hóa dữ liệu</strong> khi truyền tải và
                      lưu trữ thông tin nhạy cảm
                    </span>
                  </li>
                  <li className="flex gap-2">
                    <span>•</span>
                    <span>
                      Mật khẩu được <strong>bảo vệ</strong> bằng công nghệ hiện
                      đại, không ai (kể cả nhân viên) có thể xem mật khẩu gốc
                      của bạn
                    </span>
                  </li>
                  <li className="flex gap-2">
                    <span>•</span>
                    <span>
                      Hệ thống phát hiện và ngăn chặn các cuộc tấn công mạng tự
                      động
                    </span>
                  </li>
                  <li className="flex gap-2">
                    <span>•</span>
                    <span>
                      Sao lưu dữ liệu định kỳ để đảm bảo an toàn trong mọi tình
                      huống
                    </span>
                  </li>
                </ul>
              </div>

              <div className="card bg-gradient-to-r from-info/20 to-info/5 border-l-4 border-info p-5">
                <p className="font-bold text-lg mb-2">👥 Quản lý nội bộ</p>
                <ul className="space-y-2 text-sm text-base-content/80">
                  <li className="flex gap-2">
                    <span>•</span>
                    <span>
                      Chỉ nhân viên được <strong>ủy quyền</strong> mới có thể
                      truy cập dữ liệu người dùng
                    </span>
                  </li>
                  <li className="flex gap-2">
                    <span>•</span>
                    <span>
                      Tất cả nhân viên phải ký <strong>cam kết bảo mật</strong>{" "}
                      và được đào tạo về bảo vệ dữ liệu cá nhân
                    </span>
                  </li>
                  <li className="flex gap-2">
                    <span>•</span>
                    <span>
                      Giám sát và ghi lại mọi hoạt động truy cập dữ liệu
                    </span>
                  </li>
                </ul>
              </div>

              <div className="card bg-gradient-to-r from-warning/20 to-warning/5 border-l-4 border-warning p-5">
                <p className="font-bold text-lg mb-2">🔔 Thông báo sự cố</p>
                <p className="text-sm text-base-content/80">
                  Trong trường hợp xấu nhất, nếu xảy ra vi phạm bảo mật ảnh
                  hưởng đến dữ liệu của bạn, chúng tôi cam kết:
                </p>
                <ul className="space-y-2 text-sm text-base-content/80 mt-2">
                  <li className="flex gap-2">
                    <span>•</span>
                    <span>
                      Thông báo cho bạn trong vòng <strong>72 giờ</strong> kể từ
                      khi phát hiện
                    </span>
                  </li>
                  <li className="flex gap-2">
                    <span>•</span>
                    <span>
                      Báo cáo cho cơ quan chức năng theo quy định pháp luật
                    </span>
                  </li>
                  <li className="flex gap-2">
                    <span>•</span>
                    <span>
                      Thực hiện biện pháp khắc phục và hỗ trợ bạn giảm thiểu
                      thiệt hại
                    </span>
                  </li>
                </ul>
              </div>

              <div className="card bg-gradient-to-r from-error/20 to-error/5 border-l-4 border-error p-5">
                <p className="font-bold text-lg mb-2">
                  🚫 Cam kết không làm gì
                </p>
                <ul className="space-y-2 text-sm text-base-content/80">
                  <li className="flex gap-2">
                    <span>•</span>
                    <span>
                      <strong>KHÔNG</strong> bán, cho thuê hoặc trao đổi thông
                      tin cá nhân vì mục đích thương mại
                    </span>
                  </li>
                  <li className="flex gap-2">
                    <span>•</span>
                    <span>
                      <strong>KHÔNG</strong> chia sẻ thông tin với bên thứ ba
                      khi chưa có sự đồng ý của bạn (trừ các trường hợp pháp
                      luật quy định)
                    </span>
                  </li>
                  <li className="flex gap-2">
                    <span>•</span>
                    <span>
                      <strong>KHÔNG</strong> sử dụng thông tin của bạn cho mục
                      đích khác với những gì đã nêu trong chính sách này
                    </span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="alert alert-error shadow-lg mt-6">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                className="stroke-current shrink-0 w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                ></path>
              </svg>
              <div>
                <p className="font-bold">Lưu ý quan trọng</p>
                <p className="text-sm">
                  Mặc dù chúng tôi thực hiện mọi biện pháp bảo mật tốt nhất,
                  không có hệ thống nào an toàn tuyệt đối 100%. Chúng tôi khuyến
                  nghị bạn nên bảo vệ mật khẩu, không chia sẻ thông tin đăng
                  nhập với người khác, và đăng xuất sau khi sử dụng trên thiết
                  bị chung.
                </p>
              </div>
            </div>
          </section>

          <div className="divider"></div>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-primary">
              8. Thay đổi chính sách bảo mật
            </h2>
            <p className="text-base-content/80 leading-relaxed">
              Chúng tôi lưu trữ thông tin của bạn:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4 text-base-content/80">
              <li>Trong thời gian bạn sử dụng dịch vụ</li>
              <li>Theo yêu cầu của pháp luật (tối thiểu theo quy định)</li>
              <li>Để giải quyết tranh chấp và thực thi các thỏa thuận</li>
            </ul>
            <p className="text-base-content/80 leading-relaxed">
              Khi bạn xóa tài khoản, dữ liệu cá nhân sẽ được xóa hoàn toàn trong
              vòng 30 ngày, trừ khi pháp luật yêu cầu lưu trữ.
            </p>
          </section>

          <div className="divider"></div>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-primary">
              8. Thay đổi chính sách bảo mật
            </h2>
            <p className="text-base-content/80 leading-relaxed">
              Chính sách bảo mật này có thể được cập nhật theo thời gian để phản
              ánh những thay đổi trong hoạt động của chúng tôi hoặc yêu cầu pháp
              lý.
            </p>

            <div className="card bg-base-200 p-5">
              <div className="space-y-3">
                <div className="flex gap-3 items-start">
                  <span className="text-2xl">📢</span>
                  <div>
                    <p className="font-semibold mb-2">Khi có thay đổi:</p>
                    <ul className="space-y-2 text-sm text-base-content/70">
                      <li className="flex gap-2">
                        <span>•</span>
                        <span>
                          Chúng tôi sẽ cập nhật ngày "Cập nhật lần cuối" ở đầu
                          trang
                        </span>
                      </li>
                      <li className="flex gap-2">
                        <span>•</span>
                        <span>
                          Thông báo qua email cho người dùng về các thay đổi
                          quan trọng
                        </span>
                      </li>
                      <li className="flex gap-2">
                        <span>•</span>
                        <span>
                          Hiển thị thông báo trên website trong ít nhất 30 ngày
                        </span>
                      </li>
                      <li className="flex gap-2">
                        <span>•</span>
                        <span>
                          Yêu cầu đồng ý lại nếu thay đổi ảnh hưởng lớn đến
                          quyền riêng tư của bạn
                        </span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <div className="alert alert-info mt-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                className="stroke-current shrink-0 w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                ></path>
              </svg>
              <span className="text-sm">
                Chúng tôi khuyến nghị bạn thường xuyên kiểm tra trang này để nắm
                được các cập nhật mới nhất về chính sách bảo mật.
              </span>
            </div>
          </section>

          <div className="divider"></div>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-primary">
              9. Liên hệ với chúng tôi
            </h2>
            <p className="text-base-content/80 leading-relaxed">
              Nếu bạn có bất kỳ câu hỏi, thắc mắc nào về Chính sách bảo mật này
              hoặc muốn thực hiện các quyền liên quan đến dữ liệu cá nhân của
              mình, vui lòng liên hệ với chúng tôi qua:
            </p>
            <div className="card bg-gradient-to-br from-primary/10 to-secondary/10 p-6 space-y-3">
              <p className="font-bold text-lg">
                🔒 Bộ phận Bảo vệ dữ liệu cá nhân - VolunteerHub
              </p>
              <div className="space-y-2 text-base-content/80">
                <p>📧 Email chung: support@volunteerhub.vn</p>
                <p>📧 Email bảo mật: privacy@volunteerhub.vn</p>
                <p>📞 Hotline: 1900-xxxx (8:00-18:00, T2-T6)</p>
                <p>🏢 Địa chỉ: 144 Xuân Thủy, Cầu Giấy, Hà Nội, Việt Nam</p>
              </div>
            </div>
            <div className="alert alert-success mt-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                className="stroke-current shrink-0 w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                ></path>
              </svg>
              <span className="text-sm">
                Chúng tôi cam kết phản hồi mọi yêu cầu của bạn trong vòng{" "}
                <strong>72 giờ</strong> (3 ngày làm việc).
              </span>
            </div>
          </section>

          <div className="divider my-8"></div>

          <div className="text-center space-y-4 py-6">
            <p className="text-base-content/60 text-sm italic">
              Cảm ơn bạn đã tin tưởng và sử dụng dịch vụ VolunteerHub!
            </p>
          </div>
        </div>
      </div>

      {/* Back to home */}
      <div className="text-center pb-8">
        <div className="flex gap-4 justify-center">
          <a href="/" className="btn btn-primary gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Về trang chủ
          </a>
          <a href="/terms" className="btn btn-outline btn-primary gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            Điều khoản dịch vụ
          </a>
        </div>
      </div>
    </div>
  );
}
