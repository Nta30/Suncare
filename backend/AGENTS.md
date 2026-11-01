# Backend — Suncare

Read root `AGENTS.md` and the task's sections of docs 03–06 before touching backend code.

- Java 21; Spring Boot with **Spring Web MVC**, Spring Security, Bean Validation, Spring Data JPA for ordinary persistence, and explicit JDBC/SQL where SQL Server lock semantics require it. Use Maven Wrapper if available. Prefer modular monolith packages by domain under `vn.suncare` (common, infrastructure, security, identity, catalog, scheduling, booking, encounter, clinical, billing, refund, reporting, files, video).
- Each domain owns `api` (controller + request/response DTO), `application` (commands/services), `persistence` (entity/repository) as appropriate; put cross-domain policy orchestration in application services, not controllers.
- Do NOT use `spring.jpa.hibernate.ddl-auto=create`, `update` or `create-drop`. Use `validate` once the database is ready; avoid altering the 58-table SQL schema just to accommodate entity mappings. Map features incrementally.
- Never write money as `double`, never use enum `ORDINAL`, never compute business codes via MAX(id)+1. SQL Server rowversion and datetime2(3) require explicit mapping/testing; updated_at on UPDATE must be handled.
- Use constructor injection, no field injection; DTO validation at boundaries, ProblemDetail/error envelope and a central exception handler. Server-side pagination and filtering. Document APIs in OpenAPI, avoid leaking sensitive fields.
- Security requires both action permission and ownership/assignment. Role unions do not imply cross-department access. Disabled/locked users or revoked roles must be rejected at the next request. Authentication choice (cookie+CSRF or token) must be documented and tested.
- Domain transitions must be explicit commands with guards and event/audit records; no general PATCH status mutation. Use `@Transactional`, correct SQL Server lock order, and idempotency for retried commands.
- Payments: verify MoMo signatures and all authoritative attributes according to current provider docs before applying; frontend return/QR is not proof; duplicate callbacks create at most one Payment, Allocation and booking. No fake live payment.
- CLS results and issued documents are immutable; payment/refund/allocation/event records append-only; no cascaded deletion of clinical or financial history.
- Test with JUnit, MockMvc and SQL Server-backed integration/concurrency tests where applicable. H2 tests do NOT certify SQL Server filtered indexes, rowversion or locking. Document environment prerequisites if unavailable.
- Run `./mvnw test` or `mvnw.cmd test` (Windows) after relevant work, plus `verify` when feasible; provide precise outcome.
