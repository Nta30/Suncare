# T22 — End-to-end verification and safety gate

Read the six Suncare documents, `database/README.md`, `tasks/ROADMAP.md`, and actual implementation/test logs. Audit the complete system rather than inferring success from UI visibility.

1. Build backend and frontend; run lint/unit/contract tests, SQL Server-backed integration tests, and browser E2E as locally supported. Distinguish runnable and unavailable checks.
2. For **AT01–AT49** in `docs/06-bao-cao-kiem-chung.md`, create traceability rows: AT ID | code/test | last real result PASS/FAIL/BLOCKED | evidence/time | follow-up. Do not mark PASS from speculation.
3. Explicitly exercise independent SQL connections for races: last onsite capacity, two online holds same slot, duplicate/later MoMo callback, lab START vs expiry job, duplicate refund commands. Verify idempotency and rollback after forced failure.
4. Verify staff/patient/department isolation including report/CSV/media URLs; CSV formula injection; no leaked tokens; issued result and invoice snapshots retain history.
5. Check Windows setup instructions, README env examples, credential handling and DB migration safety. Confirm no sensitive records in seeds or logs.
6. Fix only regressions within a declared ownership window; document other issues as tasks. Update `PROGRESS.md`, export an auditable test report and name incomplete external vendor integration tests separately.

End with a release recommendation explicitly conditional on actual tests and operational policy decisions. Do not call a demo production-ready just because it boots.
