# FIRST PROMPT — Audit Suncare and establish the implementation baseline

You are the technical lead + senior BA for Suncare. You are working inside the **existing Suncare Git repository**, not on a blank imaginary project.

**Mandatory inputs:** root/nested AGENTS.md; `docs/01-nghiep-vu.md` through `docs/06-bao-cao-kiem-chung.md`; `database/README.md`, 00–04 SQL, `database/build-schema.mjs`; `tasks/ROADMAP.md`. Read what is necessary carefully and reconcile evidence rather than assume.

Goal of **this** prompt: finish T00 only. Do not implement business logic, generate 58 JPA entities, run Spring Initializr, install deps, overwrite SQL scripts or modify the existing API/UI.

Procedure:
1. Inspect `pwd`, `git status --short`, repository directory tree, existing pom.xml/package.json/Vite/Tailwind configs, JDK/Java Maven Node/npm availability. Do not erase user modifications. If there is an existing project, describe what should be reused, not recreated.
2. Verify actual document presence and names; distinguish immutable existing SQL schema from documents; inspect schema table count/constraints, seed role/permission count and view count without claiming SQL Server execution. Identify any mismatch between docs vs DDL vs current code.
3. Propose a **modular monolith** structure for Java 21 + Spring MVC REST + Maven, React JavaScript/JSX + Vite + Tailwind v4, SQL Server. Explain where OpenAPI, DTOs, authorization, locking, integration adapters, tests, shared layouts and UI tokens live. Do not create a separate microservice for every actor.
4. Extract source-grounded invariants and open decisions into a small traceability matrix: business decision ID D01–D23, relevant TX01–TX11, table(s) and AT test IDs. Prioritize booking/concurrency, payment, Lab deferral/expiry, RBAC, clinical data access.
5. Create/update ONLY these docs: `docs/implementation/BASELINE_AUDIT.md`, `docs/implementation/ARCHITECTURE.md`, `docs/implementation/PROGRESS.md`. Do not rewrite the original six domain documents or SQL.
6. Review task dependencies and file ownership in `tasks/ROADMAP.md`; propose an amendment if necessary but do not silently broaden scope or start T01.
7. Output: exact files reviewed, findings sorted blocker/important/nice-to-have, selected scaffold strategy, tests actually performed, unresolved decisions, and the single next prompt `prompts/01_SCAFFOLD.md`.

If you see missing real SQL Server, MoMo credentials, video provider or unresolved operational policies, record each as a blocker to affected functionality; do not make up environment or claim features can already run. **STOP after T00.**
