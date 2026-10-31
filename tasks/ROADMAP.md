# Suncare task roadmap — one task at a time

**Status:** T00–T22 initially TODO. This is a work queue, NOT proof of implementation.

## Execution rules

- The task owner must declare the **files owned** and immutable **files protected** in a task contract (`tasks/TASK_TEMPLATE.md`). Restrict code changes to those areas; shared files need a single integrator.
- The backend REST/OpenAPI contract for a vertical slice is specified **before** its frontend; implement the rest of that slice after the contract is stable.
- An epic should be split into Txx.a/Txx.b if it cannot be tested independently, but no two subtasks may own the same behavior or files concurrently.
- SQL schema v1 and source docs are read-only outside dedicated approved change; do not delete or regenerate to resolve code compilation problems.
- Run one task in one Codex instruction/thread and stop after reporting; do not launch all tasks or assume any are completed.

## Ordered tasks with unique deliverables

| ID | Deliverable unique to task | Depends on | Main ownership (proposed) | Representative checks |
|---|---|---|---|---|
| T00 | Repository inventory, docs/SQL mismatch audit, architecture plan and gates (no feature code) | — | `docs/implementation/BASELINE_AUDIT.md`, `ARCHITECTURE.md`, `PROGRESS.md` | Source paths and open decisions reconciled |
| T01 | Backend Spring MVC / Maven / Java 21 skeleton, health/error infrastructure | T00 | `backend/pom.xml`, `backend/mvnw*`, `backend/src/**/common/**`, configs | Maven compile + isolated smoke endpoint |
| T02 | Frontend React JS/JSX + Vite + Tailwind v4 skeleton, base router and tooling | T00 | `frontend/package*.json`, `frontend/vite.config.js`, `frontend/src/app/**`, `frontend/src/index.css` | npm build + lint + base route |
| T03 | SQL Server connectivity, safe bootstrap/admin initialization plan, DB-backed test harness | T01 | `backend/src/**/infrastructure/db/**`, DB test config, ops docs; existing SQL **read-only** | 58 tables, 6 roles, 20 permissions; real SQLServer preflight |
| T04 | Backend authentication, registration, controlled staff account provisioning, RBAC + record scope | T03 | `backend/src/**/identity/**`, `backend/src/**/security/**` | AT01–AT03, unauthorized/locked/role-revoked |
| T05 | Distinct patient/staff layouts and design tokens; login, patient signup and protected routes | T02, T04 | `frontend/src/app/**` (exclusive T05 integration), `frontend/src/features/auth/**`, `frontend/src/components/**` | Keyboard/forms/errors, auth states |
| T06 | Admin organization/catalog/doctor specialty/service/price CRUD and safety checks | T04, T05 | `backend/src/**/catalog/**`, `frontend/src/features/admin/**` | Time-effective prices and immutable history AT38/48 |
| T07 | Head-scoped schedules, overlap checks, publication, onsite shifts and online assignment generation | T06 | `backend/src/**/scheduling/**`, `frontend/src/features/scheduling/**` | AT08, no overlap; row-scope, assignment capacity |
| T08 | Onsite booking, locked fair physician assignment, atomic Appointment+Encounter; patient screen | T07 | `backend/src/**/booking/onsite/**`, `frontend/src/features/booking/onsite/**` | AT04–AT06; no doctor/time picker |
| T09 | Shared financial ledger foundation: invoice snapshot, lines, allocation and balances, no issuer UI yet | T06, T08 | `backend/src/**/billing/core/**` | Calculation invariants; no duplicate charges |
| T10 | Online slot availability/doctor-choice interface and read-only availability API | T07 | `backend/src/**/booking/online/availability/**`, `frontend/src/features/booking/online/availability/**` | AT07, 20-minute display, no overlapping availability |
| T11 | Online BookingHold/SlotReservation, SYSTEM-issued hold invoice, payment-request intent | T09, T10 | `backend/src/**/booking/online/hold/**`, `frontend/src/features/booking/online/hold/**` | AT09–AT10; exact 300 sec, no Encounter before payment |
| T12 | MoMo gateway adapter, verified callback/reconciliation, late/duplicate payments + UI result state | T11 | `backend/src/**/billing/momo/**`, `frontend/src/features/booking/online/payment/**` | AT11–AT15, AT22; sandbox evidence required |
| T13 | Doctor encounter start, history snapshot, vitals/diagnosis and CLS order drafting | T08, T06 | `backend/src/**/encounter/**`, `backend/src/**/clinical/ordering/**`, `frontend/src/features/encounter/**` | Assigned doctor only; no arbitrary transitions |
| T14 | Issuing onsite/CLS/supplemental invoices, cash collection/partial allocation, printable internal invoice | T09, T13 | `backend/src/**/billing/invoicing/**`, `frontend/src/features/billing/**` | AT18–AT22, AT43, AT49 |
| T15 | Lab check-in, active queue, accept/start/defer/return service | T14, T07 | `backend/src/**/clinical/queue/**`, `frontend/src/features/lab/queue/**` | AT23–AT25, AT27–AT29 |
| T16 | ResultVersion, values/attachments metadata, publish/correct, doctor review; no Cloudinary transport yet | T15 | `backend/src/**/clinical/results/**`, `frontend/src/features/lab/results/**` | AT35–AT37; correction version immutable |
| T17 | Expire orders, cancel online at >=24h, cancel invoice lines, issue/execute manual refunds | T12, T14, T15 | `backend/src/**/billing/refunds/**`, `backend/src/**/clinical/expiry/**`, `frontend/src/features/refunds/**` | AT16–AT17, AT26–AT33, AT49; concurrency |
| T18 | Prescription, EMR read scoping and final Encounter completion with all guards | T13, T16, T17 | `backend/src/**/clinical/prescriptions/**`, `backend/src/**/clinical/emr/**`, `frontend/src/features/medical-records/**` | AT18, AT34, AT38; prescription optional |
| T19 | Cloudinary avatar and secure clinical media links/ResultAttachment authorization | T04, T16 | `backend/src/**/files/**`, `frontend/src/features/media/**` | AT46–AT47; no public medical URLs |
| T20 | Configurable video provider interface + participation history, doctor/patient UI | T12, T13 | `backend/src/**/video/**`, `frontend/src/features/video/**` | AT44; no automatic completion or recording |
| T21 | Scoped reports and safe CSV, accurate aggregate grain, dashboard screens | T14, T18 | `backend/src/**/reporting/**`, `frontend/src/features/reports/**` | AT39–AT42; no double counting/CSV formula injection |
| T22 | Cross-module E2E, 49 acceptance cases, security/race tests, final docs and deployment hygiene | T00–T21 | `backend/src/test/**`, `frontend/tests/**`, `.github/workflows/**`, `docs/implementation/**` | AT01–AT49 actually executed; failures and blocked cases listed |

## Parallelism policy

After T01–T05 and contracts are established, a backend worker can implement `backend/src/**/<feature>/**` while a frontend worker implements `frontend/src/features/<feature>/**` **only if** they have different file ownership and the same approved API contract. A read-only reviewer can inspect both. Avoid simultaneous changes to `AGENTS.md`, `pom.xml`, `package.json`, router/auth, schema or shared OpenAPI. For separate concurrently running Codex processes, use isolated Git branches/worktrees, then integrate sequentially.

## Product boundaries and known blockers

See `docs/implementation/OPEN_DECISIONS.md`. Unknown shift prices/hours must not be faked. Real MoMo, Cloudinary and video providers require external credentials and validated integration; these cannot be certified simply by unit tests. The 49 AT tests in `docs/06` span multiple tasks; T22 is an integration regression pass, not a license to defer all earlier tests.
