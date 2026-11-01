# Suncare — tiến độ chính thức

Checkpoint: `CP-20261101-10` — hoàn tất T05 (`DONE`, thiết kế lại toàn bộ UI/UX Healthcare SaaS chuẩn production cho trang chủ, đăng nhập/đăng ký, không gian Bệnh nhân và Nhân viên y tế; 7/7 frontend tests + ESLint + Vite build PASS; kiểm chứng trực tiếp với Spring Boot + SQL Server 2022 + Chrome headless trên 14 màn hình Desktop/Mobile); cập nhật: **2026-11-01 19:15 +07:00 (Asia/Saigon)**.
Main Agent: `/root`. Branch: `main`; HEAD: `8865c236e76775f89f1e52ff75f6dc0d29a56efb`.
Nguồn phạm vi/dependency: [ROADMAP](../../tasks/ROADMAP.md).

## Tổng hợp

| Tổng task | DONE | IN_PROGRESS | BLOCKED | TODO | READY | REVIEW | Hoàn thành theo task |
|---|---|---|---|---|---|---|---|
| 23 | 6 | 0 | 0 | 16 | 1 | 0 | 6/23 = 26.09% |

- Task đã hoàn thành (`DONE`): **T00**, **T01**, **T02**, **T03**, **T04**, **T05**.
- Task sẵn sàng tiếp theo (`READY`): **T06** (Danh mục, tổ chức, giá).
- Mức hoàn thiện nghiệm thu: **4/49 AT** (`AT01`, `AT02`, `AT03`, `AT45` đã PASS trên cả Backend MockMvc/SQL Server 2022 IT và Frontend route guards / auth integration tests + trình duyệt thực tế).

## Tiến độ theo giai đoạn

| Giai đoạn | Task | Tổng | DONE | IN_PROGRESS | BLOCKED | TODO | READY | REVIEW | % DONE |
|---|---|---|---|---|---|---|---|---|---|
| Nền tảng và định danh | T00–T05 | 6 | 6 | 0 | 0 | 0 | 0 | 0 | 100% |
| Danh mục, lịch và tài chính ban đầu | T06–T12 | 7 | 0 | 0 | 0 | 6 | 1 | 0 | 0% |
| Khám, CLS và hoàn tiền | T13–T18 | 6 | 0 | 0 | 0 | 6 | 0 | 0 | 0% |
| Tích hợp và báo cáo | T19–T21 | 3 | 0 | 0 | 0 | 3 | 0 | 0 | 0% |
| Kiểm thử bàn giao | T22 | 1 | 0 | 0 | 0 | 1 | 0 | 0 | 0% |

## Bảng T00–T22

| Task | Nội dung | Status | Agent phụ trách | Bằng chứng / phần còn thiếu |
|---|---|---|---|---|
| T00 | Inventory, audit, kiến trúc và gates | DONE | Main `/root` | [BASELINE_AUDIT.md](BASELINE_AUDIT.md), [ARCHITECTURE.md](ARCHITECTURE.md), AR-01 (`vn.suncare`), R01–R08. |
| T01 | Backend skeleton (`vn.suncare`), health/error | DONE | Main `/root` | E08/E09 PASS: 6/6 tests PASS. |
| T02 | React JSX/Vite/Tailwind/router/apiClient | DONE | Main `/root` | E10 PASS: `npm run lint`, `npm test` (4/4), `npm run build` PASS. |
| T03 | SQL connectivity, bootstrap, `CommandReceipt`, DB harness | DONE | Main `/root` | E11–E13 PASS: DB `Suncare` (58 bảng, 5 view, 6 role, 20 permission), TCP/IP 1433 hoạt động, 20/20 Maven tests PASS. |
| T04 | Auth, provisioning, RBAC/row scope | DONE | Main `/root` | E14–E16 PASS: Xác minh runtime thực tế (Spring Boot `/api/v1/health`, `/actuator/health` + SQL Server query + Vite proxy `:5173 -> :18080`); hoàn tất `vn.suncare.security` + `vn.suncare.identity`, vượt qua 27/27 Maven tests (11 unit, 10 MockMvc, 6 SQL Server 2022 IT) kiểm chứng `AT01`, `AT02`, `AT03`, `AT45`, `TX01`, `DB-01`, `DB-02`, `SEC-01`. |
| T05 | Patient/staff layouts, login/signup | DONE | Main `/root` | E17–E18 PASS: Thiết kế lại toàn bộ giao diện Healthcare SaaS chuẩn production (Teal/White/Slate, FontAwesome icons, tiếng Việt tự nhiên, loại bỏ 100% mã T00–T22 và đường dẫn kỹ thuật trên giao diện người dùng); `PublicLayout`, `PatientLayout`, `StaffLayout`, `LoginPage`, `PatientRegisterPage`, `PatientWorkspacePage`, `StaffWorkspacePage`, `RouteGuard`, `DataTable`, `EmptyState`, `PageHeader`; `npm run lint`, `npm test` (7/7 PASS), `npm run build` PASS; kiểm chứng E2E trình duyệt thực tế (`1280px` & `375px`) với Spring Boot + SQL Server 2022 (`AT01`–`AT03`). |
| T06 | Danh mục, tổ chức, giá | READY | Chưa giao | Đủ điều kiện triển khai (T04, T05 đã DONE; xem `AT38`, `AT48`). |
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
| E14 | Root: `verify-runtime.ps1` khởi chạy đồng thời SQL Server 2022 (`1433`), Spring Boot backend (`18080`, profile `local`) và Vite frontend (`5173`) | Exit 0; SQL query read-only (`db_name=Suncare, tables=58, views=5, roles=6, permissions=20`); `GET http://127.0.0.1:18080/api/v1/health` -> `200 UP` (`X-Correlation-Id` trả về); `GET http://127.0.0.1:18080/actuator/health` -> `200`; `GET http://127.0.0.1:5173/` -> `200` (`#root`); `GET http://127.0.0.1:5173/api/v1/health` (Vite proxy -> Spring Boot) -> `200 UP` (`X-Correlation-Id: fe-proxy-check-001`). |
| E15 | Root: `.\backend\mvnw.cmd -f backend\pom.xml -o -B test` (sandboxed offline) & `npm --prefix frontend run lint; npm --prefix frontend test` | Exit 0; Backend offline: `Tests run: 27, Failures: 0, Errors: 0, Skipped: 6` (11 unit + 10 MockMvc PASS); Frontend: ESLint exit 0, `node --test` 4/4 PASS. |
| E16 | Root: `.\backend\mvnw.cmd -f backend\pom.xml -o -B test "-Dsuncare.run.db.it=true" "-DDB_USERNAME=suncare_local" ...` | Exit 0; `Tests run: 27, Failures: 0, Errors: 0, Skipped: 0` (11 pure unit tests + 10 MockMvc contract tests + 6 real SQL Server 2022 ITs trong `SqlServerDatabaseHarnessIT` và `IdentityAndRbacSqlServerIT` đều PASS). |
| E17 | Root: `npm --prefix frontend run lint; npm --prefix frontend test; npm --prefix frontend run build` & `.\backend\mvnw.cmd -f backend\pom.xml -o -B test` | Exit 0; ESLint `0` lỗi; `node --test` **7/7 PASS** (`validatePatientRegistrationInput`, `evaluateRouteAccess` + `filterNavigationForPrincipal`, `authApi` login/register/admin/403 lock, `formatVnd`, `toSaigonWorkDate`, `routeUtils`, `apiClient`); `vite build` thành công (`55 modules`); Backend offline Maven tests `27 run, 0 failures, 6 DB IT skipped`. |
| E18 | Root: `node verify-t05-ui.mjs` (Spring Boot `:18089` + SQL Server 2022 + Vite proxy `:5185` + Chrome headless CDP) | Exit 0; Đăng ký bệnh nhân thực qua proxy (`POST /api/v1/auth/register` -> `201`), đăng nhập bệnh nhân (`POST /api/v1/auth/login` -> `200`), đăng nhập Quản trị viên và cấp phát tài khoản Bác sĩ (`POST /api/v1/admin/staff-accounts` -> `201`); kiểm tra 14 route/viewport ở Desktop (`1280x900`) và Mobile (`375x812`) đều `overflow=false`, `hasTaskCodes=false`, `hasApiPaths=false`; dọn sạch dữ liệu kiểm thử tạm (`remaining_uiverify=0`). |

## Bước tiếp theo duy nhất

Triển khai **T06 — Danh mục chuyên khoa, dịch vụ, tổ chức nhân sự và bảng giá (Catalog, Organization & Pricing)**.
