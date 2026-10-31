# Task contract template (copy and fill for each Txx or Txx.a)

## Identity

- Task ID / Title:
- Status: TODO | IN_PROGRESS | BLOCKED | DONE
- Single owner / branch / worktree:
- Depends on:
- Input docs + exact sections / AT cases:

## File ownership

- FILES OWNED (exclusive to this task):
- FILES READ-ONLY / PROTECTED:
- Shared files requiring serialized integrator edit:
- APIs/DTOs this task **owns** (not merely consumes):

## Delivery

- User-visible behavior and state transitions:
- Permissions + row/department scope:
- Input/output and error semantics:
- SQL transaction, lock order and idempotency strategy:
- Negative, concurrency and re-entry cases:
- Backend/frontend/test steps:

## Definition of Done

- [ ] Relevant source rules cited, no contradictions or silent redefinitions
- [ ] Only owned files changed (or authorized integrator edit documented)
- [ ] API contract updated/verified
- [ ] Unit, integration, SQL Server and browser tests run as applicable
- [ ] Security/ownership and error states tested
- [ ] Actual commands and pass/fail/logs recorded
- [ ] `docs/implementation/PROGRESS.md` updated; handoff complete

## Blocked external requirements / decisions

Record real blockers with specific impact; no fake passing tests.
