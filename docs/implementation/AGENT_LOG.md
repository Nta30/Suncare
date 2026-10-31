# Suncare — agent log

Checkpoint: `CP-20261101-01` — checkpoint cuối phiên; cập nhật: **2026-11-01 05:50 +07:00 (Asia/Saigon)**.
Chỉ Main Agent ghi file này và hai file PROGRESS/SESSION_HANDOFF. Subagent báo cáo kết quả, không tự sửa trạng thái chung.

## Agent và phân công

| Agent ID/tên | Vai trò | Task được giao | Phạm vi được sửa | Status | Bàn giao / evidence / vấn đề |
|---|---|---|---|---|---|
| `/root` | Main Orchestrator/integrator/reviewer | T00.a checkpoint hiện trạng, không triển khai nghiệp vụ | AGENTS.md; docs/implementation/PROGRESS.md, AGENT_LOG.md, SESSION_HANDOFF.md | DONE | Đã nhận đủ hai báo cáo, đối chiếu source/config/log; tích hợp E01–E07, Main review và checkpoint checks PASS. Chỉ T00.a DONE; T00 IN_PROGRESS. |
| `/root/audit_backend` | Reviewer chỉ đọc backend | Kiểm kê phần có/thiếu của T01/T03; kiểm tra toolchain và build hiện có | Không sửa source/config/docs; chỉ output build/cache bị ignore trong backend/target | DONE | E06: JDK 21 có sẵn; Maven offline exit 1 do cache thiếu dependency, compile/test chưa chạy; báo cáo đầy đủ, Main đọc lại log. Không được triển khai T01/T03. |
| `/root/audit_frontend` | Reviewer chỉ đọc frontend | Kiểm kê T02, build/lint starter | Không sửa source/config/docs/lockfile; chỉ output frontend/dist bị ignore | DONE | E02/E03: build/lint exit 0; thiếu Tailwind/router/test; không có UI nghiệp vụ; không browser QA. Main đã đối chiếu package/config/source. |

DONE của một **audit assignment** chỉ nói báo cáo audit đã hoàn tất; không chuyển task roadmap tương ứng thành DONE. Status overall ở PROGRESS chỉ do Main quyết định.

## Kiểm tra agent ngoài phiên

- Đầu phiên, `collaboration.list_agents` chỉ thấy `/root`, chưa có task subagent tồn đọng trong cây phiên này.
- Main sau đó giao đúng 2 audit độc lập ở bảng trên; không giao task triển khai, không spawn thêm agent con.
- Quan sát process chỉ thấy các tiến trình tên codex/host/service. Không thể suy ra task/ownership hay trạng thái agent của phiên IDE/process khác từ tên/PID; chưa xác nhận các phiên khác đang làm gì. Không tắt process, không thu hồi file ownership ngoài phạm vi đã biết.
- Phiên RESUME phải kiểm tra lại agent và Git; ID từ phiên cũ là lịch sử, không mặc nhiên còn có thể điều khiển.
- Cuối phiên, `collaboration.list_agents` xác nhận cả audit_backend và audit_frontend completed; không còn subagent chạy/chưa trả kết quả trong cây phiên này. Status bảng là trạng thái assignment; Main chỉ còn xuất báo cáo kết thúc.

## Nhật ký checkpoint

| Checkpoint/milestone | Status | Bàn giao |
|---|---|---|
| CP-20261101-01 / inventory ban đầu | DONE | main @ ea2465b; tracked/staged sạch; AGENT_LOG và SESSION_HANDOFF là file rỗng untracked sẵn có; không ghi đè nội dung của người dùng. |
| CP-20261101-01 / audit frontend | DONE | npm build/lint PASS; không công nhận T02 DONE. |
| CP-20261101-01 / audit backend | DONE | Phát hiện lỗi PowerShell invocation rồi sửa một lần; Maven offline dừng trước compile do thiếu cache. Không nhận định source lỗi hoặc test PASS. |
| CP-20261101-01 / tích hợp checkpoint | DONE | E01–E07 đã ghi; Node validator counts/phases/links/ownership và git diff check PASS, Main review; checkpoint cuối đồng bộ ba file. |

Vấn đề phát sinh: audit_backend đã copy Maven cache có sẵn vào `backend/target/audit-maven/` để thử wrapper trước khi nhận hướng dẫn dùng cached Maven trực tiếp. Chỉ output ignored, đã giữ lại cùng `backend/target/audit-test.log`, không xóa hoặc sửa source/config. Lỗi quoting lần đầu được ghi trong E06, không che giấu hay tính thành lỗi nghiệp vụ. Không agent nào còn nợ báo cáo.

Main sửa hai lỗi selector của validator tạm trước khi E07 PASS (chi tiết PROGRESS); không sửa dữ liệu để né lỗi kiểm tra. Không tăng quá 2 subagents, không mở task nghiệp vụ mới.

## Quy tắc giao việc và dừng

- Tối đa 2 subagents đồng thời. Ngoại lệ phải có lý do cụ thể được Main ghi lại trước khi tăng; không dùng agent cho thao tác nhỏ.
- Giao đúng phần tài liệu cần đọc, dependency, file ownership/protected, lệnh kiểm tra và báo cáo mong đợi; không để nhiều agent sửa shared config/router/OpenAPI/schema cùng lúc.
- Trước khi agent sửa code phải có task contract; lượt này tất cả agent audit chỉ đọc. Không có quyền ghi trạng thái chung cho subagent.
- Báo cáo bắt buộc: file đổi, deliverable, command/exit/output, test chưa chạy, blocker, rủi ro và bước tiếp; Main review trước khi chấp nhận.
- Khi STOP: không giao thêm, yêu cầu agent dừng an toàn và trả báo cáo; chờ nếu có thể. Nếu chưa có kết quả, giữ trạng thái chưa DONE, ghi rõ agent và phần chưa biết vào SESSION_HANDOFF; bảo toàn mọi thay đổi.
