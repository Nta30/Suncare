# Operational decisions to confirm (do not guess)

From `docs/01-nghiep-vu.md` points-open section:

- Morning/afternoon actual hours, doctor/room capacity and real prices must be configured rather than invented.
- Onsite no-show handling, emergency doctor absence and reassignment when bookings exist need an owner decision.
- Refund executor/approver/payment channel is provisional for v1 (Cashier per document) and must be approved before live manual payouts.
- MoMo merchant/sandbox credentials and signed callback contract, video vendor, Cloudinary access mode, data retention and QR validity are not specified.
- Clinician notification/clinical handling after a result correction on a completed Encounter remain unresolved.

For each issue: record `decision`, `owner`, `approved_date`, `affected_tasks` and `fallback_when_unresolved`. A temporary dev stub must never be represented as a production integration.
