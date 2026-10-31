# CONTRACT FIRST — one bounded task

Target task: [TASK_ID]. Read its prerequisites and source docs; use `.agents/skills/suncare-feature-delivery/SKILL.md` where available.

Before coding the task, write or update a small `docs/contracts/<feature>.md` or OpenAPI spec covering ONLY the API endpoints this task owns. Do not edit shared OpenAPI in parallel with other workers.

For each endpoint, identify actor + permission + row/department scope, the exact DTO fields (and rejected client-forged fields), normal and negative responses, state-machine transitions, error codes, idempotency behavior, financial source/snapshot when relevant, and transaction/lock order. Map every endpoint to acceptance cases in docs/06.

Review contract against `docs/01`, `03`, `04`, `05`, `06` and existing DB DDL. Never invent a cancellation/rescheduling endpoint, general status setter, extra patient identity table or payment confirmation by frontend redirect.

Output the scoped contract, reconciliation issues and proposed FILES OWNED/PROTECTED. **Do not code any feature until the contract is internally consistent. Stop after contract review.**
