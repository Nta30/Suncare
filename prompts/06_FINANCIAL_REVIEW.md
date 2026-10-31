# PAYMENT / CONCURRENCY / CLS GUARD REVIEW (read-only by default)

Review the currently implemented Suncare booking, payment, invoice, CLS, expiry, refund domain code against `docs/01`, `04`, `05` and acceptance tests `docs/06`. Act as security/transaction reviewer, not feature implementer.

Audit with concrete file/line references and reproduce/test where possible:
- Online 20-minute reservation exclusive; fixed hold expiry of 300 seconds; confirmed payment created a booking only before expiry under the reservation lock.
- Callback verified cryptographically and against merchant/request/amount/currency/status; duplicate/delayed/out-of-order callbacks cannot duplicate Payment, Allocation, Appointment or Encounter. Frontend redirects never authorize payment.
- Onsite physician fair capacity ratio and low-contention lock ordering; two concurrent requests for last slot cannot both win.
- Invoice snapshots immutable; issued total and cancelled lines retained; only one examination charge, supplemental invoice excludes duplicate fee; exact decimal amounts, allocations and refund bounds.
- CLS expiry first fully paid at + 10 days (default), status guards before start, deferral returns to same Order/Encounter and does not extend expiry; concurrency with expiry job.
- Results versioning immutable; completing Encounter requires finalized diagnosis, current result reviews, no outstanding charge, no draft prescription.
- Authorization and audit: row-level doctor/department/patient rights, no leaked secrets or medical image URLs.

Produce severity-ranked findings: ERROR (must fix), RISK, IMPROVEMENT. Include missing AT cases, precise test commands/outcomes and suggested task ownership. **Do not rewrite SQL or fix unrelated files unless explicitly asked in a follow-up.**
