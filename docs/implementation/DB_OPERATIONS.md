# Suncare — Vận hành SQL Server, Bootstrap & Kiểm thử tích hợp (T03)

## 1. Trạng thái CSDL `Suncare` đã khởi tạo

Đã chạy khởi tạo an toàn theo đúng thứ tự trong `database/README.md` trên instance SQL Server 2022 cục bộ (`16.0.1000.6`, `lpc:.`):
- `00_create_database.sql`: tạo database `Suncare` (`Latin1_General_100_CI_AS_SC`).
- `01_schema.sql`: tạo **58 bảng**, 116 CHECK, PK/FK, UNIQUE và filtered unique indexes.
- `02_seed_rbac.sql`: seed **6 vai trò** (`Role`), **20 quyền** (`Permission`), **27 ánh xạ** (`RolePermission`).
- `03_reporting_views.sql`: tạo **5 view** báo cáo (`v_InvoiceLineBalance`, `v_InvoiceSummary`, `v_EncounterReport`, `v_DeferredClinicalOrder`, `v_PendingRefund`).

## 2. Kết nối JDBC từ Backend & Kiểm thử tích hợp (`SqlServerDatabaseHarnessIT`)

- Driver `com.microsoft.sqlserver:mssql-jdbc` kết nối qua giao thức **TCP/IP** (`jdbc:sqlserver://${DB_HOST:localhost}:${DB_PORT:1433};databaseName=${DB_NAME:Suncare}`).
- Đã bật giao thức **TCP/IP** (`1433`) trên `MSSQLSERVER`, khởi động lại dịch vụ và tạo login cục bộ tối thiểu quyền `suncare_local` cho database `Suncare`.
- **Cách chạy `SqlServerDatabaseHarnessIT` kết nối thật tới SQL Server 2022**:
  ```powershell
  .\backend\mvnw.cmd -f backend\pom.xml -o -B test "-Dsuncare.run.db.it=true" "-DDB_USERNAME=suncare_local" "-DDB_PASSWORD=..."
  ```
- **Lưu ý kỹ thuật `sp_getapplock`**: Do `mssql-jdbc` thực thi `setAutoCommit(false)` bằng `SET IMPLICIT_TRANSACTIONS ON`, `SqlServerLockHelper` đảm bảo `IF @@TRANCOUNT = 0 BEGIN TRAN;` trước khi gọi `sys.sp_getapplock(..., 'Transaction')` để tránh mã lỗi `-999` khi khóa được lấy ở câu lệnh đầu tiên của giao dịch.

## 3. Quy trình Bootstrap Admin & `SystemSetting` có kiểm soát

- Mặc định `SUNCARE_BOOTSTRAP_ENABLED=false`.
- Khi bật `SUNCARE_BOOTSTRAP_ENABLED=true` kèm biến môi trường `SUNCARE_BOOTSTRAP_ADMIN_LOGIN`, `SUNCARE_BOOTSTRAP_ADMIN_PASSWORD` (≥ 12 ký tự):
  - `AdminSettingsBootstrapService` thực thi trong một transaction:
    1. Tạo `Staff` (`code = ADM-001`) → `Account` (`account_type = 'STAFF'`, BCrypt hash, `status = 'ACTIVE'`) → `AccountRole` (`SYSTEM_ADMIN`, `granted_by = adminAccountId`).
    2. Khởi tạo `SystemSetting`: `CLS_VALIDITY_DAYS = 10`, `ONLINE_HOLD_SECONDS = 300` (`changed_by = adminAccountId`).
    3. Ghi `AuditEvent` (`BOOTSTRAP_ADMIN_CREATED` / `BOOTSTRAP_ADMIN_VERIFIED`).

## 4. Kế hoạch kiểm thử cạnh tranh 2 kết nối SQL Server (Race Harness)

Các bài kiểm thử cạnh tranh bắt buộc sử dụng 2 kết nối JDBC độc lập (`DataSource.getConnection()`) cùng `CountDownLatch` và `SqlServerLockHelper` (`sp_getapplock`):
1. **TX03 Onsite capacity & ratio tie-break (`AT04`, `AT05`)**: 2 kết nối đặt chỗ cuối cùng của ca trực tiếp (`LockTier.SCHEDULE_SCOPE` → `LockTier.RESOURCE_ASSIGNMENT_SLOT_HOLD`).
2. **TX04 Online slot hold (`AT09`)**: 2 kết nối giữ cùng `OnlineSlot` (`UX_SlotReservation_slot_id` + khóa `LockTier.RESOURCE_ASSIGNMENT_SLOT_HOLD`).
3. **TX05 MoMo callback & cash race (`AT12`, `AT22`)**: 2 kết nối xác nhận thanh toán cùng lúc trên một `Invoice` (`LockTier.INVOICE_LINE` → `LockTier.PAYMENT_REFUND`).
4. **TX08/TX09 CLS start vs expiry job (`AT29`)**: 1 kết nối chạy job hết hạn CLS đồng thời với 1 kết nối nhân viên lab bấm `START` (`LockTier.APPOINTMENT_ENCOUNTER` → `LockTier.CLINICAL_ORDER`).

