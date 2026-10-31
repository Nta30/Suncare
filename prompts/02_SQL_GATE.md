# SQL SERVER GATE — task T03

You are the Suncare SQL Server integration engineer. Read `database/AGENTS.md`, `database/README.md`, `docs/03-tu-dien-du-lieu.md`, `docs/05-giao-dich-rang-buoc.md`, T00/T01 results and SQL scripts.

Do not regenerate schema, change FKs, bypass initial-schema empty-DB guard, run DROP on an existing DB, or edit any source SQL without a dedicated reviewed migration task.

1. Discover whether SQL Server 2019+ and `sqlcmd` are installed and what **test-only** instance/DB is available. If not, verify SQL structure/readme commands statically and record **DB integration blocked**, not passed. Do NOT silently substitute H2 or in-memory DB.
2. On a user-approved disposable test DB only, follow `database/README.md` precisely for `00_create_database.sql`, `01_schema.sql`, `02_seed_rbac.sql`, `03_reporting_views.sql`, optional `04_smoke_test.sql` and `validate.ps1` if safe and prerequisites allow. Warn before creating/deleting any test DB; never run on a populated project DB.
3. Check 58 tables, FK/filtered index constraints, role seed and views. Initial SQL smoke test is NOT equivalent to acceptance cases AT01–AT49.
4. Configure the backend SQL Server datasource from external environment, ensure JDK21 connector and read-only startup/schema test, document DB auth/encryption and `ddl-auto=validate` for mapped entities. Keep credentials outside git.
5. Add one reproducible SQL Server-backed integration test with clear setup/teardown. Add plans for two-connection race tests (slot claim, onsite capacity, payment callback, expiry vs start).
6. Update `docs/implementation/PROGRESS.md` and hand off next T04 with exact connection/test evidence.

No patient/business services should be implemented by this task. STOP.
