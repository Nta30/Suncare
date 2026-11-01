# Suncare — Baseline Audit (T00)

## 1. Kiểm kê hiện trạng repository

- **Tài liệu nghiệp vụ (`docs/01`–`06`)**: Đầy đủ 6 file nguồn đã chốt (D01–D23, TX01–TX11, AT01–AT49).
- **Cơ sở dữ liệu (`database/`)**: 58 bảng (`01_schema.sql`), 6 vai trò / 20 quyền (`02_seed_rbac.sql`), 5 view báo cáo (`03_reporting_views.sql`), smoke test (`04_smoke_test.sql`) và `build-schema.mjs` + `validate.ps1`. Bảo toàn read-only.
- **Backend (`backend/`)**: Maven + Java 21 + Spring Boot 4.1.2 (`vn.suncare.BackendApplication`). Đã thống nhất **AR-01**: sử dụng `vn.suncare` làm package gốc chính thức.
- **Frontend (`frontend/`)**: React 19 + Vite 8 + Tailwind CSS v4 (`@tailwindcss/vite`) + FontAwesome đã cài trong `package.json`.

## 2. Đối chiếu Docs vs SQL DDL & Vấn đề giao cho các Task tương ứng

| Mã | Vấn đề cơ sở dữ liệu / bảo mật phát hiện | Mức độ | Task chịu trách nhiệm xử lý |
|---|---|---|---|
| DB-01 | `CommandReceipt` có `UX_CommandReceipt_command_type_idempotency_key` trên `(command_type, idempotency_key)` không gồm `account_id`. Nếu hai tài khoản gửi cùng header `Idempotency-Key` thô sẽ đụng UNIQUE hoặc lộ xung đột. | Cao | **T03, T04** (và các task command T08/T11/T14/T17): chuẩn hóa/băm khóa idempotency gắn `account_id` phía server và kiểm tra khớp `account_id` + `request_hash` (AT45). |
| DB-02 | `RolePermission` và `AccountRole` không có CHECK liên bảng giữa `Account.account_type` và `Role.account_type`; khóa tài khoản/thu hồi quyền không tự hủy token/session. | Cao | **T04**: kiểm tra `Account.account_type == Role.account_type` khi gán role (TX01) và xác thực lại trạng thái active/roles của Account ở mỗi request (AT01–AT03). |
| DB-03 | `UX_InvoiceLine_examination` chỉ chặn 2 dòng phí khám trong *cùng một* `Invoice`, chưa tự chặn 2 dòng phí khám trên *nhiều* `Invoice` của cùng `Encounter` (hoặc Hold + Encounter). | Cao | **T09, T14**: khóa `Encounter` và kiểm tra toàn bộ `Invoice`/`InvoiceLine` liên quan (gồm `Appointment.hold_id`) trước khi thêm dòng `EXAMINATION` (D09, D11, TX07, AT19). |
| DB-04 | `UX_InvoiceLine_order_id` là unique trên `(order_id) WHERE order_id IS NOT NULL` (kể cả khi dòng `CANCELLED`). | Trung bình | **T09, T14, T17**: mỗi `ClinicalOrder` chỉ tạo tối đa một `InvoiceLine`; không tạo lại dòng mới cho cùng `order_id`. |
| DB-05 | `v_DeferredClinicalOrder` trong `03_reporting_views.sql` trả `remaining_seconds` và chưa có cột `allocated_amount` nêu tại bảng grain báo cáo `docs/06`. | Trung bình | **T21**: truy vấn báo cáo/CSV join tổng hợp `allocated_amount` theo grain `ClinicalOrder` và quy đổi giờ còn lại mà không sửa script baseline. |
| DB-06 | Các cột `updated_at` trên bảng có thể sửa chỉ có `DEFAULT (SYSUTCDATETIME())` khi INSERT, không có trigger UPDATE; các kết nối ghi cần đúng `SET` options cho filtered index. | Trung bình | **T03**: thiết lập base persistence/auditing cập nhật `updated_at` từ UTC và kiểm tra `SET` options trên kết nối SQL Server. |
| SEC-01 | Các view báo cáo (`03_reporting_views.sql`) và URL Cloudinary/video không tự phân quyền theo dòng dữ liệu. | Cao | **T04, T16, T18, T19, T20, T21**: bắt buộc kiểm tra permission + row-level scope (patient/assigned doctor/department/lab shift) tại tầng application trước khi trả dữ liệu/link. |

## 3. Quyết định kiến trúc và chỉnh sửa Roadmap đã phê duyệt

- **AR-01**: Package gốc backend là `vn.suncare` (đã đồng bộ trong `backend/AGENTS.md`, `prompts/01_SCAFFOLD.md`, `tasks/ROADMAP.md`).
- **R01–R08**: Đã cập nhật `tasks/ROADMAP.md` để làm rõ quyền sở hữu `vn.suncare/**`, phân tách integrator ownership cho `frontend/src/app/**` (T02 khởi tạo, T05 tích hợp auth/layouts), đồng bộ đường dẫn `frontend/src/features/billing/{invoicing,refunds}`, bổ sung phụ thuộc thiếu (T12→T08, T16→T13, T19→T05, T21→T17) và gán đầy đủ AT01–AT49 (đặc biệt AT45 cho T03/T04/T08/T11/T14/T17).

## 4. Ma trận truy vết cốt lõi (D01–D23 / TX01–TX11 / AT01–AT49)

| Quyết định | Giao dịch | Bảng chính | AT kiểm chứng | Task |
|---|---|---|---|---|
| D01, D02, D19 | TX01 | `Patient`, `Staff`, `Account`, `Role`, `AccountRole`, `DepartmentHeadAssignment` | AT01–AT03 | T03, T04, T06 |
| D03–D05, D08 | TX02, TX03 | `WorkSchedule`, `WorkAssignment`, `OnlineSlot`, `ServicePrice`, `Appointment`, `Encounter` | AT04–AT08, AT17 | T06, T07, T08, T10 |
| D06, D07, D10 | TX04–TX06 | `BookingHold`, `SlotReservation`, `Invoice`, `InvoiceLine`, `PaymentRequest`, `PaymentEvent`, `Payment`, `PaymentAllocation` | AT09–AT17, AT22 | T09, T11, T12, T17 |
| D09, D11, D22, D23 | TX05, TX07 | `Invoice`, `InvoiceLine`, `Payment`, `PaymentAllocation` | AT18–AT22, AT38, AT43, AT48, AT49 | T09, T13, T14 |
| D12–D15 | TX05, TX08, TX09 | `ClinicalOrder`, `ClinicalQueueEntry`, `SystemSetting` | AT23–AT31 | T13, T14, T15, T17 |
| D16, D17 | TX10 | `ResultVersion`, `ResultValue`, `ClinicalReview`, `Diagnosis`, `Prescription`, `Encounter` | AT34–AT38 | T16, T18 |
| D18, D23 | TX06, TX09, TX11 | `RefundRequest`, `Refund`, `PaymentAllocation`, `Payment` | AT14, AT16, AT30–AT33, AT49 | T12, T17 |
| D20, D21 | TX10 + Adapters | `FileObject`, `ResultAttachment`, `VideoSession`, `VideoParticipation`, `AuditEvent`, `CommandReceipt` | AT39–AT47 | T03, T19, T20, T21 |

