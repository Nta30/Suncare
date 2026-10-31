# Database — protected existing assets

`database/00_create_database.sql`, `01_schema.sql`, `02_seed_rbac.sql`, `03_reporting_views.sql`, `04_smoke_test.sql`, `build-schema.mjs` and `validate.ps1` were provided as the reviewed baseline. Do not regenerate, format or overwrite without a dedicated approved schema task and a reviewable diff.

- SQL Server 2019+ is authoritative; no Hibernate DDL generation, no H2 substitute for real DB verification.
- Use `database/README.md` run order. Never execute schema scripts against a populated DB, since the initial script expects an empty DB. No destructive database commands without explicit authorization.
- Propose new DB changes as separately numbered migrations, dependency/rollback/compatibility reviewed, preserving original scripts for provenance. Do not run generators in routine backend tasks.
- Always report whether SQL validation was *actually* run and on which type of environment. Do not fabricate AT01–AT49 coverage from smoke tests alone.
