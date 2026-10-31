# Suncare — Codex repository instructions

## Mission and scope
Build a **single-facility outpatient** platform (onsite and online). Stack: Java 21, Spring Boot + Maven, SQL Server, REST API; React **JavaScript/JSX** + Vite + Tailwind CSS (no TypeScript). Source of truth: `docs/01-nghiep-vu.md` through `docs/06-bao-cao-kiem-chung.md`, then `database/*.sql` and `database/README.md`. Read only the relevant sections per task; for conflicting sources, stop and record the mismatch for review rather than silently redefining policy.

## Non-negotiable Suncare invariants
- One facility; NO inpatient, insurance, stock/pharmacy sales, payroll, tax invoices, or unrelated features.
- Patient and Staff are separate; Account belongs to exactly one profile type (XOR). Roles scoped to real assignments.
- Onsite: patient picks specialty/date/MORNING or AFTERNOON, **not doctor or specific time**; backend chooses by minimum booked/capacity ratio.
- Online: 20-minute slots; optional doctor choice; 5-minute booking hold; verified MoMo payment is required before Appointment + Encounter creation. Cancellation only online, at least 24h prior, under specified conditions; no rescheduling.
- Physician issues onsite and supplementary invoices; online initial examination invoice is SYSTEM-issued; CLS has a chargeable line per order. No double examination fees.
- CLS expiry is based on first full allocation/payment (default 10 × 24h); deferrals retain the same order, Encounter and expiry; once started before expiry, work may complete after expiry.
- Published clinical results are immutable; corrections create new ResultVersion. Prescription is optional.
- Refunds are manual, tracked and never inferred from failed external calls. Medical data and result media are authorized server-side.
- SQL is **the database authority**. Do not replace the existing 58-table design with a new generated model. Do not apply migrations to an existing populated DB without a reviewed migration plan.

## Required agent workflow
1. Inspect `git status`, current structure, exact relevant docs and affected files. Respect edits already present. Never blindly overwrite files or delete user data.
2. Work on **one numbered task** from `tasks/ROADMAP.md` at a time, or an explicitly scoped subtask in `tasks/TASK_TEMPLATE.md`. Record dependencies, allowed files, protected files and verification before editing.
3. Maintain `docs/implementation/PROGRESS.md` (completed/blocked/next). Do not mark passed without actual execution logs.
4. For nontrivial API changes: specify OpenAPI DTO, permission/row scope, state transitions, transaction/lock order, errors, idempotency and relevant AT cases **before implementation**. Follow `docs/implementation/API_CONVENTIONS.md`.
5. Implement the smallest complete slice; use tests for correctness, including negative/unauthorized and concurrent scenarios. Prefer readable code over gratuitous abstractions.
6. Run available build/test/lint commands. If SQL Server, network, secrets or Docker are unavailable, report the blocker precisely; do not claim execution or swap to H2 as proof of SQL Server behavior.
7. Finish with changed files, tests run/results, business invariants verified, blockers and next single task. Do not automatically continue to another phase.

## Cross-cutting rules
- REST `/api/v1`, server-side validation, DTO boundaries, predictable error schema. No raw entity serialization or generic arbitrary status setters.
- Server establishes acting user, authorized patient, department, doctor and prices; ignore/request-reject forged IDs, prices and statuses. Permission check plus row-level access on **each** request, file and video link.
- VND `decimal(19,0)` -> Java BigDecimal -> **decimal string in JSON** to avoid JS precision loss. UTC storage, Asia/Saigon display/filter. No floats for money.
- For concurrent booking/payment/expiry/refund, transactions and SQL Server resource locks are mandatory (see `docs/05-giao-dich-rang-buoc.md` TX01–TX11). Handle retries using CommandReceipt/idempotency and unique constraints.
- Never log passwords, secrets, bearer tokens, payment signatures, raw medical content or unredacted callbacks. No real medical data in seeds, screenshots, logs or tests.
- Only approved external integrations: MoMo, Cloudinary and a video provider whose protocol must be separately verified. Adapters must be separable and fail closed; mocks are explicitly DEV/TEST-only.
- `backend/AGENTS.md` and `frontend/AGENTS.md` add module-specific constraints. `database/AGENTS.md` protects schema.
- Skills in `.agents/skills` are optional, task-triggered reusable instructions, not substitutes for these documents.

## Phase gate
A task is DONE only when its acceptance cases and executable checks are recorded. If a required external credential or policy is missing, implement an interface and safe disabled behavior, mark the integration BLOCKED, and continue only with independent work. No fictional success.

## Persistent checkpoints and recovery
- `docs/implementation/PROGRESS.md` is the authoritative task ledger; `SESSION_HANDOFF.md` and `AGENT_LOG.md` in the same directory hold recovery steps and agent ownership. Only Main Agent edits these three shared files; subagents report evidence to Main Agent.
- Use only TODO, READY, IN_PROGRESS, REVIEW, BLOCKED, DONE for task/agent work status. DONE requires completed deliverables, applicable build and mandatory tests passing, Main Agent review and no remaining blocker. Existing code or historical claims alone are insufficient.
- Before a large task, after each task/important milestone, and before ending a session: update PROGRESS, then AGENT_LOG, then SESSION_HANDOFF; run `git status --short` and `git diff --stat`; record commands/results, unrun tests, uncommitted/untracked files, outstanding agents, blockers and the exact next step. Inspect staged changes and untracked file contents too; ordinary diff omits them. Record a shared checkpoint ID and Asia/Saigon timestamp in all three files; incomplete checkpoint writes must be reconciled on recovery.
- Run at most two subagents concurrently unless Main Agent records a concrete reason to exceed that limit. Delegate independent work with narrow context and exclusive file ownership. Do not infer account quota or defer checkpoints until quota exhaustion.
- On STOP or CHECKPOINT AND STOP: assign no new work, ask active agents to stop safely and report, wait when possible, preserve all changes, record any missing reports, save the final checkpoint and return the handoff. Never mark an unreturned agent DONE.
- On RESUME: read SESSION_HANDOFF, PROGRESS, AGENT_LOG, root/nested AGENTS and ROADMAP; inspect Git and actual affected code; reconcile incorrect reports before proceeding. Find the latest verified DONE task and continue the first unfinished step without rebuilding completed work. Follow the detailed protocol and prompt in SESSION_HANDOFF; do not automatically start the next roadmap task.
