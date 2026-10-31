---
name: suncare-feature-delivery
description: Implement or review one bounded Suncare feature/task in a React JavaScript Tailwind and Spring Boot SQL Server REST project. Use when Codex is asked to build a Suncare API, UI screen, booking/payment/clinical workflow, or to execute a Txx task with requirements, ownership, contracts, tests, and handoff. Do not use for a generic unrelated coding question or database redesign.
---

# Suncare task delivery

1. Load repository `AGENTS.md`, applicable nested AGENTS and exact domain sections from `docs/01-...` through `docs/06-...` plus SQL dictionary where relevant. Do not ingest all files when a few sections suffice.
2. Read `tasks/ROADMAP.md` and the current task contract; confirm prerequisites, owned files, protected files, dependent APIs and relevant AT acceptance cases. For contract details, consult `references/task-contract.md`.
3. Produce a concise implementation plan: observable change, API and state transition, access/scope rule, SQL transaction/lock order if needed, edge cases, and tests. If requirements conflict, record the conflict before changing code.
4. Implement **only** this task. Keep unrelated modules untouched. If it needs a shared file changed, serialize that edit with the integrator and note the new ownership before doing so.
5. Verify build and unit/contract tests; for SQL Server behavior run DB-backed integration/concurrency tests, else mark as blocked. Do not mark fake provider results as verified real MoMo/Cloudinary/video integrations.
6. Update `docs/implementation/PROGRESS.md` with actual evidence; return changed files, commands/results, AT coverage, risk/open points and next suggested task. Stop after one task.

## Additional guides

- `references/task-contract.md`: implementer ownership and checklists.
- `references/domain-gates.md`: booking, payments, CLS and data safety invariants.
- `docs/implementation/API_CONVENTIONS.md` (repository-level): REST DTO contract.

This skill supplements rather than overrides the root and nested `AGENTS.md` and verified Suncare domain documents.
