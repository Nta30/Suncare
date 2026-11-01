# Suncare — agent log

Checkpoint: `CP-20261101-08` — hoàn tất T03 (`DONE`) sau khi bật TCP/IP 1433 trên SQL Server 2022 và vượt qua 20/20 bài kiểm thử Maven (gồm `SqlServerDatabaseHarnessIT`); cập nhật: **2026-11-01 16:56 +07:00 (Asia/Saigon)**.
Chỉ Main Agent ghi file này và hai file `PROGRESS.md` / `SESSION_HANDOFF.md`.

## Agent và phân công

| Agent ID/tên | Vai trò | Task được giao | Phạm vi được sửa | Status | Bàn giao / evidence / vấn đề |
|---|---|---|---|---|---|
| `/root` | Main Orchestrator / Implementer | T03 — SQL Server connectivity, bootstrap, `CommandReceipt`, DB test harness | `backend/src/**/infrastructure/db/**`, `backend/src/**/common/idempotency/**`, `backend/.env.example`, `backend/src/main/resources/application-local.properties`, `backend/src/test/resources/application-dbtest.properties`, `docs/implementation/**` | DONE | E11–E13 PASS: DB `Suncare` đủ 58 bảng, 5 view, 6 role, 20 permission; TCP/IP 1433 đã bật; 20/20 Maven tests PASS (17 unit + 3 SQL Server 2022 IT). |

## Nhật ký checkpoint

| Checkpoint/milestone | Status | Bàn giao |
|---|---|---|
| `CP-20261101-01` | DONE | Kiểm kê ban đầu và thiết lập 3 file checkpoint. |
| `CP-20261101-06` | DONE | Hoàn tất T00, T01 (6/6 tests PASS), T02 (lint + 4/4 tests + build PASS). |
| `CP-20261101-07` | BLOCKED | Hoàn tất code/unit tests T03 (17/17 PASS) và khởi tạo DB `Suncare`; chờ bật TCP/IP 1433. |
| `CP-20261101-08` | DONE | Đã bật TCP/IP 1433 trên `MSSQLSERVER`, chạy PASS `SqlServerDatabaseHarnessIT` (3/3 IT, tổng 20/20 Maven tests PASS), chốt T03 DONE. |
