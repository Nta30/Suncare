-- Constraint-level smoke test only, not the backend business acceptance suite.
-- All test records are rolled back. Run after 01, 02 and 03.
SET NOCOUNT ON;
SET QUOTED_IDENTIFIER ON;
SET ANSI_NULLS ON;
SET ANSI_WARNINGS ON;
SET ANSI_PADDING ON;
SET ARITHABORT ON;
SET CONCAT_NULL_YIELDS_NULL ON;
SET NUMERIC_ROUNDABORT OFF;
SET XACT_ABORT OFF;
BEGIN TRY
BEGIN TRANSACTION;
DECLARE @patient bigint,@staff bigint,@account bigint,@department bigint,@service bigint,
        @schedule bigint,@assignment bigint,@slot bigint,@encounter bigint,@appointment bigint,
        @order bigint,@invoice bigint,@line bigint,@pay1 bigint,@pay2 bigint,@hit bit;
DECLARE @now datetime2(3)=SYSUTCDATETIME();
INSERT dbo.Patient(code,full_name,sex) VALUES('TEST-P',N'Bệnh nhân kiểm thử','UNKNOWN');
SET @patient=SCOPE_IDENTITY();
INSERT dbo.Staff(code,full_name,sex) VALUES('TEST-S',N'Bác sĩ kiểm thử','UNKNOWN');
SET @staff=SCOPE_IDENTITY();
INSERT dbo.Account(login_name,password_hash,account_type,staff_id,status)
VALUES('test-staff','NOT_A_REAL_PASSWORD_HASH','STAFF',@staff,'ACTIVE');
SET @account=SCOPE_IDENTITY();

SET @hit=0;
BEGIN TRY
    UPDATE dbo.Account SET patient_id=@patient WHERE id=@account;
END TRY BEGIN CATCH
    IF ERROR_NUMBER()<>547 THROW;
    SET @hit=1;
END CATCH;
IF @hit=0 THROW 52001,'Account XOR constraint did not reject both profiles.',1;

SET @hit=0;
BEGIN TRY
    UPDATE dbo.Patient SET avatar_public_id='orphan-without-url' WHERE id=@patient;
END TRY BEGIN CATCH
    IF ERROR_NUMBER()<>547 THROW;
    SET @hit=1;
END CATCH;
IF @hit=0 THROW 52002,'Avatar URL/public_id constraint failed.',1;

INSERT dbo.Department(code,name,department_type) VALUES('TEST-D',N'Khoa kiểm thử','CLINICAL');
SET @department=SCOPE_IDENTITY();
INSERT dbo.Service(code,name,service_type,result_type) VALUES('TEST-CLS',N'CLS kiểm thử','CLS','LAB');
SET @service=SCOPE_IDENTITY();
INSERT dbo.WorkSchedule(department_id,period_start,period_end,status)
VALUES(@department,CONVERT(date,@now),CONVERT(date,@now),'DRAFT');
SET @schedule=SCOPE_IDENTITY();
DECLARE @specialty bigint;
INSERT dbo.Specialty(code,name) VALUES('TEST-SP',N'Chuyên khoa kiểm thử');
SET @specialty=SCOPE_IDENTITY();
INSERT dbo.WorkAssignment(schedule_id,staff_id,specialty_id,work_date,mode,starts_at,ends_at)
VALUES(@schedule,@staff,@specialty,CONVERT(date,@now),'ONLINE',@now,DATEADD(HOUR,1,@now));
SET @assignment=SCOPE_IDENTITY();
SET @hit=0;
BEGIN TRY
    INSERT dbo.OnlineSlot(assignment_id,starts_at,ends_at)
    VALUES(@assignment,@now,DATEADD(MINUTE,15,@now));
END TRY BEGIN CATCH
    IF ERROR_NUMBER()<>547 THROW;
    SET @hit=1;
END CATCH;
IF @hit=0 THROW 52003,'Online slot must be exactly 20 minutes.',1;
INSERT dbo.OnlineSlot(assignment_id,starts_at,ends_at)
VALUES(@assignment,@now,DATEADD(MINUTE,20,@now));
SET @slot=SCOPE_IDENTITY();
DECLARE @examService bigint,@examPrice bigint,@clsPrice bigint,@hold bigint;
INSERT dbo.Service(code,name,service_type) VALUES('TEST-EXAM',N'Khám kiểm thử','EXAMINATION');
SET @examService=SCOPE_IDENTITY();
INSERT dbo.ServicePrice(service_id,doctor_id,visit_mode,amount,valid_from,created_by)
VALUES(@examService,@staff,'ONLINE',100000,@now,@account);
SET @examPrice=SCOPE_IDENTITY();
INSERT dbo.ServicePrice(service_id,amount,valid_from,created_by)
VALUES(@service,150000,@now,@account);
SET @clsPrice=SCOPE_IDENTITY();
INSERT dbo.BookingHold(code,patient_id,slot_id,price_id,quoted_amount,status,created_at,expires_at,confirmed_at,idempotency_key)
VALUES('TEST-H',@patient,@slot,@examPrice,100000,'CONFIRMED',@now,DATEADD(MINUTE,5,@now),@now,'test-hold-key');
SET @hold=SCOPE_IDENTITY();
INSERT dbo.SlotReservation(slot_id,hold_id) VALUES(@slot,@hold);
INSERT dbo.Appointment(code,patient_id,doctor_id,department_id,specialty_id,visit_mode,
 online_slot_id,hold_id,price_id,examination_amount,status,booked_at)
VALUES('TEST-A',@patient,@staff,@department,@specialty,'ONLINE',@slot,@hold,@examPrice,100000,'BOOKED',@now);
SET @appointment=SCOPE_IDENTITY();
INSERT dbo.Encounter(code,appointment_id,status) VALUES('TEST-E',@appointment,'IN_PROGRESS');
SET @encounter=SCOPE_IDENTITY();
INSERT dbo.ClinicalOrder(code,encounter_id,service_id,performing_department_id,ordered_by,indication,status,
 fully_paid_at,validity_days,expires_at)
VALUES('TEST-O',@encounter,@service,@department,@account,N'Kiểm thử','READY',@now,10,DATEADD(DAY,10,@now));
SET @order=SCOPE_IDENTITY();
SET @hit=0;
BEGIN TRY
    UPDATE dbo.ClinicalOrder SET started_at=expires_at WHERE id=@order;
END TRY BEGIN CATCH
    IF ERROR_NUMBER()<>547 THROW;
    SET @hit=1;
END CATCH;
IF @hit=0 THROW 52004,'Start at exact expiry must be rejected.',1;
DECLARE @room bigint;
INSERT dbo.Room(code,department_id,name,room_type) VALUES('TEST-R',@department,N'Lab kiểm thử','LAB');
SET @room=SCOPE_IDENTITY();
INSERT dbo.ClinicalQueueEntry(order_id,room_id,checked_in_by,checked_in_at,status)
VALUES(@order,@room,@account,@now,'WAITING');
UPDATE dbo.ClinicalQueueEntry SET status='DEFERRED',closed_at=@now WHERE order_id=@order;
-- A return visit must be allowed, not blocked by unconditional UNIQUE(order_id).
INSERT dbo.ClinicalQueueEntry(order_id,room_id,checked_in_by,checked_in_at,status)
VALUES(@order,@room,@account,@now,'WAITING');
SET @hit=0;
BEGIN TRY
    INSERT dbo.ClinicalQueueEntry(order_id,room_id,checked_in_by,checked_in_at,status)
    VALUES(@order,@room,@account,@now,'WAITING');
END TRY BEGIN CATCH
    IF ERROR_NUMBER() NOT IN (2601,2627) THROW;
    SET @hit=1;
END CATCH;
IF @hit=0 THROW 52005,'Multiple active queue entries must be rejected.',1;

INSERT dbo.Invoice(code,patient_id,encounter_id,status,issued_by,issuer_type,issued_at,
 patient_name_snapshot,facility_name_snapshot,facility_address_snapshot,total_amount,currency)
VALUES('TEST-I',@patient,@encounter,'ISSUED',@account,'STAFF',@now,N'Kiểm thử',N'Suncare',N'Địa chỉ kiểm thử',150000,'VND');
SET @invoice=SCOPE_IDENTITY();
INSERT dbo.InvoiceLine(invoice_id,line_no,order_id,line_type,service_id,price_id,service_name,
 unit_name,quantity,unit_price,amount,status)
VALUES(@invoice,1,@order,'CLS',@service,@clsPrice,N'CLS kiểm thử',N'Lần',1,150000,150000,'ACTIVE');
SET @line=SCOPE_IDENTITY();
-- Multiple cash receipts on one invoice must not collide on NULL provider ref.
INSERT dbo.Payment(code,invoice_id,method,amount,currency,status,paid_at,confirmed_by,idempotency_key)
VALUES('TEST-PAY1',@invoice,'CASH',50000,'VND','CONFIRMED',@now,@account,'test-pay-1');
SET @pay1=SCOPE_IDENTITY();
INSERT dbo.Payment(code,invoice_id,method,amount,currency,status,paid_at,confirmed_by,idempotency_key)
VALUES('TEST-PAY2',@invoice,'CASH',100000,'VND','CONFIRMED',@now,@account,'test-pay-2');
SET @pay2=SCOPE_IDENTITY();
INSERT dbo.PaymentAllocation(payment_id,invoice_line_id,amount) VALUES(@pay1,@line,50000),(@pay2,@line,100000);
IF NOT EXISTS(SELECT 1 FROM dbo.v_InvoiceSummary WHERE invoice_id=@invoice AND outstanding=0 AND received_amount=150000 AND gross_amount=150000)
    THROW 52006,'Invoice aggregation duplicates or miscalculates receipts.',1;
UPDATE dbo.InvoiceLine SET status='CANCELLED',cancelled_at=@now,cancel_reason='ORDER_EXPIRED' WHERE id=@line;
IF NOT EXISTS(SELECT 1 FROM dbo.v_InvoiceSummary WHERE invoice_id=@invoice AND outstanding=0 AND cancelled_amount=150000 AND total_amount=150000)
    THROW 52007,'Cancellation must clear charge while preserving original amount.',1;
IF (SELECT COUNT(*) FROM dbo.v_EncounterReport WHERE encounter_id=@encounter)<>1
    THROW 52008,'Encounter report grain must be one encounter.',1;
IF (SELECT COUNT(*) FROM dbo.[Role])<>6 OR (SELECT COUNT(*) FROM dbo.Permission)<>20
    THROW 52009,'RBAC seed is incomplete or not repeatable.',1;
ROLLBACK TRANSACTION;
PRINT 'PASS: constraint and reporting smoke tests; test data rolled back.';
END TRY
BEGIN CATCH
    IF XACT_STATE()<>0 ROLLBACK TRANSACTION;
    THROW;
END CATCH;
