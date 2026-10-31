# Suncare — tiến độ chính thức

Checkpoint: `CP-20261101-01` — checkpoint cuối phiên; cập nhật: **2026-11-01 05:50 +07:00 (Asia/Saigon)**.
Main Agent: `/root`. Branch: `main`; HEAD: `ea2465b054319d07adf26878d2eb5f40a579e0e0`.
Nguồn phạm vi/dependency: [ROADMAP](../../tasks/ROADMAP.md). Nguồn trạng thái hiện tại là file này, không phải dòng “initially TODO” trong roadmap.

## Tổng hợp

| Tổng task | DONE | IN_PROGRESS | BLOCKED | TODO | READY | REVIEW | Hoàn thành theo task |
|---|---|---|---|---|---|---|---|
| 23 | 0 | 1 | 0 | 22 | 0 | 0 | 0/23 = 0% |

- Công thức: số task T00–T22 DONE / 23 × 100. Subtask không tăng mẫu số; T00.a không đồng nghĩa T00 DONE.
- Mức hoàn thiện chức năng thực tế: **chưa có luồng nghiệp vụ hoàn chỉnh được kiểm chứng**; 0/49 AT có bằng chứng PASS trong checkpoint này. Đây là độ phủ bằng chứng, không phải ước lượng phần trăm công sức.
- Có SQL baseline và scaffold backend/frontend từ trước. Không tính các tài sản này thành task DONE khi thiếu deliverable hoặc kiểm thử bắt buộc.
- Task của phiên: **T00.a — thiết lập checkpoint/phục hồi**, thuộc T00. Không triển khai nghiệp vụ trong phiên này. T01/T02 giữ TODO vì chưa thực hiện scope roadmap sau gate T00; scaffold kế thừa và audit chỉ đọc không phải nhận triển khai hai task này. BLOCKED = 0 ở cấp task; lần kiểm tra Maven offline bị chặn được ghi riêng ở B02/E06.

## Tiến độ theo giai đoạn

Nhóm dưới đây chỉ để tổng hợp; thứ tự thực thi vẫn theo dependency của roadmap.

| Giai đoạn | Task | Tổng | DONE | IN_PROGRESS | BLOCKED | TODO | READY | REVIEW | % DONE |
|---|---|---|---|---|---|---|---|---|---|
| Nền tảng và định danh | T00–T05 | 6 | 0 | 1 | 0 | 5 | 0 | 0 | 0% |
| Danh mục, lịch và tài chính ban đầu | T06–T12 | 7 | 0 | 0 | 0 | 7 | 0 | 0 | 0% |
| Khám, CLS và hoàn tiền | T13–T18 | 6 | 0 | 0 | 0 | 6 | 0 | 0 | 0% |
| Tích hợp và báo cáo | T19–T21 | 3 | 0 | 0 | 0 | 3 | 0 | 0 | 0% |
| Kiểm thử bàn giao | T22 | 1 | 0 | 0 | 0 | 1 | 0 | 0 | 0% |

## Bảng T00–T22

Ngày đối chiếu toàn bộ bảng: 2026-11-01. “Chưa giao” nghĩa là chưa có agent triển khai được xác nhận trong phiên này. Hai agent audit không sở hữu task triển khai T01/T02.

| Task | Nội dung | Status | Agent phụ trách | Bằng chứng / phần còn thiếu |
|---|---|---|---|---|
| T00 | Inventory, audit, kiến trúc và gates | IN_PROGRESS | Main `/root` | T00.a checkpoint DONE sau Main review/E07; chưa có BASELINE_AUDIT.md, ARCHITECTURE.md, đối chiếu đầy đủ D01–D23/TX01–TX11/AT. |
| T01 | Backend skeleton, health/error | TODO | Chưa giao; `/root/audit_backend` chỉ audit | Có Maven/Java 21/MVC skeleton; thiếu health/error và smoke endpoint cô lập. E06 dừng trước compile/test vì cache offline thiếu dependency; không phải lỗi source đã xác nhận. |
| T02 | React JSX/Vite/Tailwind/router | TODO | Chưa giao; `/root/audit_frontend` chỉ audit | E02/E03 PASS cho starter; thiếu Tailwind v4, router và cấu trúc app. Chưa bắt đầu phần hoàn thiện T02 sau T00. |
| T03 | SQL connectivity, bootstrap, DB test harness | TODO | Chưa giao | SQL scripts có sẵn; E04 chỉ xác nhận server cục bộ và không thấy DB Suncare; chưa có harness/config/bootstrap backend. |
| T04 | Auth, provisioning, RBAC/row scope | TODO | Chưa giao | Chưa có module identity/security nghiệp vụ; phụ thuộc T03. |
| T05 | Patient/staff layouts, login/signup | TODO | Chưa giao | Chưa có màn hình/auth routes; phụ thuộc T02/T04. |
| T06 | Danh mục, tổ chức, giá | TODO | Chưa giao | Chưa có API/UI; phụ thuộc T04/T05. |
| T07 | Lịch và phân công | TODO | Chưa giao | Chưa có API/UI; phụ thuộc T06. |
| T08 | Đặt khám onsite | TODO | Chưa giao | Chưa có luồng/transaction; phụ thuộc T07. |
| T09 | Ledger và allocation | TODO | Chưa giao | Chưa có billing core; phụ thuộc T06/T08. |
| T10 | Online availability | TODO | Chưa giao | Chưa có API/UI; phụ thuộc T07. |
| T11 | Hold/reservation/payment intent | TODO | Chưa giao | Chưa có luồng; phụ thuộc T09/T10. |
| T12 | MoMo xác minh/đối soát | TODO | Chưa giao | Chưa có adapter; phụ thuộc T11 và contract/credentials sandbox. |
| T13 | Encounter/diagnosis/CLS draft | TODO | Chưa giao | Chưa có module; phụ thuộc T08/T06. |
| T14 | Phát hành hóa đơn, thu tiền | TODO | Chưa giao | Chưa có module; phụ thuộc T09/T13. |
| T15 | Lab queue/start/defer | TODO | Chưa giao | Chưa có module; phụ thuộc T14/T07. |
| T16 | ResultVersion/publish/correct | TODO | Chưa giao | Chưa có module; phụ thuộc T15. |
| T17 | Expiry/cancel/manual refunds | TODO | Chưa giao | Chưa có module; phụ thuộc T12/T14/T15. |
| T18 | Prescription/EMR/complete | TODO | Chưa giao | Chưa có module; phụ thuộc T13/T16/T17. |
| T19 | Cloudinary/media authorization | TODO | Chưa giao | Chưa có adapter; phụ thuộc T04/T16 và access mode/credentials. |
| T20 | Video/participation | TODO | Chưa giao | Chưa có adapter; phụ thuộc T12/T13 và provider đã kiểm chứng. |
| T21 | Scoped reports/CSV | TODO | Chưa giao | Có SQL view baseline; chưa có API/UI; phụ thuộc T14/T18. |
| T22 | E2E/AT01–AT49/security/races | TODO | Chưa giao | Chưa có suite nghiệp vụ; phụ thuộc T00–T21. |

## Những gì đã có và đã kiểm chứng

- Git history: `972f107` tạo frontend; `2d928a6` tạo backend; `ea2465b` thêm bộ hướng dẫn/docs/SQL. Commit message không chứng minh nghiệm thu.
- Frontend React JavaScript/JSX + Vite starter build/lint thành công; chưa phải giao diện Suncare.
- Backend có entrypoint `vn.suncare.BackendApplication`, POM khai báo Java 21/MVC/JPA/Security/Validation/Actuator/Flyway/SQL Server, một `contextLoads` trống. Chưa có API nghiệp vụ.
- Kiểm đếm tĩnh: 58 CREATE TABLE, seed 6 role/20 permission, 5 CREATE OR ALTER VIEW và 49 AT định nghĩa. Không suy ra SQL runtime/AT PASS từ kiểm đếm.
- SQL Server cục bộ truy vấn đọc được; chưa chạy schema/migration hay sửa DB trong phiên này.
- Ba file checkpoint và quy tắc root AGENTS đã được thiết lập; đây là deliverable T00.a, không phải chức năng nghiệp vụ hoặc toàn bộ T00.
- Chưa có chức năng nghiệp vụ end-to-end được xác nhận hoàn thành.

## Chưa hoàn thành

- Phần audit/kiến trúc/traceability còn lại của T00; hoàn thiện scaffold T01/T02; DB harness T03.
- Toàn bộ auth, quản trị, lịch, booking, thanh toán, khám, CLS, hồ sơ, hoàn tiền, media/video, báo cáo và E2E của T04–T22.
- Kiểm chứng bất biến tài chính, row-level authorization, concurrency SQL Server và AT01–AT49 trên code thực tế.

## Lỗi nghiêm trọng, blocker và quyết định chờ

| ID | Tác động | Tình trạng thực tế / bước xử lý |
|---|---|---|
| B01 | T00 gate | Thiếu BASELINE_AUDIT.md và ARCHITECTURE.md; tiếp tục T00, không tự chuyển sang T01. |
| B02 | Kiểm chứng build T01 | E06 offline Maven thiếu plugin dependency cache, dừng ở resources trước compile/test. JDK 21 có sẵn; JAVA_HOME/PATH chưa cấu hình. Khi thực hiện T01, dùng JDK đúng và resolve dependency qua Maven bình thường; chưa kiểm tra khả năng tải mạng, không kết luận mạng bị chặn. Wrapper dùng cache path khác bản Maven có sẵn. |
| B03 | T02 | Thiếu Tailwind/router; build/lint starter không đủ để DONE. |
| B04 | T03 và test DB | E04 xác nhận server `lpc:.` hoạt động nhưng DB tên Suncare có count 0 ở endpoint này. Chưa cấu hình datasource/harness; không kết luận mọi instance đều không có DB. |
| B05 | T06/T07/T17 | Giờ ca, sức chứa, giá, no-show/doctor absence và người duyệt/thực hiện hoàn tiền còn quyết định vận hành; xem OPEN_DECISIONS. |
| B06 | T12/T19/T20 | Chưa có evidence tích hợp; merchant/signature contract, Cloudinary access mode/retention và video provider chưa được xác nhận trong repo. Không đọc/tìm secret hoặc tuyên bố credentials toàn máy không tồn tại. |
| B07 | T16/T18 | Quy trình thông báo/xử lý sau đính chính Encounter đã complete còn chờ quyết định. |

Không có defect nghiệp vụ runtime đã tái hiện: chưa có luồng nghiệp vụ để chạy. Blocker tương lai không tự đổi toàn bộ backlog thành BLOCKED.
Chi tiết policy: [OPEN_DECISIONS.md](OPEN_DECISIONS.md). Các quy tắc nghiệp vụ/SQL giữ nguyên; mọi mismatch phát hiện sau này phải ghi nhận trước khi sửa.

## Evidence ledger

Lệnh trong phiên chạy ngày 2026-11-01 +07:00. E01/E04/E05 do Main; E02/E03 do audit_frontend; E06 do audit_backend và Main đọc lại log. Các đoạn output dưới đây là bản rút gọn, không phải log tự suy diễn.

| ID | Lệnh / working directory | Kết quả thực thi và giới hạn |
|---|---|---|
| E01 | Root: `git status --short`, `git diff`, `git diff --stat`, `git diff --cached --stat`, `git log -6 --stat`, `git rev-parse HEAD` | Exit 0; ban đầu chỉ 2 file handoff/log untracked, đều 0 byte; tracked/staged diff rỗng. HEAD ea2465b. |
| E02 | frontend: `node --version`; `npm --version`; `npm run build` | Exit 0 từng lệnh; Node v26.13.0, npm 11.20.0; Vite 8.3.5, 22 modules, built in 490 ms. Dùng node_modules sẵn có. |
| E03 | frontend: `npm run lint`; `git check-ignore frontend/dist/index.html` | Exit 0; ESLint không diagnostics; dist được ignore. Không có script test/Vitest/RTL. |
| E04 | Root: `sqlcmd -S 'lpc:.' -d master -E -C -I -b -l 5 -Q "SET NOCOUNT ON; SELECT CONVERT(nvarchar(128), SERVERPROPERTY('ProductVersion')) AS product_version; SELECT COUNT(*) AS suncare_database_count FROM sys.databases WHERE name = N'Suncare';"` | Exit 0; product_version 17.0.1000.7; suncare_database_count 0. Chỉ SELECT metadata, không DDL/DML. |
| E05 | Root: PowerShell `Select-String` đếm `^CREATE TABLE `, `^CREATE OR ALTER VIEW `, `^\| AT\d{2} `; đọc hai VALUES seed RBAC | Exit 0; 58 table, 5 view, 49 AT; seed có 6 role/20 permission. Chỉ kiểm tra tĩnh. |
| E06 | backend: JDK `java.exe -version`, `javac.exe -version`; Maven offline `test` theo lệnh bên dưới | JDK exit 0, 21.0.13.0.2. Maven exit 1, BUILD FAILURE tại maven-resources-plugin:3.5.0:resources, thiếu maven-filtering:3.5.0 và 7 dependency cache. Compile/test chưa chạy. |
| E07 | Root: Node.js validator qua PowerShell here-string piped vào `node`; `git diff --check`; Main review docs/source/config/log | Validator exit 0 PASS: 23 task duy nhất, tổng 6 trạng thái khớp, 5 nhóm giai đoạn khớp, % đúng, 11 mục handoff, 8 local links tồn tại, metadata đồng bộ; chỉ 4 file được phép đổi, root AGENTS cũ được giữ nguyên. Diff check exit 0. |

E07 output rút gọn: `PASS; tasks=23; TODO=22; READY=0; IN_PROGRESS=1; REVIEW=0; BLOCKED=0; DONE=0; phases=5; handoffSections=11; localLinks=8; checkpointConsistent=true; ownedFilesOnly=true; originalAgentsPreserved=true`. Hai lần soạn validator ban đầu exit 1 do regex nhãn tiếng Việt qua pipe và selector lấy lẫn bảng blocker; đã sửa selector theo cấu trúc cột rồi chạy PASS. Đây là lỗi script kiểm tra tạm, không phải lỗi code nghiệp vụ hoặc lỗi dữ liệu checkpoint bị bỏ qua. Không tạo file test mới.

Kiểm tra Git cuối: `git status --short`, `git diff --stat`, `git diff --cached --stat` và `git diff --check`; snapshot 2 tracked modified + 2 untracked ở SESSION_HANDOFF. Git cảnh báo LF sẽ chuyển thành CRLF theo cấu hình hiện tại; diff check không có lỗi whitespace. Hai subagents đã trả kết quả, không còn báo cáo chờ; Main đã review và nghiệm thu T00.a (chỉ tài liệu; không có build ứng dụng mới áp dụng).

Lệnh E06 tái lập chính xác trong PowerShell, working directory `backend` (chỉ đổi biến môi trường của process):

```powershell
$env:JAVA_HOME = 'C:/Users/nguye/.jdks/ms-21.0.13.0.2'
& 'C:/Users/nguye/.m2/wrapper/dists/apache-maven-3.10.0-bin/39q0qgmngdu329psje7bjgne79/apache-maven-3.10.0/bin/mvn.cmd' -o -B '-Dmaven.repo.local=C:/Users/nguye/.m2/repository' test
```

Output rút gọn từ `backend/target/audit-test.log` (local, ignored; phần cốt lõi được lưu ở đây để không phụ thuộc file bị ignore):

```text
[ERROR] BUILD FAILURE
Failed to execute goal ... maven-resources-plugin:3.5.0:resources
Cannot access central (...) in offline mode and the artifact
org.apache.maven.shared:maven-filtering:jar:3.5.0 has not been downloaded from it before.
```

Bảy artifact khác thiếu cache: plexus-utils:3.6.0, slf4j-api:1.7.36, org.codehaus.plexus:plexus-build-api:1.2.0, plexus-interpolation:1.29, javax.inject:1, org.sonatype.plexus:plexus-build-api:0.0.7, org.eclipse.sisu:org.eclipse.sisu.plexus:0.9.0.M4. Lần gọi wrapper đầu exit 1 vì PowerShell tách tùy chọn `-Dstyle.color=never` không quote thành phase `.color=never`; lỗi gọi lệnh, đã sửa bằng lần E06. Không xem cả hai là test ứng dụng FAIL. Không kết nối DB từ backend.

Evidence lịch sử riêng: [database/README.md](../../database/README.md) ghi đã chạy validator/schema/seed/views/smoke/DBCC ngày 2026-11-01. Không tìm thấy raw execution log đi kèm trong các tài liệu triển khai đã đọc; **chưa tái xác minh** trong phiên này. Không xóa tuyên bố lịch sử, không dùng nó để đánh dấu T03/T22 DONE. Dòng mẫu cũ trong PROGRESS nói chưa chạy lệnh đã được thay bằng evidence hiện tại.

Chưa chạy: backend compile/contextLoads/verify (E06 chưa tới các bước này), health/error smoke; SQL validator/04_smoke_test, hai kết nối cạnh tranh, browser/visual QA, AT01–AT49, MoMo/Cloudinary/video. Không tải/cài dependency, không chạy generator, không dùng H2.

## Quy tắc trạng thái và checkpoint

- Chỉ Main Agent cập nhật trạng thái tổng thể. TODO: chưa thực hiện scope roadmap (có thể có starter kế thừa). READY: dependency/gate đủ, chưa bắt đầu. IN_PROGRESS: đã làm một phần, còn bước cần tiếp tục. REVIEW: deliverable chờ Main review. BLOCKED: đã xác định trở ngại cụ thể và điều kiện gỡ. DONE: hoàn tất scope, build áp dụng và test bắt buộc PASS, Main review, không blocker.
- IN_PROGRESS không khẳng định còn agent chạy nền. Xem [AGENT_LOG](AGENT_LOG.md) để biết hoạt động thực tế.
- Trước task lớn, sau task/milestone, trước kết thúc: cập nhật file này → AGENT_LOG → SESSION_HANDOFF → `git status --short` → `git diff --stat`; lưu evidence và bước tiếp theo. Kiểm tra cả staged/untracked.
- Dùng cùng checkpoint ID/thời gian trong ba file; nếu bị ngắt giữa lúc ghi, phiên RESUME phải đối chiếu Git/code và sửa trạng thái trước khi làm tiếp.
- Tối đa 2 subagents; scope độc lập; không ước đoán quota; không đợi quota cạn mới lưu. Quy trình STOP/RESUME nằm trong [SESSION_HANDOFF](SESSION_HANDOFF.md).

## Bước tiếp theo duy nhất

Phiên này đã hoàn tất **T00.a**, lưu checkpoint cuối và dừng; không còn agent con đang làm việc. T00 vẫn IN_PROGRESS vì các deliverable còn thiếu, không tự tiến sang phase khác.
Phiên được yêu cầu tiếp tục: **hoàn tất phần còn lại của T00** theo [00_FIRST_RUN](../../prompts/00_FIRST_RUN.md), tái sử dụng inventory hiện có; tạo BASELINE_AUDIT/ARCHITECTURE và traceability, cập nhật checkpoint rồi dừng. Chưa có task T00–T22 DONE gần nhất.
