# Suncare — Kiến trúc Modular Monolith (T00)

## 1. Cấu trúc tổng thể

Dự án sử dụng kiến trúc **Modular Monolith** cho một cơ sở khám ngoại trú duy nhất:
- **Backend**: Java 21, Spring Boot 4.1.2 (Spring Web MVC, Spring Security, Validation, Spring Data JPA + JDBC/SQL cho khóa SQL Server), package gốc chính thức **`vn.suncare`** (quyết định **AR-01**).
- **Frontend**: React 19 (JavaScript/JSX, không TypeScript), Vite 8, Tailwind CSS v4 (`@tailwindcss/vite`), React Router.
- **Database**: SQL Server 2019+ với 58 bảng, 6 vai trò, 20 quyền, 5 view báo cáo đã chốt. Hibernate chỉ dùng `ddl-auto=validate` khi kết nối DB thật; không sinh lại schema.

## 2. Cấu trúc package Backend (`vn.suncare`)

```text
backend/src/main/java/vn/suncare/
├── BackendApplication.java
├── common/
│   ├── api/            # ApiErrorResponse (ProblemDetail), HealthController, CorrelationIdFilter
│   ├── config/         # Jackson/BigDecimal/Time (UTC), WebMvc, Security baseline
│   ├── exception/      # BusinessException, ResourceNotFoundException, ConflictException, GlobalExceptionHandler
│   └── idempotency/    # CommandReceipt contract (triển khai DB tại T03)
├── infrastructure/
│   └── db/             # SQL Server preflight, lock helper, bootstrap admin/settings (T03)
├── security/           # Authentication, RBAC permission evaluator, row-scope guards (T04)
├── identity/           # Account, Patient, Staff, Role provisioning (T04)
├── catalog/            # Department, Specialty, Room, Shift, Service, ServicePrice (T06)
├── scheduling/         # WorkSchedule, WorkAssignment, OnlineSlot (T07)
├── booking/
│   ├── shared/         # Shared Appointment + Encounter creation (T08/T12)
│   ├── onsite/         # TX03 onsite booking & ratio assignment (T08)
│   └── online/         # availability (T10), hold TX04 (T11)
├── encounter/          # Encounter lifecycle, vitals, diagnosis (T13)
├── clinical/
│   ├── ordering/       # ClinicalOrder drafting (T13)
│   ├── queue/          # Lab check-in, queue, start, defer TX08 (T15)
│   ├── results/        # ResultVersion, publish, correction, review TX10 (T16)
│   ├── expiry/         # Order expiry TX09 (T17)
│   ├── prescriptions/  # Prescription (T18)
│   └── emr/            # Scoped EMR read & Encounter completion TX10 (T18)
├── billing/
│   ├── core/           # Invoice, InvoiceLine, PaymentAllocation, balances (T09)
│   ├── momo/           # MoMo adapter, callback verification TX05 (T12)
│   ├── invoicing/      # Doctor/Cashier invoice issuance & cash payment TX05/TX07 (T14)
│   └── refunds/        # RefundRequest & manual Refund TX06/TX11 (T17)
├── files/              # Cloudinary adapter & authorized media links (T19)
├── video/              # Video session adapter & participation tracking (T20)
└── reporting/          # Role-scoped reports & safe CSV export (T21)
```

Mỗi module nghiệp vụ tách rõ 3 tầng: `api` (Controller + Request/Response DTO), `application` (Service/Command + `@Transactional` + lock order), `persistence` (Entity/Repository/JDBC).

## 3. Cấu trúc thư mục Frontend (`frontend/src`)

```text
frontend/src/
├── main.jsx
├── App.jsx
├── index.css           # @import "tailwindcss" + semantic design tokens
├── app/
│   ├── router.jsx      # Cấu hình định tuyến trung tâm (T02 khởi tạo, T05 gắn guards/shells)
│   ├── AppShell.jsx    # Khung giao diện cơ sở cho Patient và Staff
│   └── pages/          # Trang gốc / trạng thái hệ thống / 404
├── lib/
│   ├── apiClient.js    # Centralized fetch wrapper (/api/v1, ProblemDetail error parsing, correlation/idempotency headers)
│   └── formatters.js   # Định dạng tiền VND (chuỗi số nguyên) và ngày giờ Asia/Saigon
├── components/
│   ├── ui/             # Primitive UI (JavaScript/JSX)
│   └── common/         # Trạng thái loading/empty/error/permission dùng chung
└── features/
    ├── auth/           # T05
    ├── admin/          # T06
    ├── scheduling/     # T07
    ├── booking/        # onsite (T08), online/availability (T10), online/hold (T11), online/payment (T12)
    ├── encounter/      # T13
    ├── billing/        # invoicing (T14), refunds (T17)
    ├── lab/            # queue (T15), results (T16)
    ├── medical-records/# T18
    ├── media/          # T19
    ├── video/          # T20
    └── reports/        # T21
```

## 4. Quy ước kỹ thuật xuyên suốt (Gates)

- **Tiền tệ**: `decimal(19,0)` (SQL) ↔ `BigDecimal` (Java) ↔ chuỗi số nguyên `"150000"` (JSON). Cấm dùng `float`/`double`.
- **Thời gian**: Lưu UTC (`Instant`/`datetime2(3)`), hiển thị và lọc khoảng ngày theo `Asia/Saigon` (`[00:00, 00:00 ngày kế tiếp)`).
- **Lỗi API (`/api/v1`)**: Chuẩn ProblemDetail mở rộng gồm `type`, `title`, `status`, `detail`, `code`, `correlationId`, `timestamp`, `fieldErrors`.
- **Thứ tự khóa SQL Server**: `Lịch/Chuyên khoa-Ngày → Assignment/Slot/Hold → Appointment/Encounter → ClinicalOrder → Invoice/InvoiceLine → Payment/RefundRequest`.
- **Tích hợp ngoài (MoMo, Cloudinary, Video)**: Đặt sau interface adapter, fail-closed khi thiếu cấu hình thật; mock chỉ dùng trong môi trường DEV/TEST được đánh dấu rõ.

