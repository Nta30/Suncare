import { RouteLink } from '@/app/router'

export function HomePage() {
  return (
    <div className="space-y-6">
      <section
        aria-labelledby="foundation-heading"
        className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs"
      >
        <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
          Nền tảng giao diện T02 (Chưa kích hoạt luồng đăng nhập T05)
        </span>
        <h2 id="foundation-heading" className="mt-3 text-2xl font-bold text-slate-900">
          Hai không gian làm việc tách biệt theo đúng nghiệp vụ Suncare
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">
          Hệ thống phục vụ một cơ sở khám ngoại trú duy nhất (trực tiếp và trực tuyến). Quyền hạn
          và phạm vi dữ liệu được kiểm tra bắt buộc tại máy chủ trên từng yêu cầu.
        </p>
      </section>

      <div className="grid gap-6 md:grid-cols-2">
        <article className="rounded-xl border border-teal-200 bg-white p-6 shadow-xs">
          <p className="text-xs font-semibold uppercase tracking-wide text-teal-700">
            Ngữ cảnh 1 • Cổng bệnh nhân (Patient Self-Service)
          </p>
          <h3 className="mt-2 text-lg font-semibold text-slate-900">
            Đặt khám trực tiếp, đặt slot online &amp; tra cứu hồ sơ đã công bố
          </h3>
          <ul className="mt-3 space-y-2 text-sm text-slate-700 list-disc pl-5">
            <li>
              <strong>Đặt khám trực tiếp (Onsite):</strong> chỉ chọn chuyên khoa, ngày và buổi
              (Sáng/Chiều); hệ thống tự phân bác sĩ công bằng, không chọn bác sĩ hoặc giờ lẻ.
            </li>
            <li>
              <strong>Đặt khám trực tuyến (Online):</strong> slot 20 phút, giữ chỗ tối đa 5 phút;
              chỉ tạo lịch hẹn và lượt khám sau khi xác minh thanh toán MoMo hợp lệ.
            </li>
            <li>
              <strong>Hủy lịch:</strong> chỉ áp dụng cho lịch online trước giờ hẹn ít nhất 24 giờ;
              không hỗ trợ đổi lịch.
            </li>
          </ul>
        </article>

        <article className="rounded-xl border border-blue-200 bg-white p-6 shadow-xs">
          <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">
            Ngữ cảnh 2 • Không gian nhân viên y tế (Clinical &amp; Operations)
          </p>
          <h3 className="mt-2 text-lg font-semibold text-slate-900">
            Bác sĩ, Cận lâm sàng, Trưởng khoa, Thu ngân &amp; Quản trị
          </h3>
          <ul className="mt-3 space-y-2 text-sm text-slate-700 list-disc pl-5">
            <li>
              <strong>Khám &amp; chỉ định CLS:</strong> bác sĩ phụ trách lập hóa đơn trực tiếp/bổ
              sung; kết quả CLS đã phát hành là bất biến (đính chính tạo phiên bản mới).
            </li>
            <li>
              <strong>Hiệu lực CLS:</strong> tính từ lần thanh toán đủ đầu tiên (mặc định 10 × 24h);
              hoãn thực hiện giữ nguyên chỉ định, lượt khám và thời hạn gốc.
            </li>
            <li>
              <strong>Thu &amp; hoàn tiền:</strong> chứng từ thu nội bộ; mã QR hoặc màn hình chuyển
              hướng không phải bằng chứng đã thu tiền.
            </li>
          </ul>
        </article>
      </div>

      <section className="rounded-xl border border-slate-200 bg-white p-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-semibold text-slate-900">
            Kiểm tra kết nối máy chủ Backend (`/api/v1/health`)
          </h3>
          <p className="text-sm text-slate-600">
            Xác minh phản hồi JSON, mã tương quan <code>X-Correlation-Id</code> và bộ định dạng
            tiền tệ/thời gian chuẩn.
          </p>
        </div>
        <RouteLink
          to="/system-status"
          className="inline-flex items-center rounded-lg bg-teal-700 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-800"
        >
          Mở trang kiểm tra kết nối
        </RouteLink>
      </section>
    </div>
  )
}

