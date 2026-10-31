# MAIN EXECUTION PROMPT — exactly one task

Task ID: **[TASK_ID]** from `tasks/ROADMAP.md` (replace the placeholder before sending).

Act as the owner of this one Suncare feature slice. Follow root and nested `AGENTS.md`. Invoke `$suncare-feature-delivery` if installed/discoverable, otherwise read `.agents/skills/suncare-feature-delivery/SKILL.md`.

START CHECKS:
- Inspect git status and progress. Ensure all listed task prerequisites are genuinely DONE or mark BLOCKED. Do not reuse an unsupported prior claim of test success.
- Read only the exact relevant sections of docs 01–06, SQL DDL and API conventions. Resolve discrepancy before implementation. Write the task contract using `tasks/TASK_TEMPLATE.md`, including **exclusive FILES OWNED** and **FILES PROTECTED**; no conflicting scope with active tasks/agents.
- If feature needs new endpoints, first define OpenAPI DTOs, server permissions/row scope, state transition, SQL transaction/locking/idempotency and acceptance AT IDs. Do not accept forged IDs, prices, statuses or client-side payment success.

IMPLEMENT:
- Follow small tests-first increments where feasible; implement one API/transaction and its UI only if in this task's ownership. Share component/library code only with named integrator approval.
- Database is SQL Server authoritative; no schema rewrite, no H2 as concurrency proof. Hold, payment, refund and CLS expiry must use server UTC and lock ordering from docs/05.
- Provide real loading/empty/error/permission and conflicting-request UI states; no placeholder that claims a successful transaction without backend confirmation.

VERIFY AND HANDOFF:
- Run the relevant backend Maven build/test, frontend build/lint/tests and SQL Server integration/concurrency tests. If an external dependency is unavailable, state exactly **not run** and why.
- Update `docs/implementation/PROGRESS.md` with actual evidence; report files changed, endpoint contracts, AT cases verified, known gaps/risks and next one task.
- If blocked, do not invent policy, payment event or test result to mark DONE.

**STOP after completing [TASK_ID]. Do not advance to another roadmap item automatically.**
