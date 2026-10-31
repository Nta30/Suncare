# SECOND PROMPT — Backend scaffold (T01 only; no feature implementation)

Act as Suncare backend architect. Read root AGENTS, backend/AGENTS, T00 audit, ARCHITECTURE and task T01.

Goal: establish the **actual buildable backend structure**, preserving existing user code. Frontend task T02 has a different owner and prompt.

This prompt owns **T01 backend only**, not T02. Complete it, test it and STOP. The frontend has a separate prompt `prompts/01B_FRONTEND_SCAFFOLD.md`.

T01 backend:
- Inspect existing `backend/`; if a viable project exists, improve it incrementally rather than re-initializing. For a new backend, create Java 21 / Maven Wrapper / current supported Spring Boot version compatible with SQL Server and documented dependencies. Use **Spring Web MVC** REST (NOT reactive WebFlux), Spring Security, Validation, data access, MS SQL JDBC, tests. Choose and record versions; do not copy an example petclinic application.
- Start the package `com.suncare` with minimal `SuncareApplication`, shared config, DTO/error/ProblemDetail handler, `/api/v1/health` (no patient data), actuator readiness only if configured, `.env.example` / `application-local.yml` with placeholders, Maven test structure.
- Respect current SQL Server scripts; `ddl-auto=validate` in DB-ready configuration; do not run create/update or change SQL to match Java. If no DB connection, make the build/tests independent of production DB or mark specific tests pending, do not misreport them.
- Make Windows `mvnw.cmd` and UNIX `./mvnw` build commands available. Do not scaffold 58 entities, auth production flow, booking, invoices or MoMo.
- Run Maven compile/test if possible. Report exact results and finish T01, no assumptions.

Finish by reporting the exact backend folder tree, dependencies/commands, tests actually run, env blockers, and next single task T02. Update PROGRESS. **No frontend edits or business APIs. STOP.**
