# Prompt order (VS Code Codex)

Start in repo root. Copy **one prompt per Codex turn**. Do not paste the entire folder together.

1. `00_FIRST_RUN.md` — inspect files and plan, no application code.
2. `01_SCAFFOLD.md` — backend skeleton T01 only.
3. `01B_FRONTEND_SCAFFOLD.md` — frontend JS/Vite/Tailwind skeleton T02 only.
4. `02_SQL_GATE.md` — verify SQL Server, safe initial DB validation and connection. Pause before destructive operations.
5. `03_API_CONTRACT.md` — apply before each new feature's implementation, starting with T04.
6. `04_UI_DESIGN.md` — create UI design system and app shell before many screens (T05).
7. `05_RUN_TASK.md` — reusable main executor for **one** Txx task at a time. Replace `[TASK_ID]` only.
8. `06_FINANCIAL_REVIEW.md` — mandatory review before merging online booking/cash/refunds/CLS expiry.
9. `07_FINAL_QA.md` — actually run acceptance tests across flows, do not treat checklist as results.
10. `08_PARALLEL_WORK.md` — optional instructions for parallel Codex worktrees/subagents.
11. `09_RESUME.md` — when starting a new chat or after compaction.

Start with prompts 00, 01, 01B and 02. Thereafter treat the roadmap dependency graph as authoritative: use `03_API_CONTRACT.md` and `05_RUN_TASK.md` as needed, design only when T05 is ready. Never start T12 real MoMo without provider sandbox documents/credentials.
