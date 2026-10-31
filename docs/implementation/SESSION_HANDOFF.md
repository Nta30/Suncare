# Suncare — bàn giao phiên và phục hồi

Checkpoint: `CP-20261101-01` — checkpoint cuối phiên; cập nhật: **2026-11-01 05:50 +07:00 (Asia/Saigon)**.
Repo: `D:\TaiLieu\Nam4Ky1\Project_1\Suncare`; branch `main`; HEAD `ea2465b054319d07adf26878d2eb5f40a579e0e0`.
Đây là checkpoint cuối phiên. Main đã review; hai subagents đã trả đủ kết quả. Không còn công việc chạy nền được giao trong cây phiên này.

## 1. Task đang thực hiện

**T00.a — persistent progress/recovery**, subtask giới hạn của T00 theo cấu trúc [TASK_TEMPLATE](../../tasks/TASK_TEMPLATE.md). Status: DONE sau E07/Main review. Chỉ thiết lập hệ thống và xác minh hiện trạng, không triển khai chức năng nghiệp vụ. Task cha T00 vẫn IN_PROGRESS và là task cần tiếp tục; chưa có task cha nào DONE.

Task contract trước khi sửa:

- Owner: Main `/root`, branch/worktree hiện tại; dependency: yêu cầu checkpoint của người dùng, kiểm kê Git và đọc quy tắc repo. Subtask này không yêu cầu T01–T22 hoàn thành.
- Input: root/module AGENTS, ROADMAP, TASK_TEMPLATE, toàn bộ 7 file docs/implementation có sẵn, prompts INDEX/00_FIRST_RUN/09_RESUME; đọc scope scaffold và database README/seed/validator/định nghĩa AT để phân loại evidence. Chưa làm audit toàn diện docs 01–06/DDL của T00.
- Files owned: ba file checkpoint và phần quy tắc checkpoint mới trong root AGENTS.md. Thêm AGENTS để các phiên sau tự tìm được workflow; bảo toàn nội dung cũ.
- Protected: backend/frontend source/config/lockfile, database/**, docs/01–06, các tài liệu implementation còn lại, tasks/**, prompts/** và mọi thay đổi người dùng có sẵn. Không sửa/xóa những file này.
- API/DTO/permissions/transaction/state nghiệp vụ: không áp dụng cho thay đổi tài liệu; không thay chính sách/SQL. Hai audit chỉ được tạo output build/cache bị ignore.
- Verification: đối chiếu từng T00–T22 với code/evidence; kiểm tra tổng/phần trăm/status/links và đồng bộ checkpoint; Git diff check; Main review; build/lint hiện có chỉ để mô tả baseline, không mở thêm task.
- DONE của T00.a yêu cầu đủ ba file, quy tắc tự phục hồi, evidence trung thực và checks tài liệu PASS. T00 vẫn chưa DONE vì thiếu BASELINE_AUDIT/ARCHITECTURE/traceability.

## 2. Bước cuối cùng đã hoàn thành

Đã nhận đủ hai báo cáo audit, Main đối chiếu source/config và log Maven; frontend build/lint PASS nhưng thiếu Tailwind/router; backend offline dừng trước compile/test vì thiếu dependency cache. Main xác nhận SQL Server local đọc được; chưa thấy DB Suncare tại `lpc:.`. Bước cuối hoàn thành: E07 kiểm tra checkpoint PASS, Main review, lưu ba file bàn giao và quy tắc root AGENTS; đã kiểm tra Git cuối.

## 3. Bước tiếp theo chính xác

Phiên này kết thúc sau T00.a; không giao thêm việc.
Khi user yêu cầu RESUME: thực hiện quy trình phục hồi bên dưới, sau đó hoàn tất **phần còn lại T00**: đọc sections nguồn liên quan, audit docs/SQL và viết BASELINE_AUDIT.md + ARCHITECTURE.md, traceability D/TX/AT, cập nhật 3 checkpoint rồi dừng. Không khởi tạo lại scaffold, không tự bắt đầu T01.
Task roadmap DONE gần nhất: **chưa có**.

## 4. File đã tạo/sửa/xóa

| File | Thay đổi |
|---|---|
| docs/implementation/PROGRESS.md | Sửa mẫu thành ledger 23 task, counts/giai đoạn, chức năng, blocker và evidence. |
| docs/implementation/AGENT_LOG.md | Điền file rỗng có sẵn, đang untracked; lưu assignment/ownership/handoff. |
| docs/implementation/SESSION_HANDOFF.md | Điền file rỗng có sẵn, đang untracked; lưu task contract, recovery và next prompt. |
| AGENTS.md | Chỉ thêm mục Persistent checkpoints and recovery để workflow tồn tại qua phiên. |

Không xóa file; không thay code nghiệp vụ, SQL, package/lock hoặc config. Output ignored phát sinh: `frontend/dist/`, `backend/target/audit-maven/` (copy Maven cache sẵn có phục vụ lần thử wrapper), `backend/target/audit-test.log`. Giữ nguyên, không coi đây là source hay deliverable DONE.

## 5. Những thay đổi chưa commit

Đầu phiên: chỉ `?? docs/implementation/AGENT_LOG.md` và `?? docs/implementation/SESSION_HANDOFF.md`, đều 0 byte; `git diff` và staged diff rỗng. Các file scaffold đã nằm trong commit trước.
Các thay đổi tài liệu của phiên này chưa commit/stage. Snapshot checkpoint cuối:

```text
 M AGENTS.md
 M docs/implementation/PROGRESS.md
?? docs/implementation/AGENT_LOG.md
?? docs/implementation/SESSION_HANDOFF.md
```

`git diff --stat` chỉ gồm 2 file tracked AGENTS/PROGRESS; hai file untracked đã đọc riêng và được validator kiểm tra. `git diff --cached --stat` rỗng; `git diff --check` exit 0. Không tự commit/reset/stash/clean. Snapshot này phải được đối chiếu lại khi RESUME.

## 6. Test/check đã chạy và kết quả

Evidence cụ thể và output rút gọn trong [PROGRESS — Evidence ledger](PROGRESS.md#evidence-ledger):

- E01: Git status/diff/log exit 0; baseline được bảo toàn.
- E02: frontend `npm run build` exit 0; Vite 8.3.5, 22 modules, 490 ms.
- E03: frontend `npm run lint` exit 0; không diagnostics; dist ignored.
- E04: SQL metadata SELECT exit 0, server version 17.0.1000.7; count DB Suncare = 0 trên `lpc:.`; không chạy DDL/DML.
- E05: kiểm đếm tĩnh 58 bảng, 6 role, 20 permission, 5 views, 49 AT định nghĩa. Không phải kết quả chạy SQL/AT.
- E06: JDK java/javac exit 0 (21.0.13.0.2); Maven offline test exit 1 tại resources vì thiếu cache maven-filtering và 7 dependency. Compile/test chưa chạy, không phải source/test FAIL đã xác nhận. Lệnh chính xác/output lưu trong PROGRESS; local full log ở backend/target/audit-test.log. Lần wrapper ban đầu gặp lỗi quote PowerShell, sau đó đã sửa invocation; không tải dependency.
- E07: Node validator exit 0 PASS: 23 task, status/tổng/%/5 giai đoạn khớp, 11 mục handoff, 8 local links hợp lệ, checkpoint metadata đồng bộ; đúng 4 file allowed, root AGENTS cũ được bảo toàn. `git diff --check` exit 0; Main review hoàn tất. Hai lần selector validator tạm lỗi đã được sửa và ghi rõ trong PROGRESS trước lần PASS.

## 7. Test chưa chạy

- SQL validator/schema/seed/smoke/DBCC trong phiên này; historical README claim được giữ riêng, không được xem như evidence mới.
- Backend compile, contextLoads và verify; E06 dừng trước compiler/test. Chưa có health/error isolated test.
- Browser/base route/visual QA; frontend không có test script/Vitest/RTL.
- AT01–AT49, SQL Server integration/race hai kết nối, security/row-scope, payment callbacks, media/video integration.
- Chưa cần chạy lại build/lint nếu chỉ chỉnh tài liệu; không cài dependency hoặc dùng H2 để thay bằng chứng SQL Server.

## 8. Agent đang hoạt động hoặc chưa trả kết quả

- Main `/root`: assignment T00.a DONE, đã review và ghi checkpoint; kết thúc phiên, chưa nhận triển khai phần còn lại T00.
- `/root/audit_backend`: DONE, đã báo cáo; chỉ tạo output/cache ignored.
- `/root/audit_frontend`: DONE, đã báo cáo; không sửa file nguồn.
- Kiểm tra `collaboration.list_agents` cuối phiên: hai subagents đều completed. Không còn subagent đang hoạt động hoặc nợ kết quả trong cây này; các trạng thái ở đây là assignment checkpoint, không phải chứng nhận DONE cho T01/T02.
- Không có assignment tồn đọng trước khi Main spawn hai audit trong cây phiên này. Không thể suy ra công việc của phiên Codex khác từ process đang chạy; phải kiểm tra lại Git và ownership khi RESUME.

## 9. Blocker và quyết định còn chờ

- T00 chưa có audit/architecture hoàn chỉnh; đây là task tiếp tục duy nhất.
- Kiểm tra build backend bị cache offline chặn (B02/E06). Có JDK 21 và Maven cache cục bộ; JAVA_HOME/PATH chưa cấu hình. Chưa thử resolve dependencies qua mạng, không kết luận mạng hoặc build online bị chặn. Xử lý khi task T01 được bắt đầu sau T00; không cần sửa code trong phiên checkpoint.
- T02 thiếu Tailwind/router; T03 thiếu datasource/bootstrap/harness và DB ở endpoint vừa kiểm tra.
- Policy/external decisions B05–B07 trong PROGRESS/OPEN_DECISIONS chưa được giải quyết: giờ/giá/capacity, no-show/absence, refunds, MoMo/Cloudinary/video, xử lý đính chính.
- Không cần quyết định nghiệp vụ để hoàn tất checkpoint. Không sửa policy, tự điền giá/giờ hoặc tự chạy bootstrap.

## 10. Lệnh cần chạy tiếp theo

Trong PowerShell tại root repo, dùng thứ tự phục hồi sau (không chạy script tạo DB):

```powershell
Get-Content -Encoding utf8 docs/implementation/SESSION_HANDOFF.md
Get-Content -Encoding utf8 docs/implementation/PROGRESS.md
Get-Content -Encoding utf8 docs/implementation/AGENT_LOG.md
Get-Content -Encoding utf8 AGENTS.md
Get-Content -Encoding utf8 tasks/ROADMAP.md
git status --short
git diff --stat
git diff
git diff --cached --stat
git diff --cached
git log -6 --oneline
Get-Content -Encoding utf8 prompts/00_FIRST_RUN.md
```

Sau đó kiểm tra agent bằng công cụ collaboration (không phải lệnh shell), đọc các file untracked và code liên quan để đối chiếu báo cáo; đọc module AGENTS trước thao tác module. Git diff rỗng không chứng minh untracked/ignored không đổi. Chỉ chạy lại test nếu code/config đổi, evidence thiếu hoặc có lỗi cần xác minh.

## 11. Prompt ngắn cho phiên Codex mới

```text
RESUME SUNCARE — MASTER ORCHESTRATOR.
Đọc SESSION_HANDOFF.md → PROGRESS.md → AGENT_LOG.md trong docs/implementation,
rồi AGENTS.md và tasks/ROADMAP.md. Đối chiếu Git, code và agent thực tế;
sửa báo cáo sai trước khi làm tiếp, giữ nguyên mọi thay đổi hiện có.
Chỉ Main cập nhật ba file chung; tối đa 2 subagents với scope độc lập.
Tiếp tục duy nhất phần chưa xong của T00 theo prompts/00_FIRST_RUN.md:
hoàn tất BASELINE_AUDIT.md, ARCHITECTURE.md và traceability/gates.
Tái sử dụng inventory/evidence đã có; không làm lại task DONE, không triển khai nghiệp vụ,
không tự bắt đầu T01. Tạo checkpoint trước việc lớn, sau milestone và cuối phiên;
ghi test thực chạy, blocker, agent còn chờ và bước tiếp theo, rồi dừng sau T00.
```

Prompt STOP dùng bất kỳ lúc nào: `CHECKPOINT AND STOP — không giao task mới; yêu cầu agent dừng an toàn và báo cáo; bảo toàn thay đổi; cập nhật PROGRESS, AGENT_LOG, SESSION_HANDOFF; ghi kết quả/chưa có kết quả và bước tiếp theo rồi dừng.`

## Quy trình checkpoint, STOP và RESUME

1. Checkpoint trước task lớn, sau task/milestone và trước khi kết thúc. Main cập nhật PROGRESS → AGENT_LOG → SESSION_HANDOFF, cùng ID/thời điểm; kiểm tra `git status --short`, `git diff --stat`, staged/untracked, lưu evidence và next command. Không phụ thuộc việc biết quota.
2. Nếu bị ngắt giữa ba lần ghi, coi checkpoint chưa nhất quán; đọc Git/code/evidence, hỏi báo cáo agent nếu còn điều khiển được, sửa ledger trước khi tiếp tục. Không suy diễn bước “sẽ chạy” thành đã chạy.
3. STOP/CHECKPOINT AND STOP: không giao việc mới, yêu cầu agent dừng an toàn, chờ báo cáo nếu có thể; agent chưa báo cáo phải ghi rõ chưa xác nhận, không DONE. Không xóa/reset code/output đang làm. Lưu checkpoint cuối và xuất báo cáo bàn giao.
4. RESUME: đọc theo thứ tự ở mục 10, xác minh trạng thái thật/agent và DONE gần nhất. Nếu báo cáo sai, sửa trước; tiếp tục bước chưa hoàn thành, không triển khai lại DONE. Một task mỗi lượt theo roadmap; không tự chuyển phase.
5. Status chỉ TODO/READY/IN_PROGRESS/REVIEW/BLOCKED/DONE; DONE đòi deliverable hoàn tất, build áp dụng và test bắt buộc PASS, Main review, không blocker. Tách % task DONE khỏi bằng chứng hoàn thiện chức năng.
6. Ba file trên đĩa là checkpoint hiện tại, Git giữ lịch sử sau khi commit. File chưa commit vẫn cần được mang theo khi chuyển workspace/clone; phiên mới ở máy khác không tự có chúng. Không tự commit nếu người dùng chưa yêu cầu.
