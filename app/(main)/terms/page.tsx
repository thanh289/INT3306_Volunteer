// Terms of Service page
// app/(main)/terms/page.tsx

import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Điều khoản dịch vụ - VolunteerHub",
  description: "Điều khoản và điều kiện sử dụng dịch vụ VolunteerHub",
};

export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl md:text-5xl font-bold">
          <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Điều khoản dịch vụ
          </span>
        </h1>
        <p className="text-base-content/60">Cập nhật lần cuối: 08/12/2025</p>
      </div>

      {/* Content */}
      <div className="card bg-base-100 shadow-lg border border-base-300">
        <div className="card-body prose prose-lg max-w-none">
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-primary">
              1. Chấp nhận điều khoản
            </h2>
            <p className="text-base-content/80 leading-relaxed">
              Bằng việc truy cập và sử dụng nền tảng VolunteerHub, bạn đồng ý
              tuân thủ và bị ràng buộc bởi các điều khoản và điều kiện sau đây.
              Nếu bạn không đồng ý với bất kỳ phần nào của các điều khoản này,
              vui lòng không sử dụng dịch vụ của chúng tôi.
            </p>
          </section>

          <div className="divider"></div>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-primary">
              2. Đối tượng sử dụng
            </h2>
            <p className="text-base-content/80 leading-relaxed">
              VolunteerHub dành cho:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4 text-base-content/80">
              <li>
                <strong>Tình nguyện viên:</strong> Cá nhân từ 16 tuổi trở lên
                muốn tham gia các hoạt động tình nguyện
              </li>
              <li>
                <strong>Tổ chức/Quản lý sự kiện:</strong> Các tổ chức, nhóm, cá
                nhân tổ chức các hoạt động tình nguyện hợp pháp
              </li>
              <li>
                <strong>Quản trị viên:</strong> Người quản lý và vận hành nền
                tảng
              </li>
            </ul>
          </section>

          <div className="divider"></div>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-primary">
              3. Tài khoản người dùng
            </h2>
            <h3 className="text-xl font-semibold">3.1. Đăng ký tài khoản</h3>
            <ul className="list-disc list-inside space-y-2 ml-4 text-base-content/80">
              <li>Bạn phải cung cấp thông tin chính xác, đầy đủ và cập nhật</li>
              <li>Bạn chịu trách nhiệm bảo mật thông tin tài khoản của mình</li>
              <li>Bạn không được chia sẻ tài khoản cho người khác</li>
              <li>
                Bạn phải thông báo ngay cho chúng tôi nếu phát hiện truy cập
                trái phép
              </li>
            </ul>

            <h3 className="text-xl font-semibold mt-4">
              3.2. Chấm dứt tài khoản
            </h3>
            <p className="text-base-content/80 leading-relaxed">
              Chúng tôi có quyền đình chỉ hoặc xóa tài khoản của bạn nếu vi phạm
              điều khoản dịch vụ, không cần thông báo trước.
            </p>
          </section>

          <div className="divider"></div>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-primary">
              4. Quy định về nội dung
            </h2>
            <h3 className="text-xl font-semibold">4.1. Nội dung được phép</h3>
            <ul className="list-disc list-inside space-y-2 ml-4 text-base-content/80">
              <li>Thông tin về các hoạt động tình nguyện hợp pháp</li>
              <li>
                Chia sẻ kinh nghiệm, câu chuyện tích cực về hoạt động tình
                nguyện
              </li>
              <li>Giao tiếp lịch sự, tôn trọng trong cộng đồng</li>
            </ul>

            <h3 className="text-xl font-semibold mt-4">4.2. Nội dung cấm</h3>
            <p className="text-base-content/80 leading-relaxed">
              Nghiêm cấm đăng tải nội dung:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4 text-base-content/80">
              <li>Vi phạm pháp luật Việt Nam</li>
              <li>Thông tin sai sự thật, lừa đảo</li>
              <li>Kích động bạo lực, thù hận, phân biệt đối xử</li>
              <li>Khiêu dâm, tục tĩu, không phù hợp với thuần phong mỹ tục</li>
              <li>Vi phạm bản quyền, quyền sở hữu trí tuệ</li>
              <li>Spam, quảng cáo trái phép</li>
              <li>Thu thập thông tin cá nhân trái phép</li>
            </ul>
          </section>

          <div className="divider"></div>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-primary">
              5. Quy định về sự kiện
            </h2>
            <h3 className="text-xl font-semibold">5.1. Tạo sự kiện</h3>
            <ul className="list-disc list-inside space-y-2 ml-4 text-base-content/80">
              <li>
                Người tạo sự kiện phải chịu trách nhiệm hoàn toàn về tính hợp
                pháp và an toàn của sự kiện
              </li>
              <li>Thông tin sự kiện phải chính xác, đầy đủ và trung thực</li>
              <li>Sự kiện phải được Admin phê duyệt trước khi công bố</li>
              <li>Không được tạo sự kiện giả mạo hoặc có mục đích xấu</li>
            </ul>

            <h3 className="text-xl font-semibold mt-4">
              5.2. Tham gia sự kiện
            </h3>
            <ul className="list-disc list-inside space-y-2 ml-4 text-base-content/80">
              <li>Tình nguyện viên phải tuân thủ quy định của người tổ chức</li>
              <li>
                Thông báo kịp thời nếu không thể tham gia sau khi đã đăng ký
              </li>
              <li>
                Chịu trách nhiệm về hành vi cá nhân trong quá trình tham gia
              </li>
            </ul>
          </section>

          <div className="divider"></div>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-primary">
              6. Quyền sở hữu trí tuệ
            </h2>
            <p className="text-base-content/80 leading-relaxed">
              Tất cả nội dung trên VolunteerHub bao gồm văn bản, hình ảnh, logo,
              mã nguồn đều thuộc quyền sở hữu của VolunteerHub hoặc người cấp
              phép. Nghiêm cấm sao chép, sửa đổi, phân phối mà không có sự cho
              phép.
            </p>
            <p className="text-base-content/80 leading-relaxed">
              Khi đăng tải nội dung, bạn cấp cho VolunteerHub quyền sử dụng,
              hiển thị và phân phối nội dung đó trên nền tảng.
            </p>
          </section>

          <div className="divider"></div>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-primary">
              7. Giới hạn trách nhiệm
            </h2>
            <div className="alert alert-warning">
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
              <div className="text-sm">
                <p className="font-semibold">Lưu ý quan trọng:</p>
                <p>
                  VolunteerHub là nền tảng kết nối, không chịu trách nhiệm về:
                </p>
              </div>
            </div>
            <ul className="list-disc list-inside space-y-2 ml-4 text-base-content/80">
              <li>Chất lượng, tính hợp pháp của các sự kiện</li>
              <li>An toàn cá nhân trong quá trình tham gia sự kiện</li>
              <li>Tranh chấp giữa người dùng với nhau</li>
              <li>Thiệt hại trực tiếp hoặc gián tiếp do sử dụng dịch vụ</li>
              <li>Mất mát dữ liệu do lỗi kỹ thuật</li>
            </ul>
          </section>

          <div className="divider"></div>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-primary">
              8. Quyền từ chối dịch vụ
            </h2>
            <p className="text-base-content/80 leading-relaxed">
              Chúng tôi có quyền từ chối cung cấp dịch vụ, chấm dứt tài khoản,
              xóa hoặc chỉnh sửa nội dung bất kỳ lúc nào mà không cần lý do hoặc
              thông báo trước.
            </p>
          </section>

          <div className="divider"></div>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-primary">
              9. Thay đổi điều khoản
            </h2>
            <p className="text-base-content/80 leading-relaxed">
              VolunteerHub có quyền thay đổi, sửa đổi các điều khoản này bất kỳ
              lúc nào. Các thay đổi sẽ có hiệu lực ngay khi được đăng tải trên
              website. Việc bạn tiếp tục sử dụng dịch vụ sau khi có thay đổi
              đồng nghĩa với việc bạn chấp nhận các điều khoản mới.
            </p>
          </section>

          <div className="divider"></div>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-primary">
              10. Luật áp dụng
            </h2>
            <p className="text-base-content/80 leading-relaxed">
              Các điều khoản này được điều chỉnh bởi pháp luật Việt Nam. Mọi
              tranh chấp phát sinh sẽ được giải quyết tại Tòa án có thẩm quyền
              tại Việt Nam.
            </p>
          </section>

          <div className="divider"></div>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-primary">11. Liên hệ</h2>
            <p className="text-base-content/80 leading-relaxed">
              Nếu bạn có bất kỳ câu hỏi nào về Điều khoản dịch vụ, vui lòng liên
              hệ:
            </p>
            <div className="card bg-base-200 p-4 space-y-2">
              <p className="font-semibold">VolunteerHub</p>
              <p>Email: dhqg@volunteerhub.vn</p>
              <p>Hotline: 1900-xxxx</p>
              <p>Địa chỉ: 144 Xuân Thuỷ, Cầu Giấy, Hà Nội</p>
            </div>
          </section>
        </div>
      </div>

      {/* Back to home */}
      <div className="text-center pb-8">
        <Link href="/" className="btn btn-outline gap-2">
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
          Quay lại trang chủ
        </Link>
      </div>
    </div>
  );
}
