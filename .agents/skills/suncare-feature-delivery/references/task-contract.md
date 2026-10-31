# Task contract

Before editing, specify: Task ID, Goal, Pre-req IDs, Docs/AT references, FILES OWNED, FILES READ-ONLY, API changes owned, implementation steps, negative/concurrency tests, commands and Done criteria.

- Avoid editing shared files across parallel branches (`pom.xml`, `package.json`, app router, security config, common DTOs, SQL source, OpenAPI) without a single named integrator.
- Full-stack tasks can own their *feature-specific* backend and frontend directories **after** API contract approval; shared integration edits are performed sequentially by the integrator.
- If scope is too large to verify in a day or more than one transaction boundary, split as Txx.a, Txx.b with explicit dependencies; never mark epic done because one form renders.
- Do not create placeholders that return HTTP 200 for unsupported clinical/financial actions.

## Handoff report

Task ID / Status; implemented behaviors; files changed; API changes; tests actually run and outcomes; unrun checks and environmental blockers; permission/state/lock audits; outstanding decisions; next task.
