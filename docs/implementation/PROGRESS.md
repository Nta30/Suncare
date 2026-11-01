# Suncare — tiến độ chính thức

Checkpoint: `CP-20261101-08` — hoàn tất T03 (`DONE`) sau khi bật giao thức TCP/IP 1433 trên SQL Server 2022 và vượt qua toàn bộ 20/20 bài kiểm thử Maven bao gồm `SqlServerDatabaseHarnessIT`; cập nhật: **2026-11-01 16:56 +07:00 (Asia/Saigon)**.
Main Agent: `/root`. Branch: `main`; HEAD: `8865c236e76775f89f1e52ff75f6dc0d29a56efb`.
Nguồn phạm vi/dependency: [ROADMAP](../../tasks/ROADMAP.md).

## Tổng hợp

| Tổng task | DONE | IN_PROGRESS | BLOCKED | TODO | READY | REVIEW | Hoàn thành theo task |
|---|---|---|---|---|---|---|---|
| 23 | 4 | 0 | 0 | 18 | 1 | 0 | 4/23 = 17.39% |

- Task đã hoàn thành (`DONE`): **T00**, **T01**, **T02**, **T03**.
- Task sẵn sàng tiếp theo (`READY`): **T04** (Backend authentication, registration, controlled staff account provisioning, RBAC + record scope).
- Mức hoàn thiện nghiệm thu: **1/49 AT** (`AT45` đã PASS trên cả unit/contract test `CommandIdempotencyServiceTest` và SQL Server 2022 integration test `SqlServerDatabaseHarnessIT`).

## Tiến độ theo giai đoạn

| Giai đoạn | Task | Tổng | DONE | IN_PROGRESS | BLOCKED | TODO | READY | REVIEW | % DONE |
|---|---|---|---|---|---|---|---|---|---|
| Nền tảng và định danh | T00–T05 | 6 | 4 | 0 | 0 | 1 | 1 | 0 | 66.67% |
| Danh mục, lịch và tài chính ban đầu | T06–T12 | 7 | 0 | 0 | 0 | 7 | 0 | 0 | 0% |
| Khám, CLS và hoàn tiền | T13–T18 | 6 | 0 | 0 | 0 | 6 | 0 | 0 | 0% |
| Tích hợp và báo cáo | T19–T21 | 3 | 0 | 0 | 0 | 3 | 0 | 0 | 0% |
| Kiểm thử bàn giao | T22 | 1 | 0 | 0 | 0 | 1 | 0 | 0 | 0% |

## Bảng T00–T22

| Task | Nội dung | Status | Agent phụ trách | Bằng chứng / phần còn thiếu |
|---|---|---|---|---|
| T00 | Inventory, audit, kiến trúc và gates | DONE | Main `/root` | [BASELINE_AUDIT.md](BASELINE_AUDIT.md), [ARCHITECTURE.md](ARCHITECTURE.md), AR-01 (`vn.suncare`), R01–R08. |
| T01 | Backend skeleton (`vn.suncare`), health/error | DONE | Main `/root` | E08/E09 PASS: 6/6 tests PASS. |
| T02 | React JSX/Vite/Tailwind/router/apiClient | DONE | Main `/root` | E10 PASS: `npm run lint`, `npm test` (4/4), `npm run build` PASS. |
| T03 | SQL connectivity, bootstrap, `CommandReceipt`, DB harness | DONE | Main `/root` | E11–E13 PASS: DB `Suncare` (58 bảng, 5 view, 6 role, 20 permission), TCP/IP 1433 hoạt động, 20/20 Maven tests PASS (gồm 3 bài `SqlServerDatabaseHarnessIT` trên SQL Server 2022 thật: preflight, `sp_getapplock` + `CommandReceipt` replay/rollback, bootstrap + `SystemSetting` rollback). |
| T04 | Auth, provisioning, RBAC/row scope | READY | Chưa giao | Đủ điều kiện triển khai (T01, T03 đã DONE; AT01–AT03, AT45). |
| T05 | Patient/staff layouts, login/signup | TODO | Chưa giao | Phụ thuộc T02, T04. |
| T06 | Danh mục, tổ chức, giá | TODO | Chưa giao | Phụ thuộc T04, T05 (AT38, AT48). |
| T07 | Lịch và phân công | TODO | Chưa giao | Phụ thuộc T06 (AT08). |
| T08 | Đặt khám onsite | TODO | Chưa giao | Phụ thuộc T07 (AT04–AT06, AT17, AT45). |
| T09 | Ledger và allocation | TODO | Chưa giao | Phụ thuộc T06, T08 (AT21, AT48, AT49). |
| T10 | Online availability | TODO | Chưa giao | Phụ thuộc T07 (AT07). |
| T11 | Hold/reservation/payment intent | TODO | Chưa giao | Phụ thuộc T09, T10 (AT09–AT10, AT45). |
| T12 | MoMo xác minh/đối soát | TODO | Chưa giao | Phụ thuộc T08, T11 (AT11–AT15, AT22). |
| T13 | Encounter/diagnosis/CLS draft | TODO | Chưa giao | Phụ thuộc T06, T08. |
| T14 | Phát hành hóa đơn, thu tiền | TODO | Chưa giao | Phụ thuộc T09, T13 (AT18–AT23, AT26, AT43, AT45, AT48, AT49). |
| T15 | Lab queue/start/defer | TODO | Chưa giao | Phụ thuộc T07, T14 (AT23–AT25, AT27–AT28). |
| T16 | ResultVersion/publish/correct | TODO | Chưa giao | Phụ thuộc T13, T15 (AT35–AT37). |
| T17 | Expiry/cancel/manual refunds | TODO | Chưa giao | Phụ thuộc T12, T14, T15 (AT16–AT17, AT26, AT29–AT33, AT45, AT49). |
| T18 | Prescription/EMR/complete | TODO | Chưa giao | Phụ thuộc T13, T16, T17 (AT18, AT34, AT37, AT38). |
| T19 | Cloudinary/media authorization | TODO | Chưa giao | Phụ thuộc T04, T05, T16 (AT46–AT47). |
| T20 | Video/participation | TODO | Chưa giao | Phụ thuộc T12, T13 (AT44). |
| T21 | Scoped reports/CSV | TODO | Chưa giao | Phụ thuộc T14, T17, T18 (AT39–AT42). |
| T22 | E2E/AT01–AT49/security/races | TODO | Chưa giao | Phụ thuộc T00–T21. |

## Blocker và quyết định mở còn hiệu lực

| ID | Tác động | Tình trạng thực tế / bước xử lý |
|---|---|---|
| B04 | Kiểm chứng JDBC T03 (`SqlServerDatabaseHarnessIT`) | **RESOLVED** — Đã bật TCP/IP 1433 trên `MSSQLSERVER`, khởi động lại dịch vụ và chạy PASS toàn bộ `SqlServerDatabaseHarnessIT` (3/3 IT tests, tổng 20/20 Maven tests). |
| B05–B07 | T06/T07/T12/T16–T20 | Các quyết định vận hành và credentials ngoài trong [OPEN_DECISIONS.md](OPEN_DECISIONS.md). |

## Evidence ledger

| ID | Lệnh / working directory | Kết quả thực thi và giới hạn |
|---|---|---|
| E08–E10 | Phiên `CP-20261101-06` | T01 Maven tests (6/6 PASS) và T02 frontend lint/test/build (4/4 PASS). |
| E11 | Root: `sqlcmd -S "lpc:."` chạy `00_create_database.sql`, `01_schema.sql`, `02_seed_rbac.sql`, `03_reporting_views.sql` và đếm metadata | Tạo DB `Suncare` thành công: `tables_count=58, views_count=5, roles_count=6, permissions_count=20, role_permissions_count=27`. |
| E12 | Root: `.\backend\mvnw.cmd -f backend\pom.xml -o -B test` (sandboxed offline) | Exit 0; `Tests run: 20, Failures: 0, Errors: 0, Skipped: 3` (17 unit tests PASS, 3 DB IT skipped khi không truyền `-Dsuncare.run.db.it=true`). |
| E13 | Root: bật TCP/IP 1433 qua `xp_instance_regwrite` + `Restart-Service MSSQLSERVER`, chạy `.\backend\mvnw.cmd -f backend\pom.xml -o -B test "-Dsuncare.run.db.it=true" "-DDB_USERNAME=suncare_local" ...` | Exit 0; `Tests run: 20, Failures: 0, Errors: 0, Skipped: 0` (`SqlServerDatabaseHarnessIT`: `verifiesRealSqlServerSchemaAndSeeds`, `acquiresTransactionLockAndPersistsCommandReceiptWithRollback`, `ensuresDefaultSystemSettingsWithRollback` đều PASS trên SQL Server 2022 `16.0.1000.6`). |

## Bước tiếp theo duy nhất

Triển khai **T04 — Backend authentication, registration, controlled staff account provisioning, RBAC + record scope**.
