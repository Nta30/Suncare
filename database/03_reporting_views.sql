-- Views aggregate each child before joining to avoid multiplying amounts.
-- These views do NOT implement user authorization. Backend must apply row scope.
SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO
CREATE OR ALTER VIEW dbo.v_InvoiceLineBalance
AS
WITH Allocated AS (
    SELECT invoice_line_id,SUM(amount) allocated_amount
    FROM dbo.PaymentAllocation GROUP BY invoice_line_id
), Returned AS (
    SELECT pa.invoice_line_id,SUM(r.amount) refunded_amount
    FROM dbo.Refund r
    JOIN dbo.RefundRequest rr ON rr.id=r.request_id
    JOIN dbo.PaymentAllocation pa ON pa.id=rr.allocation_id
    GROUP BY pa.invoice_line_id
)
SELECT il.id invoice_line_id,il.invoice_id,il.order_id,il.line_type,il.status,
    il.amount original_amount,
    CASE WHEN il.status='ACTIVE' THEN il.amount ELSE CAST(0 AS decimal(19,0)) END net_charge,
    COALESCE(a.allocated_amount,0) allocated_amount,
    COALESCE(r.refunded_amount,0) refunded_amount,
    COALESCE(a.allocated_amount,0)-COALESCE(r.refunded_amount,0) net_allocated,
    CASE WHEN il.status='CANCELLED' THEN CAST(0 AS decimal(19,0))
         WHEN il.amount-COALESCE(a.allocated_amount,0)+COALESCE(r.refunded_amount,0)>0
         THEN il.amount-COALESCE(a.allocated_amount,0)+COALESCE(r.refunded_amount,0)
         ELSE CAST(0 AS decimal(19,0)) END outstanding
FROM dbo.InvoiceLine il
LEFT JOIN Allocated a ON a.invoice_line_id=il.id
LEFT JOIN Returned r ON r.invoice_line_id=il.id;
GO
CREATE OR ALTER VIEW dbo.v_InvoiceSummary
AS
WITH Lines AS (
    SELECT invoice_id,SUM(original_amount) gross_amount,
        SUM(CASE WHEN status='CANCELLED' THEN original_amount ELSE 0 END) cancelled_amount,
        SUM(net_charge) net_charge,SUM(allocated_amount) allocated_amount,
        SUM(outstanding) outstanding
    FROM dbo.v_InvoiceLineBalance GROUP BY invoice_id
), Receipts AS (
    SELECT invoice_id,SUM(amount) received_amount FROM dbo.Payment GROUP BY invoice_id
), Returns AS (
    SELECT p.invoice_id,SUM(r.amount) refunded_amount
    FROM dbo.Payment p JOIN dbo.RefundRequest rr ON rr.payment_id=p.id
    JOIN dbo.Refund r ON r.request_id=rr.id GROUP BY p.invoice_id
)
SELECT i.id invoice_id,i.code invoice_code,i.patient_id,p.code patient_code,
    COALESCE(i.encounter_id,e.id) encounter_id,i.hold_id,i.status,i.issued_at,
    i.total_amount,COALESCE(l.gross_amount,0) gross_amount,
    COALESCE(l.cancelled_amount,0) cancelled_amount,COALESCE(l.net_charge,0) net_charge,
    COALESCE(l.allocated_amount,0) allocated_amount,COALESCE(rc.received_amount,0) received_amount,
    COALESCE(rt.refunded_amount,0) refunded_amount,
    COALESCE(rc.received_amount,0)-COALESCE(rt.refunded_amount,0) net_received,
    COALESCE(l.outstanding,0) outstanding
FROM dbo.Invoice i JOIN dbo.Patient p ON p.id=i.patient_id
LEFT JOIN dbo.Appointment a ON a.hold_id=i.hold_id
LEFT JOIN dbo.Encounter e ON e.appointment_id=a.id
LEFT JOIN Lines l ON l.invoice_id=i.id
LEFT JOIN Receipts rc ON rc.invoice_id=i.id
LEFT JOIN Returns rt ON rt.invoice_id=i.id;
GO
CREATE OR ALTER VIEW dbo.v_EncounterReport
AS
SELECT e.id encounter_id,e.code encounter_code,a.id appointment_id,a.code appointment_code,
    a.patient_id,p.code patient_code,a.doctor_id,s.code doctor_code,
    a.department_id,a.specialty_id,a.visit_mode,a.status appointment_status,e.status encounter_status,
    COALESCE(wa.work_date,CONVERT(date,DATEADD(HOUR,7,os.starts_at))) service_date,
    wa.shift_id,os.starts_at slot_start,e.started_at,e.completed_at
FROM dbo.Encounter e JOIN dbo.Appointment a ON a.id=e.appointment_id
JOIN dbo.Patient p ON p.id=a.patient_id JOIN dbo.Staff s ON s.id=a.doctor_id
LEFT JOIN dbo.WorkAssignment wa ON wa.id=a.onsite_assignment_id
LEFT JOIN dbo.OnlineSlot os ON os.id=a.online_slot_id;
GO
CREATE OR ALTER VIEW dbo.v_DeferredClinicalOrder
AS
SELECT o.id order_id,o.code order_code,o.encounter_id,a.patient_id,a.doctor_id,
    o.performing_department_id,o.service_id,o.status,o.fully_paid_at,o.expires_at,
    DATEDIFF_BIG(SECOND,SYSUTCDATETIME(),o.expires_at) remaining_seconds,
    CASE WHEN o.expires_at<=SYSUTCDATETIME() THEN 'EXPIRED'
         WHEN o.expires_at<=DATEADD(HOUR,24,SYSUTCDATETIME()) THEN 'EXPIRING_SOON'
         ELSE 'VALID' END validity_status,
    q.checked_in_at last_checkin_at,q.status last_queue_status
FROM dbo.ClinicalOrder o JOIN dbo.Encounter e ON e.id=o.encounter_id
JOIN dbo.Appointment a ON a.id=e.appointment_id
OUTER APPLY (SELECT TOP (1) checked_in_at,status FROM dbo.ClinicalQueueEntry
             WHERE order_id=o.id ORDER BY checked_in_at DESC,id DESC) q
WHERE o.fully_paid_at IS NOT NULL AND o.started_at IS NULL AND o.status<>'COMPLETED';
GO
CREATE OR ALTER VIEW dbo.v_PendingRefund
AS
SELECT rr.id request_id,rr.code request_code,rr.payment_id,rr.reason,rr.status,
    rr.requested_at,rr.amount requested_amount,COALESCE(r.refunded_amount,0) refunded_amount,
    rr.amount-COALESCE(r.refunded_amount,0) remaining_amount
FROM dbo.RefundRequest rr
OUTER APPLY (SELECT SUM(amount) refunded_amount FROM dbo.Refund WHERE request_id=rr.id) r
WHERE rr.amount>COALESCE(r.refunded_amount,0);
GO
