# Domain gates, derived from Suncare source documents

- Auth and role assignment: public registration cannot choose DOCTOR/STAFF/ADMIN. Account Patient/Staff XOR. Roles + record scope enforced server-side.
- Schedule: overlap prohibited; onsite cannot select doctor; capacity and min ratio locked at DB level. Online 20min slot claimed by one active SlotReservation.
- Hold: fixed 300sec from created_at; successful verified payment **before expiry** and reservation ownership create booking atomically; late/duplicate callback never resurrects a cancelled/expired hold.
- Payment: no float math; no double charge or allocation; keep issued invoice snapshots and cancelled lines, refund only actual collected money, manual refund audit.
- CLS: order expiry from first full payment, no deadline extension on deferral, return to same order/encounter; start before expiry allowed to finish later. Results published immutable.
- Doctor: only assigned clinician may diagnose/review/prescribe/complete, subject to outstanding charge, result review and final diagnosis requirements.
- No full AT01–AT49 certification without runtime tests that exercise each claim. For race conditions, require two independent SQL Server connections.

Primary verification source: `docs/05-giao-dich-rang-buoc.md` and `docs/06-bao-cao-kiem-chung.md`.
