// Generate the initial SQL Server migration from the reviewed data dictionary.
// Run: node database/build-schema.mjs (Node.js built-ins only).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const dir = path.dirname(fileURLToPath(import.meta.url));
const dictionary = fs.readFileSync(path.join(dir, '../docs/03-tu-dien-du-lieu.md'), 'utf8');
const tables = new Map();
for (const match of dictionary.matchAll(/^\| ([A-Za-z][A-Za-z0-9]+) \| (.+) \|$/gm)) {
  const [ , name, text] = match;
  const columns = [];
  for (const segment of text.split(';')) {
    const m = segment.trim().match(/^([a-z][a-z0-9_]*)(\?)?\s+(.+)$/);
    if (!m) continue;
    const [, col, optional, spec] = m;
    const fk = spec.match(/^→ (\w+)/)?.[1];
    const typed = spec.match(/^(?:n?varchar\((?:\d+|max)\)|char\(\d+\)|decimal\(\d+,\d+\)|datetime2\(3\)|time\(0\)|date\b|bigint\b|smallint\b|int\b|bit\b)/)?.[0];
    const enums = spec.match(/^([A-Z][A-Z_]*(?:\/[A-Z][A-Z_]*)+)/)?.[1].split('/');
    const type = fk ? 'bigint' : typed ?? (col === 'code' ? 'varchar(40)' : enums || /^[A-Z_]+$/.test(spec) ? 'varchar(32)' : null);
    if (!type && /[^\x00-\x7F]/.test(spec)) continue; // Vietnamese prose following the column list.
    if (!type) throw new Error(`Unrecognized ${name}.${col}: ${spec}`);
    columns.push({name:col, nullable:!!optional, type, fk, enums,
      unique:/\bUQ\b/.test(spec.split('.')[0]) && !spec.split('.')[0].includes('UQ('), spec});
  }
  const compositePK = text.match(/PK\(([^)]+)\)/)?.[1].split(',').map(x=>x.trim());
  const uniques = [...text.matchAll(/(?<!Filtered )\bUQ\(([^)]+)\)/g)].map(m=>m[1].split(',').map(x=>x.trim()));
  tables.set(name, {name,columns, compositePK, uniques});
}
if (tables.size !== 58) throw new Error(`Expected 58 tables, got ${tables.size}`);
for (const t of tables.values()) {
  if (!t.compositePK) t.columns.unshift({name:'id',type:'bigint',identity:true,nullable:false});
  t.columns.push({name:'created_at',type:'datetime2(3)',nullable:false,default:'SYSUTCDATETIME()'});
  const immutable = ['AppointmentEvent','EncounterEvent','ClinicalOrderEvent','ClinicalReview','EncounterHistorySnapshot','PaymentEvent','Payment','PaymentAllocation','Refund','CommandReceipt','AuditEvent','ResultAttachment'];
  if (!immutable.includes(t.name)) t.columns.push(
    {name:'updated_at',type:'datetime2(3)',nullable:false,default:'SYSUTCDATETIME()'},
    {name:'version',type:'rowversion',nullable:false});
  for(const c of t.columns) {
    if(c.fk && !tables.has(c.fk)) throw new Error(`Missing FK ${c.fk}`);
    if(c.name === 'is_active' || c.name==='is_open' || c.name==='is_primary') c.default='1';
  }
}
const q=x=>`[${x}]`;
const list=xs=>xs.map(q).join(', ');
const statements=[];
const add=s=>statements.push(s);
add(`-- Suncare initial schema. SQL Server 2019+; generated from docs/03-tu-dien-du-lieu.md.
-- Run in an EMPTY database. No DROP/DELETE, no real credentials or patient data.
-- Business transactions/authorization described in docs/05 remain backend responsibilities.
SET NOCOUNT ON;
SET XACT_ABORT ON;
SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
SET ANSI_PADDING ON;
SET ANSI_WARNINGS ON;
SET CONCAT_NULL_YIELDS_NULL ON;
SET ARITHABORT ON;
SET NUMERIC_ROUNDABORT OFF;
IF DB_NAME() IN (N'master', N'model', N'msdb', N'tempdb')
    THROW 51000, 'Select an empty application database first.', 1;
IF EXISTS (SELECT 1 FROM sys.tables WHERE is_ms_shipped = 0)
    THROW 51001, 'Initial migration requires an empty database; no existing tables were changed.', 1;
BEGIN TRY
BEGIN TRANSACTION;`);
const checks=[];
const check=(t,suffix,expression)=>checks.push(`ALTER TABLE [dbo].${q(t)} ADD CONSTRAINT ${q('CK_'+t+'_'+suffix)} CHECK (${expression});`);
for (const t of tables.values()) {
  const defs=t.columns.map(c=>`    ${q(c.name)} ${c.type}${c.identity?' IDENTITY(1,1)':''}${c.type==='rowversion'?'':c.nullable?' NULL':' NOT NULL'}${c.default?` CONSTRAINT ${q('DF_'+t.name+'_'+c.name)} DEFAULT (${c.default})`:''}`);
  defs.push(`    CONSTRAINT ${q('PK_'+t.name)} PRIMARY KEY (${list(t.compositePK ?? ['id'])})`);
  add(`CREATE TABLE [dbo].${q(t.name)} (\n${defs.join(',\n')}\n);`);
  for(const c of t.columns) {
    if(c.enums) check(t.name,c.name,`${q(c.name)} IN (${c.enums.map(x=>`'${x}'`).join(',')})`);
    if(c.name==='code' && t.name !=='ServiceAnalyte') c.unique=true;
    if(c.unique) add(`CREATE UNIQUE INDEX ${q('UX_'+t.name+'_'+c.name)} ON [dbo].${q(t.name)} (${q(c.name)})${c.nullable?` WHERE ${q(c.name)} IS NOT NULL`:''};`);
    if(c.name==='currency') check(t.name,c.name,`${q(c.name)} = 'VND'`);
    if(['amount','unit_price','quoted_amount','examination_amount','quantity','duration_days','validity_days','capacity','line_no','version_no'].includes(c.name)) check(t.name,c.name+'_positive',`${q(c.name)} > 0`);
    if(c.name==='total_amount') check(t.name,'total_nonnegative','[total_amount] >= 0');
  }
  for(const cols of t.uniques) {
    for(const col of cols) if(!t.columns.some(c=>c.name===col)) throw new Error(`Bad unique ${t.name}.${col}`);
    add(`CREATE UNIQUE INDEX ${q('UX_'+t.name+'_'+cols.join('_'))} ON [dbo].${q(t.name)} (${list(cols)});`);
  }
}
// Foreign keys added after every table exists, including forward/self references.
for(const t of tables.values()) for(const c of t.columns) if(c.fk) {
  add(`ALTER TABLE [dbo].${q(t.name)} ADD CONSTRAINT ${q('FK_'+t.name+'_'+c.name)} FOREIGN KEY (${q(c.name)}) REFERENCES [dbo].${q(c.fk)} ([id]);`);
  if(!c.unique && !t.compositePK?.includes(c.name)) add(`CREATE INDEX ${q('IX_'+t.name+'_'+c.name)} ON [dbo].${q(t.name)} (${q(c.name)});`);
}
check('Account','profile',`([account_type]='PATIENT' AND [patient_id] IS NOT NULL AND [staff_id] IS NULL) OR ([account_type]='STAFF' AND [staff_id] IS NOT NULL AND [patient_id] IS NULL)`);
check('Account','type',`[account_type] IN ('PATIENT','STAFF')`);
check('Account','login',`LEN(LTRIM(RTRIM([login_name]))) > 0 AND DATALENGTH([login_name])=DATALENGTH(LTRIM(RTRIM([login_name])))`);
check('Role','type',`[account_type] IN ('PATIENT','STAFF')`);
check('Role','code',`[code] IN ('PATIENT','DOCTOR','LAB_STAFF','DEPARTMENT_HEAD','CASHIER','SYSTEM_ADMIN')`);
check('ShiftDefinition','code',`[code] IN ('MORNING','AFTERNOON')`);
check('Patient','avatar',`([avatar_url] IS NULL AND [avatar_public_id] IS NULL) OR ([avatar_url] IS NOT NULL AND [avatar_url] LIKE N'https://%' AND [avatar_public_id] IS NOT NULL)`);
check('Staff','avatar',`([avatar_url] IS NULL AND [avatar_public_id] IS NULL) OR ([avatar_url] IS NOT NULL AND [avatar_url] LIKE N'https://%' AND [avatar_public_id] IS NOT NULL)`);
check('Staff','sex',`[sex] IN ('UNKNOWN','MALE','FEMALE','OTHER')`);
check('Patient','sex',`[sex] IN ('UNKNOWN','MALE','FEMALE','OTHER')`);
for(const t of ['StaffDepartment','DepartmentHeadAssignment','ServicePrice']) check(t,'range',`[valid_to] IS NULL OR [valid_to]>[valid_from]`);
check('ShiftDefinition','range',`[local_end]>[local_start]`);
check('WorkSchedule','range',`[period_end]>=[period_start]`);
check('WorkSchedule','publication',`([status]='DRAFT' AND [published_at] IS NULL AND [published_by] IS NULL) OR ([status]='PUBLISHED' AND [published_at] IS NOT NULL AND [published_by] IS NOT NULL)`);
check('WorkAssignment','range',`[ends_at]>[starts_at]`);
check('WorkAssignment','shape',`([mode]='ONSITE' AND [room_id] IS NOT NULL AND [specialty_id] IS NOT NULL AND [shift_id] IS NOT NULL AND [capacity] IS NOT NULL) OR ([mode]='ONLINE' AND [specialty_id] IS NOT NULL AND [room_id] IS NULL AND [shift_id] IS NULL AND [capacity] IS NULL) OR ([mode]='LAB' AND [room_id] IS NOT NULL AND [capacity] IS NULL)`);
check('OnlineSlot','duration',`[ends_at]=DATEADD(MINUTE,20,[starts_at])`);
check('BookingHold','duration',`[expires_at]=DATEADD(SECOND,300,[created_at])`);
check('BookingHold','confirmation',`([status]='CONFIRMED' AND [confirmed_at] IS NOT NULL) OR ([status]<>'CONFIRMED' AND [confirmed_at] IS NULL)`);
check('Appointment','shape',`([visit_mode]='ONSITE' AND [onsite_assignment_id] IS NOT NULL AND [online_slot_id] IS NULL AND [hold_id] IS NULL) OR ([visit_mode]='ONLINE' AND [onsite_assignment_id] IS NULL AND [online_slot_id] IS NOT NULL AND [hold_id] IS NOT NULL)`);
check('Appointment','cancellation',`([status]='CANCELLED' AND [visit_mode]='ONLINE' AND [cancelled_at] IS NOT NULL AND [cancel_reason] IS NOT NULL) OR ([status]<>'CANCELLED' AND [cancelled_at] IS NULL AND [cancel_reason] IS NULL)`);
check('Service','result',`([service_type]='EXAMINATION' AND [result_type] IS NULL) OR ([service_type]='CLS' AND [result_type] IS NOT NULL)`);
check('ServicePrice','shape',`([doctor_id] IS NULL AND [visit_mode] IS NULL) OR ([doctor_id] IS NOT NULL AND [visit_mode] IS NOT NULL)`);
check('ResultValue','value',`([numeric_value] IS NOT NULL AND [text_value] IS NULL) OR ([numeric_value] IS NULL AND [text_value] IS NOT NULL)`);
check('ResultVersion','correction',`([version_no]=1 AND [replaces_version_id] IS NULL) OR ([version_no]>1 AND [replaces_version_id] IS NOT NULL AND [correction_reason] IS NOT NULL)`);
check('ResultVersion','publication',`[status]<>'PUBLISHED' OR ([published_at] IS NOT NULL AND [published_by] IS NOT NULL AND [confirmed_at] IS NOT NULL AND [confirmed_by] IS NOT NULL)`);
check('ClinicalOrder','validity',`([fully_paid_at] IS NULL AND [validity_days] IS NULL AND [expires_at] IS NULL) OR ([fully_paid_at] IS NOT NULL AND [validity_days] IS NOT NULL AND [expires_at] IS NOT NULL AND [expires_at]=DATEADD(DAY,[validity_days],[fully_paid_at]))`);
check('ClinicalOrder','started',`[started_at] IS NULL OR ([expires_at] IS NOT NULL AND [fully_paid_at] IS NOT NULL AND [started_at]<[expires_at] AND [started_at]>=[fully_paid_at])`);
check('ClinicalOrder','cancellation',`([status]='CANCELLED' AND [cancelled_at] IS NOT NULL AND [cancel_reason] IS NOT NULL) OR ([status]<>'CANCELLED' AND [cancelled_at] IS NULL AND [cancel_reason] IS NULL)`);
check('Invoice','source',`([encounter_id] IS NOT NULL AND [hold_id] IS NULL) OR ([encounter_id] IS NULL AND [hold_id] IS NOT NULL)`);
check('Invoice','issuer',`([issuer_type]='STAFF' AND [issued_by] IS NOT NULL) OR ([issuer_type]='SYSTEM' AND [issued_by] IS NULL)`);
check('Invoice','publication',`[status]<>'ISSUED' OR [issued_at] IS NOT NULL`);
check('InvoiceLine','shape',`([line_type]='CLS' AND [order_id] IS NOT NULL) OR ([line_type]='EXAMINATION' AND [order_id] IS NULL)`);
check('InvoiceLine','total',`[quantity]=1 AND [amount]=[unit_price]`);
check('InvoiceLine','cancellation',`([status]='ACTIVE' AND [cancelled_at] IS NULL AND [cancelled_by] IS NULL AND [cancel_reason] IS NULL) OR ([status]='CANCELLED' AND [cancelled_at] IS NOT NULL AND [cancel_reason] IS NOT NULL)`);
check('PaymentRequest','provider',`[provider]='MOMO'`);
check('PaymentEvent','provider',`[provider]='MOMO'`);
check('Payment','status',`[status]='CONFIRMED'`);
check('Payment','method_shape',`([method]='CASH' AND [confirmed_by] IS NOT NULL AND [payment_request_id] IS NULL AND [provider_transaction_ref] IS NULL) OR ([method]='MOMO' AND [payment_request_id] IS NOT NULL AND [provider_transaction_ref] IS NOT NULL AND [confirmed_by] IS NULL)`);
check('RefundRequest','source',`([reason]='LINE_CANCELLED' AND [allocation_id] IS NOT NULL) OR ([reason] IN ('OVERPAYMENT','LATE_PAYMENT') AND [allocation_id] IS NULL)`);
check('FileObject','https',`[url] LIKE N'https://%' AND [byte_size]>0`);
check('VideoParticipation','range',`[left_at] IS NULL OR [left_at]>=[joined_at]`);
check('VitalSign','present',`COALESCE([temperature_c],[pulse_bpm],[systolic_mmhg],[diastolic_mmhg],[respiratory_rate],[spo2_percent],[weight_kg],[height_cm]) IS NOT NULL`);
for(const col of ['temperature_c','pulse_bpm','systolic_mmhg','diastolic_mmhg','respiratory_rate','spo2_percent','weight_kg','height_cm']) check('VitalSign',col,`${q(col)} > 0${col==='spo2_percent'?' AND [spo2_percent]<=100':''}`);
add(checks.join('\n'));
const filtered=(t,name,cols,where)=>add(`CREATE UNIQUE INDEX ${q('UX_'+t+'_'+name)} ON [dbo].${q(t)} (${list(cols)}) WHERE ${where};`);
filtered('Invoice','hold',['hold_id'],'[hold_id] IS NOT NULL');
filtered('Appointment','occupied_slot',['online_slot_id'],"[online_slot_id] IS NOT NULL AND [status]<>'CANCELLED'");
filtered('ClinicalQueueEntry','active_order',['order_id'],"[status] IN ('WAITING','ACCEPTED','STARTED')");
filtered('ResultVersion','unpublished_order',['order_id'],"[status] IN ('DRAFT','CONFIRMED')");
filtered('Diagnosis','primary_final',['encounter_id'],"[is_primary]=1 AND [diagnosis_type]='FINAL'");
filtered('Prescription','issued_encounter',['encounter_id'],"[status]='ISSUED'");
filtered('Payment','provider_transaction',['method','provider_transaction_ref'],'[provider_transaction_ref] IS NOT NULL');
filtered('InvoiceLine','examination',['invoice_id'],"[line_type]='EXAMINATION'");
const index=(t,name,cols)=>add(`CREATE INDEX ${q('IX_'+t+'_'+name)} ON [dbo].${q(t)} (${cols});`);
index('WorkAssignment','staff_time','[staff_id], [starts_at], [ends_at]');
index('WorkAssignment','availability','[work_date], [mode], [specialty_id], [shift_id]');
index('Appointment','onsite_capacity','[onsite_assignment_id], [status]');
index('Appointment','doctor_mode','[doctor_id], [visit_mode], [status]');
index('Appointment','patient_history','[patient_id], [booked_at] DESC');
index('BookingHold','expiry','[status], [expires_at]');
index('ClinicalOrder','expiry','[status], [expires_at], [started_at]');
index('ClinicalQueueEntry','room_queue','[room_id], [status], [checked_in_at]');
index('ResultVersion','published','[order_id], [status], [version_no] DESC');
index('Invoice','patient_time','[patient_id], [issued_at]');
index('Payment','invoice_time','[invoice_id], [paid_at]');
index('RefundRequest','pending','[status], [requested_at]');
index('AuditEvent','entity','[entity_type], [entity_id], [occurred_at]');
add(`COMMIT TRANSACTION;
END TRY
BEGIN CATCH
    IF XACT_STATE() <> 0 ROLLBACK TRANSACTION;
    THROW;
END CATCH;
PRINT N'Suncare: 58 tables and constraints created successfully.';`);
fs.writeFileSync(path.join(dir,'01_schema.sql'),statements.join('\n\n')+'\n','utf8');
console.log(`Generated 01_schema.sql: ${tables.size} tables, ${checks.length} checks.`);
