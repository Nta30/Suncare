# Suncare — bàn giao phiên và phục hồi

Checkpoint: `CP-20261101-08` — hoàn tất T03 (`DONE`); cập nhật: **2026-11-01 16:56 +07:00 (Asia/Saigon)**.
Repo: `d:\Project1\Suncare`; branch `main`; HEAD `8865c236e76775f89f1e52ff75f6dc0d29a56efb`.
Không còn subagent hay tiến trình nền đang chạy.

## 1. Công việc đã hoàn thành trong phiên này (T03 — DONE)

- **Khởi tạo CSDL `Suncare` & Bật giao thức TCP/IP 1433 (`E11`, `E13`)**:
  - Đã tạo CSDL `Suncare` trên SQL Server 2022 (`16.0.1000.6`): **58 bảng**, **5 view**, **6 vai trò**, **20 quyền**, **27 ánh xạ quyền**.
  - Đã bật giao thức TCP/IP (`1433`) trên `MSSQLSERVER`, khởi động lại dịch vụ và tạo login cục bộ `suncare_local` cho môi trường dev/test.
- **Triển khai hạ tầng DB, Bootstrap, Idempotency & Kiểm thử (`E12`, `E13`)**:
  - `vn.suncare.common.idempotency`: `IdempotencyKeyScoper` (`DB-01`), `CommandReceiptStore`, `JdbcCommandReceiptStore`, `CommandIdempotencyService` (`AT45`).
  - `vn.suncare.infrastructure.db`: `DatabaseProperties`, `BootstrapProperties`, `DatabaseInfrastructureConfig`, `SqlServerPreflightVerifier` (58/5/6/20 + `SESSIONPROPERTY`), `SqlServerLockHelper` (`IF @@TRANCOUNT = 0 BEGIN TRAN;` + `sp_getapplock`), `SystemSettingService`, `AdminSettingsBootstrapService`, `DatabasePreflightAndBootstrapRunner`, `MutableEntityAuditSupport` (`DB-06`).
  - Kiểm thử: **20/20 Maven tests PASS** (`BackendApplicationTests`: 1, `HealthAndErrorHandlingTest`: 5, `CommandIdempotencyServiceTest`: 4, `DatabaseInfrastructureUnitTest`: 7, `SqlServerDatabaseHarnessIT`: 3 bài IT trực tiếp trên SQL Server 2022 thật).

## 2. Blocker hiện tại

- Không còn blocker cho T00–T03 (`B04` đã gỡ xong).

## 3. Bước tiếp theo chính xác

- Triển khai **T04 — Backend authentication, registration, controlled staff account provisioning, RBAC + record scope**.
