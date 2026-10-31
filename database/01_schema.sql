-- Suncare initial schema. SQL Server 2019+; generated from docs/03-tu-dien-du-lieu.md.
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
BEGIN TRANSACTION;

CREATE TABLE [dbo].[Account] (
    [id] bigint IDENTITY(1,1) NOT NULL,
    [login_name] nvarchar(100) NOT NULL,
    [password_hash] varchar(255) NOT NULL,
    [account_type] varchar(32) NOT NULL,
    [patient_id] bigint NULL,
    [staff_id] bigint NULL,
    [status] varchar(32) NOT NULL,
    [last_login_at] datetime2(3) NULL,
    [created_at] datetime2(3) NOT NULL CONSTRAINT [DF_Account_created_at] DEFAULT (SYSUTCDATETIME()),
    [updated_at] datetime2(3) NOT NULL CONSTRAINT [DF_Account_updated_at] DEFAULT (SYSUTCDATETIME()),
    [version] rowversion,
    CONSTRAINT [PK_Account] PRIMARY KEY ([id])
);

CREATE UNIQUE INDEX [UX_Account_login_name] ON [dbo].[Account] ([login_name]);

CREATE UNIQUE INDEX [UX_Account_patient_id] ON [dbo].[Account] ([patient_id]) WHERE [patient_id] IS NOT NULL;

CREATE UNIQUE INDEX [UX_Account_staff_id] ON [dbo].[Account] ([staff_id]) WHERE [staff_id] IS NOT NULL;

CREATE TABLE [dbo].[Patient] (
    [id] bigint IDENTITY(1,1) NOT NULL,
    [code] varchar(40) NOT NULL,
    [full_name] nvarchar(150) NOT NULL,
    [avatar_url] nvarchar(2048) NULL,
    [avatar_public_id] nvarchar(255) NULL,
    [birth_date] date NULL,
    [sex] varchar(16) NOT NULL,
    [phone] varchar(20) NULL,
    [email] nvarchar(254) NULL,
    [address] nvarchar(500) NULL,
    [identity_number] varchar(30) NULL,
    [emergency_name] nvarchar(150) NULL,
    [emergency_phone] varchar(20) NULL,
    [is_active] bit NOT NULL CONSTRAINT [DF_Patient_is_active] DEFAULT (1),
    [created_at] datetime2(3) NOT NULL CONSTRAINT [DF_Patient_created_at] DEFAULT (SYSUTCDATETIME()),
    [updated_at] datetime2(3) NOT NULL CONSTRAINT [DF_Patient_updated_at] DEFAULT (SYSUTCDATETIME()),
    [version] rowversion,
    CONSTRAINT [PK_Patient] PRIMARY KEY ([id])
);

CREATE UNIQUE INDEX [UX_Patient_code] ON [dbo].[Patient] ([code]);

CREATE TABLE [dbo].[Staff] (
    [id] bigint IDENTITY(1,1) NOT NULL,
    [code] varchar(40) NOT NULL,
    [full_name] nvarchar(150) NOT NULL,
    [avatar_url] nvarchar(2048) NULL,
    [avatar_public_id] nvarchar(255) NULL,
    [birth_date] date NULL,
    [sex] varchar(16) NOT NULL,
    [phone] varchar(20) NULL,
    [email] nvarchar(254) NULL,
    [address] nvarchar(500) NULL,
    [professional_license] nvarchar(100) NULL,
    [qualification] nvarchar(150) NULL,
    [is_active] bit NOT NULL CONSTRAINT [DF_Staff_is_active] DEFAULT (1),
    [created_at] datetime2(3) NOT NULL CONSTRAINT [DF_Staff_created_at] DEFAULT (SYSUTCDATETIME()),
    [updated_at] datetime2(3) NOT NULL CONSTRAINT [DF_Staff_updated_at] DEFAULT (SYSUTCDATETIME()),
    [version] rowversion,
    CONSTRAINT [PK_Staff] PRIMARY KEY ([id])
);

CREATE UNIQUE INDEX [UX_Staff_code] ON [dbo].[Staff] ([code]);

CREATE TABLE [dbo].[Role] (
    [id] bigint IDENTITY(1,1) NOT NULL,
    [code] varchar(40) NOT NULL,
    [name] nvarchar(100) NOT NULL,
    [account_type] varchar(32) NOT NULL,
    [created_at] datetime2(3) NOT NULL CONSTRAINT [DF_Role_created_at] DEFAULT (SYSUTCDATETIME()),
    [updated_at] datetime2(3) NOT NULL CONSTRAINT [DF_Role_updated_at] DEFAULT (SYSUTCDATETIME()),
    [version] rowversion,
    CONSTRAINT [PK_Role] PRIMARY KEY ([id])
);

CREATE UNIQUE INDEX [UX_Role_code] ON [dbo].[Role] ([code]);

CREATE TABLE [dbo].[Permission] (
    [id] bigint IDENTITY(1,1) NOT NULL,
    [code] varchar(40) NOT NULL,
    [description] nvarchar(300) NOT NULL,
    [created_at] datetime2(3) NOT NULL CONSTRAINT [DF_Permission_created_at] DEFAULT (SYSUTCDATETIME()),
    [updated_at] datetime2(3) NOT NULL CONSTRAINT [DF_Permission_updated_at] DEFAULT (SYSUTCDATETIME()),
    [version] rowversion,
    CONSTRAINT [PK_Permission] PRIMARY KEY ([id])
);

CREATE UNIQUE INDEX [UX_Permission_code] ON [dbo].[Permission] ([code]);

CREATE TABLE [dbo].[AccountRole] (
    [account_id] bigint NOT NULL,
    [role_id] bigint NOT NULL,
    [granted_by] bigint NOT NULL,
    [granted_at] datetime2(3) NOT NULL,
    [created_at] datetime2(3) NOT NULL CONSTRAINT [DF_AccountRole_created_at] DEFAULT (SYSUTCDATETIME()),
    [updated_at] datetime2(3) NOT NULL CONSTRAINT [DF_AccountRole_updated_at] DEFAULT (SYSUTCDATETIME()),
    [version] rowversion,
    CONSTRAINT [PK_AccountRole] PRIMARY KEY ([account_id], [role_id])
);

CREATE TABLE [dbo].[RolePermission] (
    [role_id] bigint NOT NULL,
    [permission_id] bigint NOT NULL,
    [created_at] datetime2(3) NOT NULL CONSTRAINT [DF_RolePermission_created_at] DEFAULT (SYSUTCDATETIME()),
    [updated_at] datetime2(3) NOT NULL CONSTRAINT [DF_RolePermission_updated_at] DEFAULT (SYSUTCDATETIME()),
    [version] rowversion,
    CONSTRAINT [PK_RolePermission] PRIMARY KEY ([role_id], [permission_id])
);

CREATE TABLE [dbo].[Department] (
    [id] bigint IDENTITY(1,1) NOT NULL,
    [code] varchar(40) NOT NULL,
    [name] nvarchar(150) NOT NULL,
    [department_type] varchar(32) NOT NULL,
    [is_active] bit NOT NULL CONSTRAINT [DF_Department_is_active] DEFAULT (1),
    [created_at] datetime2(3) NOT NULL CONSTRAINT [DF_Department_created_at] DEFAULT (SYSUTCDATETIME()),
    [updated_at] datetime2(3) NOT NULL CONSTRAINT [DF_Department_updated_at] DEFAULT (SYSUTCDATETIME()),
    [version] rowversion,
    CONSTRAINT [PK_Department] PRIMARY KEY ([id])
);

CREATE UNIQUE INDEX [UX_Department_code] ON [dbo].[Department] ([code]);

CREATE TABLE [dbo].[Specialty] (
    [id] bigint IDENTITY(1,1) NOT NULL,
    [code] varchar(40) NOT NULL,
    [name] nvarchar(150) NOT NULL,
    [is_active] bit NOT NULL CONSTRAINT [DF_Specialty_is_active] DEFAULT (1),
    [created_at] datetime2(3) NOT NULL CONSTRAINT [DF_Specialty_created_at] DEFAULT (SYSUTCDATETIME()),
    [updated_at] datetime2(3) NOT NULL CONSTRAINT [DF_Specialty_updated_at] DEFAULT (SYSUTCDATETIME()),
    [version] rowversion,
    CONSTRAINT [PK_Specialty] PRIMARY KEY ([id])
);

CREATE UNIQUE INDEX [UX_Specialty_code] ON [dbo].[Specialty] ([code]);

CREATE TABLE [dbo].[DepartmentSpecialty] (
    [department_id] bigint NOT NULL,
    [specialty_id] bigint NOT NULL,
    [created_at] datetime2(3) NOT NULL CONSTRAINT [DF_DepartmentSpecialty_created_at] DEFAULT (SYSUTCDATETIME()),
    [updated_at] datetime2(3) NOT NULL CONSTRAINT [DF_DepartmentSpecialty_updated_at] DEFAULT (SYSUTCDATETIME()),
    [version] rowversion,
    CONSTRAINT [PK_DepartmentSpecialty] PRIMARY KEY ([department_id], [specialty_id])
);

CREATE TABLE [dbo].[StaffDepartment] (
    [id] bigint IDENTITY(1,1) NOT NULL,
    [staff_id] bigint NOT NULL,
    [department_id] bigint NOT NULL,
    [valid_from] datetime2(3) NOT NULL,
    [valid_to] datetime2(3) NULL,
    [is_primary] bit NOT NULL CONSTRAINT [DF_StaffDepartment_is_primary] DEFAULT (1),
    [created_at] datetime2(3) NOT NULL CONSTRAINT [DF_StaffDepartment_created_at] DEFAULT (SYSUTCDATETIME()),
    [updated_at] datetime2(3) NOT NULL CONSTRAINT [DF_StaffDepartment_updated_at] DEFAULT (SYSUTCDATETIME()),
    [version] rowversion,
    CONSTRAINT [PK_StaffDepartment] PRIMARY KEY ([id])
);

CREATE TABLE [dbo].[StaffSpecialty] (
    [staff_id] bigint NOT NULL,
    [specialty_id] bigint NOT NULL,
    [is_active] bit NOT NULL CONSTRAINT [DF_StaffSpecialty_is_active] DEFAULT (1),
    [created_at] datetime2(3) NOT NULL CONSTRAINT [DF_StaffSpecialty_created_at] DEFAULT (SYSUTCDATETIME()),
    [updated_at] datetime2(3) NOT NULL CONSTRAINT [DF_StaffSpecialty_updated_at] DEFAULT (SYSUTCDATETIME()),
    [version] rowversion,
    CONSTRAINT [PK_StaffSpecialty] PRIMARY KEY ([staff_id], [specialty_id])
);

CREATE TABLE [dbo].[DepartmentHeadAssignment] (
    [id] bigint IDENTITY(1,1) NOT NULL,
    [staff_id] bigint NOT NULL,
    [department_id] bigint NOT NULL,
    [valid_from] datetime2(3) NOT NULL,
    [valid_to] datetime2(3) NULL,
    [assigned_by] bigint NOT NULL,
    [created_at] datetime2(3) NOT NULL CONSTRAINT [DF_DepartmentHeadAssignment_created_at] DEFAULT (SYSUTCDATETIME()),
    [updated_at] datetime2(3) NOT NULL CONSTRAINT [DF_DepartmentHeadAssignment_updated_at] DEFAULT (SYSUTCDATETIME()),
    [version] rowversion,
    CONSTRAINT [PK_DepartmentHeadAssignment] PRIMARY KEY ([id])
);

CREATE TABLE [dbo].[Room] (
    [id] bigint IDENTITY(1,1) NOT NULL,
    [code] varchar(40) NOT NULL,
    [department_id] bigint NOT NULL,
    [name] nvarchar(150) NOT NULL,
    [room_type] varchar(32) NOT NULL,
    [is_active] bit NOT NULL CONSTRAINT [DF_Room_is_active] DEFAULT (1),
    [created_at] datetime2(3) NOT NULL CONSTRAINT [DF_Room_created_at] DEFAULT (SYSUTCDATETIME()),
    [updated_at] datetime2(3) NOT NULL CONSTRAINT [DF_Room_updated_at] DEFAULT (SYSUTCDATETIME()),
    [version] rowversion,
    CONSTRAINT [PK_Room] PRIMARY KEY ([id])
);

CREATE UNIQUE INDEX [UX_Room_code] ON [dbo].[Room] ([code]);

CREATE TABLE [dbo].[Service] (
    [id] bigint IDENTITY(1,1) NOT NULL,
    [code] varchar(40) NOT NULL,
    [name] nvarchar(200) NOT NULL,
    [service_type] varchar(32) NOT NULL,
    [result_type] varchar(32) NULL,
    [specialty_id] bigint NULL,
    [is_active] bit NOT NULL CONSTRAINT [DF_Service_is_active] DEFAULT (1),
    [created_at] datetime2(3) NOT NULL CONSTRAINT [DF_Service_created_at] DEFAULT (SYSUTCDATETIME()),
    [updated_at] datetime2(3) NOT NULL CONSTRAINT [DF_Service_updated_at] DEFAULT (SYSUTCDATETIME()),
    [version] rowversion,
    CONSTRAINT [PK_Service] PRIMARY KEY ([id])
);

CREATE UNIQUE INDEX [UX_Service_code] ON [dbo].[Service] ([code]);

CREATE TABLE [dbo].[RoomService] (
    [room_id] bigint NOT NULL,
    [service_id] bigint NOT NULL,
    [is_active] bit NOT NULL CONSTRAINT [DF_RoomService_is_active] DEFAULT (1),
    [created_at] datetime2(3) NOT NULL CONSTRAINT [DF_RoomService_created_at] DEFAULT (SYSUTCDATETIME()),
    [updated_at] datetime2(3) NOT NULL CONSTRAINT [DF_RoomService_updated_at] DEFAULT (SYSUTCDATETIME()),
    [version] rowversion,
    CONSTRAINT [PK_RoomService] PRIMARY KEY ([room_id], [service_id])
);

CREATE TABLE [dbo].[ServicePrice] (
    [id] bigint IDENTITY(1,1) NOT NULL,
    [service_id] bigint NOT NULL,
    [doctor_id] bigint NULL,
    [visit_mode] varchar(32) NULL,
    [amount] decimal(19,0) NOT NULL,
    [valid_from] datetime2(3) NOT NULL,
    [valid_to] datetime2(3) NULL,
    [created_by] bigint NOT NULL,
    [created_at] datetime2(3) NOT NULL CONSTRAINT [DF_ServicePrice_created_at] DEFAULT (SYSUTCDATETIME()),
    [updated_at] datetime2(3) NOT NULL CONSTRAINT [DF_ServicePrice_updated_at] DEFAULT (SYSUTCDATETIME()),
    [version] rowversion,
    CONSTRAINT [PK_ServicePrice] PRIMARY KEY ([id])
);

CREATE TABLE [dbo].[ShiftDefinition] (
    [id] bigint IDENTITY(1,1) NOT NULL,
    [code] varchar(40) NOT NULL,
    [name] nvarchar(100) NOT NULL,
    [local_start] time(0) NOT NULL,
    [local_end] time(0) NOT NULL,
    [is_active] bit NOT NULL CONSTRAINT [DF_ShiftDefinition_is_active] DEFAULT (1),
    [created_at] datetime2(3) NOT NULL CONSTRAINT [DF_ShiftDefinition_created_at] DEFAULT (SYSUTCDATETIME()),
    [updated_at] datetime2(3) NOT NULL CONSTRAINT [DF_ShiftDefinition_updated_at] DEFAULT (SYSUTCDATETIME()),
    [version] rowversion,
    CONSTRAINT [PK_ShiftDefinition] PRIMARY KEY ([id])
);

CREATE UNIQUE INDEX [UX_ShiftDefinition_code] ON [dbo].[ShiftDefinition] ([code]);

CREATE TABLE [dbo].[WorkSchedule] (
    [id] bigint IDENTITY(1,1) NOT NULL,
    [department_id] bigint NOT NULL,
    [period_start] date NOT NULL,
    [period_end] date NOT NULL,
    [status] varchar(32) NOT NULL,
    [published_at] datetime2(3) NULL,
    [published_by] bigint NULL,
    [created_at] datetime2(3) NOT NULL CONSTRAINT [DF_WorkSchedule_created_at] DEFAULT (SYSUTCDATETIME()),
    [updated_at] datetime2(3) NOT NULL CONSTRAINT [DF_WorkSchedule_updated_at] DEFAULT (SYSUTCDATETIME()),
    [version] rowversion,
    CONSTRAINT [PK_WorkSchedule] PRIMARY KEY ([id])
);

CREATE TABLE [dbo].[WorkAssignment] (
    [id] bigint IDENTITY(1,1) NOT NULL,
    [schedule_id] bigint NOT NULL,
    [staff_id] bigint NOT NULL,
    [room_id] bigint NULL,
    [specialty_id] bigint NULL,
    [work_date] date NOT NULL,
    [shift_id] bigint NULL,
    [mode] varchar(32) NOT NULL,
    [starts_at] datetime2(3) NOT NULL,
    [ends_at] datetime2(3) NOT NULL,
    [capacity] int NULL,
    [created_at] datetime2(3) NOT NULL CONSTRAINT [DF_WorkAssignment_created_at] DEFAULT (SYSUTCDATETIME()),
    [updated_at] datetime2(3) NOT NULL CONSTRAINT [DF_WorkAssignment_updated_at] DEFAULT (SYSUTCDATETIME()),
    [version] rowversion,
    CONSTRAINT [PK_WorkAssignment] PRIMARY KEY ([id])
);

CREATE TABLE [dbo].[OnlineSlot] (
    [id] bigint IDENTITY(1,1) NOT NULL,
    [assignment_id] bigint NOT NULL,
    [starts_at] datetime2(3) NOT NULL,
    [ends_at] datetime2(3) NOT NULL,
    [is_open] bit NOT NULL CONSTRAINT [DF_OnlineSlot_is_open] DEFAULT (1),
    [created_at] datetime2(3) NOT NULL CONSTRAINT [DF_OnlineSlot_created_at] DEFAULT (SYSUTCDATETIME()),
    [updated_at] datetime2(3) NOT NULL CONSTRAINT [DF_OnlineSlot_updated_at] DEFAULT (SYSUTCDATETIME()),
    [version] rowversion,
    CONSTRAINT [PK_OnlineSlot] PRIMARY KEY ([id])
);

CREATE UNIQUE INDEX [UX_OnlineSlot_assignment_id_starts_at] ON [dbo].[OnlineSlot] ([assignment_id], [starts_at]);

CREATE TABLE [dbo].[SlotReservation] (
    [id] bigint IDENTITY(1,1) NOT NULL,
    [slot_id] bigint NOT NULL,
    [hold_id] bigint NOT NULL,
    [created_at] datetime2(3) NOT NULL CONSTRAINT [DF_SlotReservation_created_at] DEFAULT (SYSUTCDATETIME()),
    [updated_at] datetime2(3) NOT NULL CONSTRAINT [DF_SlotReservation_updated_at] DEFAULT (SYSUTCDATETIME()),
    [version] rowversion,
    CONSTRAINT [PK_SlotReservation] PRIMARY KEY ([id])
);

CREATE UNIQUE INDEX [UX_SlotReservation_hold_id] ON [dbo].[SlotReservation] ([hold_id]);

CREATE UNIQUE INDEX [UX_SlotReservation_slot_id] ON [dbo].[SlotReservation] ([slot_id]);

CREATE TABLE [dbo].[BookingHold] (
    [id] bigint IDENTITY(1,1) NOT NULL,
    [code] varchar(40) NOT NULL,
    [patient_id] bigint NOT NULL,
    [slot_id] bigint NOT NULL,
    [requested_doctor_id] bigint NULL,
    [price_id] bigint NOT NULL,
    [quoted_amount] decimal(19,0) NOT NULL,
    [status] varchar(32) NOT NULL,
    [expires_at] datetime2(3) NOT NULL,
    [confirmed_at] datetime2(3) NULL,
    [idempotency_key] varchar(100) NOT NULL,
    [created_at] datetime2(3) NOT NULL CONSTRAINT [DF_BookingHold_created_at] DEFAULT (SYSUTCDATETIME()),
    [updated_at] datetime2(3) NOT NULL CONSTRAINT [DF_BookingHold_updated_at] DEFAULT (SYSUTCDATETIME()),
    [version] rowversion,
    CONSTRAINT [PK_BookingHold] PRIMARY KEY ([id])
);

CREATE UNIQUE INDEX [UX_BookingHold_code] ON [dbo].[BookingHold] ([code]);

CREATE UNIQUE INDEX [UX_BookingHold_idempotency_key] ON [dbo].[BookingHold] ([idempotency_key]);

CREATE TABLE [dbo].[Appointment] (
    [id] bigint IDENTITY(1,1) NOT NULL,
    [code] varchar(40) NOT NULL,
    [patient_id] bigint NOT NULL,
    [doctor_id] bigint NOT NULL,
    [department_id] bigint NOT NULL,
    [specialty_id] bigint NOT NULL,
    [visit_mode] varchar(32) NOT NULL,
    [onsite_assignment_id] bigint NULL,
    [online_slot_id] bigint NULL,
    [hold_id] bigint NULL,
    [price_id] bigint NOT NULL,
    [examination_amount] decimal(19,0) NOT NULL,
    [status] varchar(32) NOT NULL,
    [booked_at] datetime2(3) NOT NULL,
    [cancelled_at] datetime2(3) NULL,
    [cancel_reason] nvarchar(500) NULL,
    [created_at] datetime2(3) NOT NULL CONSTRAINT [DF_Appointment_created_at] DEFAULT (SYSUTCDATETIME()),
    [updated_at] datetime2(3) NOT NULL CONSTRAINT [DF_Appointment_updated_at] DEFAULT (SYSUTCDATETIME()),
    [version] rowversion,
    CONSTRAINT [PK_Appointment] PRIMARY KEY ([id])
);

CREATE UNIQUE INDEX [UX_Appointment_code] ON [dbo].[Appointment] ([code]);

CREATE UNIQUE INDEX [UX_Appointment_hold_id] ON [dbo].[Appointment] ([hold_id]) WHERE [hold_id] IS NOT NULL;

CREATE TABLE [dbo].[AppointmentEvent] (
    [id] bigint IDENTITY(1,1) NOT NULL,
    [appointment_id] bigint NOT NULL,
    [event_type] varchar(32) NOT NULL,
    [actor_id] bigint NULL,
    [reason] nvarchar(500) NULL,
    [occurred_at] datetime2(3) NOT NULL,
    [created_at] datetime2(3) NOT NULL CONSTRAINT [DF_AppointmentEvent_created_at] DEFAULT (SYSUTCDATETIME()),
    CONSTRAINT [PK_AppointmentEvent] PRIMARY KEY ([id])
);

CREATE TABLE [dbo].[Encounter] (
    [id] bigint IDENTITY(1,1) NOT NULL,
    [code] varchar(40) NOT NULL,
    [appointment_id] bigint NOT NULL,
    [status] varchar(32) NOT NULL,
    [started_at] datetime2(3) NULL,
    [completed_at] datetime2(3) NULL,
    [chief_complaint] nvarchar(2000) NULL,
    [examination_note] nvarchar(max) NULL,
    [treatment_plan] nvarchar(max) NULL,
    [followup_note] nvarchar(2000) NULL,
    [created_at] datetime2(3) NOT NULL CONSTRAINT [DF_Encounter_created_at] DEFAULT (SYSUTCDATETIME()),
    [updated_at] datetime2(3) NOT NULL CONSTRAINT [DF_Encounter_updated_at] DEFAULT (SYSUTCDATETIME()),
    [version] rowversion,
    CONSTRAINT [PK_Encounter] PRIMARY KEY ([id])
);

CREATE UNIQUE INDEX [UX_Encounter_code] ON [dbo].[Encounter] ([code]);

CREATE UNIQUE INDEX [UX_Encounter_appointment_id] ON [dbo].[Encounter] ([appointment_id]);

CREATE TABLE [dbo].[PatientHistory] (
    [id] bigint IDENTITY(1,1) NOT NULL,
    [patient_id] bigint NOT NULL,
    [history_type] varchar(32) NOT NULL,
    [description] nvarchar(2000) NOT NULL,
    [recorded_by] bigint NOT NULL,
    [recorded_at] datetime2(3) NOT NULL,
    [is_active] bit NOT NULL CONSTRAINT [DF_PatientHistory_is_active] DEFAULT (1),
    [created_at] datetime2(3) NOT NULL CONSTRAINT [DF_PatientHistory_created_at] DEFAULT (SYSUTCDATETIME()),
    [updated_at] datetime2(3) NOT NULL CONSTRAINT [DF_PatientHistory_updated_at] DEFAULT (SYSUTCDATETIME()),
    [version] rowversion,
    CONSTRAINT [PK_PatientHistory] PRIMARY KEY ([id])
);

CREATE TABLE [dbo].[PatientAllergy] (
    [id] bigint IDENTITY(1,1) NOT NULL,
    [patient_id] bigint NOT NULL,
    [substance] nvarchar(200) NOT NULL,
    [reaction] nvarchar(1000) NULL,
    [severity] varchar(32) NOT NULL,
    [recorded_by] bigint NOT NULL,
    [is_active] bit NOT NULL CONSTRAINT [DF_PatientAllergy_is_active] DEFAULT (1),
    [created_at] datetime2(3) NOT NULL CONSTRAINT [DF_PatientAllergy_created_at] DEFAULT (SYSUTCDATETIME()),
    [updated_at] datetime2(3) NOT NULL CONSTRAINT [DF_PatientAllergy_updated_at] DEFAULT (SYSUTCDATETIME()),
    [version] rowversion,
    CONSTRAINT [PK_PatientAllergy] PRIMARY KEY ([id])
);

CREATE TABLE [dbo].[EncounterHistorySnapshot] (
    [id] bigint IDENTITY(1,1) NOT NULL,
    [encounter_id] bigint NOT NULL,
    [history_text] nvarchar(max) NOT NULL,
    [allergy_text] nvarchar(max) NOT NULL,
    [recorded_by] bigint NOT NULL,
    [recorded_at] datetime2(3) NOT NULL,
    [created_at] datetime2(3) NOT NULL CONSTRAINT [DF_EncounterHistorySnapshot_created_at] DEFAULT (SYSUTCDATETIME()),
    CONSTRAINT [PK_EncounterHistorySnapshot] PRIMARY KEY ([id])
);

CREATE UNIQUE INDEX [UX_EncounterHistorySnapshot_encounter_id] ON [dbo].[EncounterHistorySnapshot] ([encounter_id]);

CREATE TABLE [dbo].[VitalSign] (
    [id] bigint IDENTITY(1,1) NOT NULL,
    [encounter_id] bigint NOT NULL,
    [measured_at] datetime2(3) NOT NULL,
    [temperature_c] decimal(5,2) NULL,
    [pulse_bpm] smallint NULL,
    [systolic_mmhg] smallint NULL,
    [diastolic_mmhg] smallint NULL,
    [respiratory_rate] smallint NULL,
    [spo2_percent] decimal(5,2) NULL,
    [weight_kg] decimal(7,2) NULL,
    [height_cm] decimal(6,2) NULL,
    [recorded_by] bigint NOT NULL,
    [created_at] datetime2(3) NOT NULL CONSTRAINT [DF_VitalSign_created_at] DEFAULT (SYSUTCDATETIME()),
    [updated_at] datetime2(3) NOT NULL CONSTRAINT [DF_VitalSign_updated_at] DEFAULT (SYSUTCDATETIME()),
    [version] rowversion,
    CONSTRAINT [PK_VitalSign] PRIMARY KEY ([id])
);

CREATE TABLE [dbo].[PrevisitResponse] (
    [id] bigint IDENTITY(1,1) NOT NULL,
    [appointment_id] bigint NOT NULL,
    [symptoms] nvarchar(2000) NULL,
    [current_medications] nvarchar(2000) NULL,
    [other_notes] nvarchar(2000) NULL,
    [submitted_at] datetime2(3) NOT NULL,
    [submitted_by] bigint NOT NULL,
    [created_at] datetime2(3) NOT NULL CONSTRAINT [DF_PrevisitResponse_created_at] DEFAULT (SYSUTCDATETIME()),
    [updated_at] datetime2(3) NOT NULL CONSTRAINT [DF_PrevisitResponse_updated_at] DEFAULT (SYSUTCDATETIME()),
    [version] rowversion,
    CONSTRAINT [PK_PrevisitResponse] PRIMARY KEY ([id])
);

CREATE UNIQUE INDEX [UX_PrevisitResponse_appointment_id] ON [dbo].[PrevisitResponse] ([appointment_id]);

CREATE TABLE [dbo].[Diagnosis] (
    [id] bigint IDENTITY(1,1) NOT NULL,
    [encounter_id] bigint NOT NULL,
    [code_system] varchar(30) NULL,
    [diagnosis_code] varchar(30) NULL,
    [description] nvarchar(1000) NOT NULL,
    [diagnosis_type] varchar(32) NOT NULL,
    [is_primary] bit NOT NULL CONSTRAINT [DF_Diagnosis_is_primary] DEFAULT (1),
    [recorded_by] bigint NOT NULL,
    [created_at] datetime2(3) NOT NULL CONSTRAINT [DF_Diagnosis_created_at] DEFAULT (SYSUTCDATETIME()),
    [updated_at] datetime2(3) NOT NULL CONSTRAINT [DF_Diagnosis_updated_at] DEFAULT (SYSUTCDATETIME()),
    [version] rowversion,
    CONSTRAINT [PK_Diagnosis] PRIMARY KEY ([id])
);

CREATE TABLE [dbo].[ClinicalReview] (
    [id] bigint IDENTITY(1,1) NOT NULL,
    [encounter_id] bigint NOT NULL,
    [result_version_id] bigint NOT NULL,
    [reviewed_by] bigint NOT NULL,
    [reviewed_at] datetime2(3) NOT NULL,
    [assessment] nvarchar(2000) NOT NULL,
    [created_at] datetime2(3) NOT NULL CONSTRAINT [DF_ClinicalReview_created_at] DEFAULT (SYSUTCDATETIME()),
    CONSTRAINT [PK_ClinicalReview] PRIMARY KEY ([id])
);

CREATE UNIQUE INDEX [UX_ClinicalReview_encounter_id_result_version_id] ON [dbo].[ClinicalReview] ([encounter_id], [result_version_id]);

CREATE TABLE [dbo].[EncounterEvent] (
    [id] bigint IDENTITY(1,1) NOT NULL,
    [encounter_id] bigint NOT NULL,
    [from_status] varchar(32) NULL,
    [to_status] varchar(32) NOT NULL,
    [actor_id] bigint NULL,
    [reason] nvarchar(1000) NULL,
    [occurred_at] datetime2(3) NOT NULL,
    [created_at] datetime2(3) NOT NULL CONSTRAINT [DF_EncounterEvent_created_at] DEFAULT (SYSUTCDATETIME()),
    CONSTRAINT [PK_EncounterEvent] PRIMARY KEY ([id])
);

CREATE TABLE [dbo].[ClinicalOrder] (
    [id] bigint IDENTITY(1,1) NOT NULL,
    [code] varchar(40) NOT NULL,
    [encounter_id] bigint NOT NULL,
    [service_id] bigint NOT NULL,
    [performing_department_id] bigint NOT NULL,
    [requested_room_id] bigint NULL,
    [ordered_by] bigint NOT NULL,
    [indication] nvarchar(2000) NOT NULL,
    [status] varchar(32) NOT NULL,
    [fully_paid_at] datetime2(3) NULL,
    [validity_days] int NULL,
    [expires_at] datetime2(3) NULL,
    [started_at] datetime2(3) NULL,
    [completed_at] datetime2(3) NULL,
    [cancelled_at] datetime2(3) NULL,
    [cancel_reason] varchar(32) NULL,
    [cancel_note] nvarchar(1000) NULL,
    [created_at] datetime2(3) NOT NULL CONSTRAINT [DF_ClinicalOrder_created_at] DEFAULT (SYSUTCDATETIME()),
    [updated_at] datetime2(3) NOT NULL CONSTRAINT [DF_ClinicalOrder_updated_at] DEFAULT (SYSUTCDATETIME()),
    [version] rowversion,
    CONSTRAINT [PK_ClinicalOrder] PRIMARY KEY ([id])
);

CREATE UNIQUE INDEX [UX_ClinicalOrder_code] ON [dbo].[ClinicalOrder] ([code]);

CREATE TABLE [dbo].[ClinicalQueueEntry] (
    [id] bigint IDENTITY(1,1) NOT NULL,
    [order_id] bigint NOT NULL,
    [room_id] bigint NOT NULL,
    [checked_in_by] bigint NOT NULL,
    [checked_in_at] datetime2(3) NOT NULL,
    [status] varchar(32) NOT NULL,
    [accepted_by] bigint NULL,
    [accepted_at] datetime2(3) NULL,
    [closed_at] datetime2(3) NULL,
    [created_at] datetime2(3) NOT NULL CONSTRAINT [DF_ClinicalQueueEntry_created_at] DEFAULT (SYSUTCDATETIME()),
    [updated_at] datetime2(3) NOT NULL CONSTRAINT [DF_ClinicalQueueEntry_updated_at] DEFAULT (SYSUTCDATETIME()),
    [version] rowversion,
    CONSTRAINT [PK_ClinicalQueueEntry] PRIMARY KEY ([id])
);

CREATE TABLE [dbo].[ClinicalOrderEvent] (
    [id] bigint IDENTITY(1,1) NOT NULL,
    [order_id] bigint NOT NULL,
    [from_status] varchar(32) NULL,
    [to_status] varchar(32) NOT NULL,
    [actor_id] bigint NULL,
    [reason] nvarchar(1000) NULL,
    [occurred_at] datetime2(3) NOT NULL,
    [created_at] datetime2(3) NOT NULL CONSTRAINT [DF_ClinicalOrderEvent_created_at] DEFAULT (SYSUTCDATETIME()),
    CONSTRAINT [PK_ClinicalOrderEvent] PRIMARY KEY ([id])
);

CREATE TABLE [dbo].[ResultVersion] (
    [id] bigint IDENTITY(1,1) NOT NULL,
    [order_id] bigint NOT NULL,
    [version_no] int NOT NULL,
    [replaces_version_id] bigint NULL,
    [status] varchar(32) NOT NULL,
    [description] nvarchar(max) NULL,
    [conclusion] nvarchar(max) NULL,
    [correction_reason] nvarchar(1000) NULL,
    [authored_by] bigint NOT NULL,
    [confirmed_by] bigint NULL,
    [confirmed_at] datetime2(3) NULL,
    [published_by] bigint NULL,
    [published_at] datetime2(3) NULL,
    [created_at] datetime2(3) NOT NULL CONSTRAINT [DF_ResultVersion_created_at] DEFAULT (SYSUTCDATETIME()),
    [updated_at] datetime2(3) NOT NULL CONSTRAINT [DF_ResultVersion_updated_at] DEFAULT (SYSUTCDATETIME()),
    [version] rowversion,
    CONSTRAINT [PK_ResultVersion] PRIMARY KEY ([id])
);

CREATE UNIQUE INDEX [UX_ResultVersion_replaces_version_id] ON [dbo].[ResultVersion] ([replaces_version_id]) WHERE [replaces_version_id] IS NOT NULL;

CREATE UNIQUE INDEX [UX_ResultVersion_order_id_version_no] ON [dbo].[ResultVersion] ([order_id], [version_no]);

CREATE TABLE [dbo].[ServiceAnalyte] (
    [id] bigint IDENTITY(1,1) NOT NULL,
    [service_id] bigint NOT NULL,
    [code] varchar(40) NOT NULL,
    [name] nvarchar(150) NOT NULL,
    [default_unit] nvarchar(50) NULL,
    [reference_text] nvarchar(500) NULL,
    [sort_order] int NOT NULL,
    [is_active] bit NOT NULL CONSTRAINT [DF_ServiceAnalyte_is_active] DEFAULT (1),
    [created_at] datetime2(3) NOT NULL CONSTRAINT [DF_ServiceAnalyte_created_at] DEFAULT (SYSUTCDATETIME()),
    [updated_at] datetime2(3) NOT NULL CONSTRAINT [DF_ServiceAnalyte_updated_at] DEFAULT (SYSUTCDATETIME()),
    [version] rowversion,
    CONSTRAINT [PK_ServiceAnalyte] PRIMARY KEY ([id])
);

CREATE UNIQUE INDEX [UX_ServiceAnalyte_service_id_code] ON [dbo].[ServiceAnalyte] ([service_id], [code]);

CREATE TABLE [dbo].[ResultValue] (
    [id] bigint IDENTITY(1,1) NOT NULL,
    [result_version_id] bigint NOT NULL,
    [line_no] int NOT NULL,
    [analyte_id] bigint NULL,
    [analyte_name] nvarchar(150) NOT NULL,
    [numeric_value] decimal(18,6) NULL,
    [text_value] nvarchar(1000) NULL,
    [unit] nvarchar(50) NULL,
    [reference_text] nvarchar(500) NULL,
    [abnormal_flag] varchar(32) NULL,
    [sort_order] int NOT NULL,
    [created_at] datetime2(3) NOT NULL CONSTRAINT [DF_ResultValue_created_at] DEFAULT (SYSUTCDATETIME()),
    [updated_at] datetime2(3) NOT NULL CONSTRAINT [DF_ResultValue_updated_at] DEFAULT (SYSUTCDATETIME()),
    [version] rowversion,
    CONSTRAINT [PK_ResultValue] PRIMARY KEY ([id])
);

CREATE UNIQUE INDEX [UX_ResultValue_result_version_id_line_no] ON [dbo].[ResultValue] ([result_version_id], [line_no]);

CREATE TABLE [dbo].[ResultAttachment] (
    [result_version_id] bigint NOT NULL,
    [file_id] bigint NOT NULL,
    [created_at] datetime2(3) NOT NULL CONSTRAINT [DF_ResultAttachment_created_at] DEFAULT (SYSUTCDATETIME()),
    CONSTRAINT [PK_ResultAttachment] PRIMARY KEY ([result_version_id], [file_id])
);

CREATE TABLE [dbo].[Drug] (
    [id] bigint IDENTITY(1,1) NOT NULL,
    [code] varchar(40) NOT NULL,
    [name] nvarchar(200) NOT NULL,
    [ingredient] nvarchar(300) NULL,
    [strength] nvarchar(100) NULL,
    [dosage_form] nvarchar(100) NULL,
    [unit] nvarchar(50) NOT NULL,
    [is_active] bit NOT NULL CONSTRAINT [DF_Drug_is_active] DEFAULT (1),
    [created_at] datetime2(3) NOT NULL CONSTRAINT [DF_Drug_created_at] DEFAULT (SYSUTCDATETIME()),
    [updated_at] datetime2(3) NOT NULL CONSTRAINT [DF_Drug_updated_at] DEFAULT (SYSUTCDATETIME()),
    [version] rowversion,
    CONSTRAINT [PK_Drug] PRIMARY KEY ([id])
);

CREATE UNIQUE INDEX [UX_Drug_code] ON [dbo].[Drug] ([code]);

CREATE TABLE [dbo].[Prescription] (
    [id] bigint IDENTITY(1,1) NOT NULL,
    [code] varchar(40) NOT NULL,
    [encounter_id] bigint NOT NULL,
    [status] varchar(32) NOT NULL,
    [prescribed_by] bigint NOT NULL,
    [issued_at] datetime2(3) NULL,
    [instruction] nvarchar(2000) NULL,
    [created_at] datetime2(3) NOT NULL CONSTRAINT [DF_Prescription_created_at] DEFAULT (SYSUTCDATETIME()),
    [updated_at] datetime2(3) NOT NULL CONSTRAINT [DF_Prescription_updated_at] DEFAULT (SYSUTCDATETIME()),
    [version] rowversion,
    CONSTRAINT [PK_Prescription] PRIMARY KEY ([id])
);

CREATE UNIQUE INDEX [UX_Prescription_code] ON [dbo].[Prescription] ([code]);

CREATE TABLE [dbo].[PrescriptionItem] (
    [id] bigint IDENTITY(1,1) NOT NULL,
    [prescription_id] bigint NOT NULL,
    [line_no] int NOT NULL,
    [drug_id] bigint NOT NULL,
    [drug_name] nvarchar(200) NOT NULL,
    [ingredient] nvarchar(300) NULL,
    [strength] nvarchar(100) NULL,
    [dosage_form] nvarchar(100) NULL,
    [unit] nvarchar(50) NOT NULL,
    [dose] nvarchar(200) NOT NULL,
    [route] nvarchar(100) NOT NULL,
    [frequency] nvarchar(200) NOT NULL,
    [duration_days] int NOT NULL,
    [quantity] decimal(12,3) NOT NULL,
    [instruction] nvarchar(1000) NULL,
    [created_at] datetime2(3) NOT NULL CONSTRAINT [DF_PrescriptionItem_created_at] DEFAULT (SYSUTCDATETIME()),
    [updated_at] datetime2(3) NOT NULL CONSTRAINT [DF_PrescriptionItem_updated_at] DEFAULT (SYSUTCDATETIME()),
    [version] rowversion,
    CONSTRAINT [PK_PrescriptionItem] PRIMARY KEY ([id])
);

CREATE UNIQUE INDEX [UX_PrescriptionItem_prescription_id_line_no] ON [dbo].[PrescriptionItem] ([prescription_id], [line_no]);

CREATE TABLE [dbo].[Invoice] (
    [id] bigint IDENTITY(1,1) NOT NULL,
    [code] varchar(40) NOT NULL,
    [patient_id] bigint NOT NULL,
    [encounter_id] bigint NULL,
    [hold_id] bigint NULL,
    [status] varchar(32) NOT NULL,
    [issued_by] bigint NULL,
    [issuer_type] varchar(32) NOT NULL,
    [issued_at] datetime2(3) NULL,
    [patient_name_snapshot] nvarchar(150) NOT NULL,
    [patient_address_snapshot] nvarchar(500) NULL,
    [facility_name_snapshot] nvarchar(200) NOT NULL,
    [facility_address_snapshot] nvarchar(500) NOT NULL,
    [total_amount] decimal(19,0) NOT NULL,
    [currency] char(3) NOT NULL,
    [created_at] datetime2(3) NOT NULL CONSTRAINT [DF_Invoice_created_at] DEFAULT (SYSUTCDATETIME()),
    [updated_at] datetime2(3) NOT NULL CONSTRAINT [DF_Invoice_updated_at] DEFAULT (SYSUTCDATETIME()),
    [version] rowversion,
    CONSTRAINT [PK_Invoice] PRIMARY KEY ([id])
);

CREATE UNIQUE INDEX [UX_Invoice_code] ON [dbo].[Invoice] ([code]);

CREATE TABLE [dbo].[InvoiceLine] (
    [id] bigint IDENTITY(1,1) NOT NULL,
    [invoice_id] bigint NOT NULL,
    [line_no] int NOT NULL,
    [order_id] bigint NULL,
    [line_type] varchar(32) NOT NULL,
    [service_id] bigint NOT NULL,
    [price_id] bigint NOT NULL,
    [service_name] nvarchar(200) NOT NULL,
    [unit_name] nvarchar(50) NOT NULL,
    [quantity] decimal(12,3) NOT NULL,
    [unit_price] decimal(19,0) NOT NULL,
    [amount] decimal(19,0) NOT NULL,
    [status] varchar(32) NOT NULL,
    [cancelled_at] datetime2(3) NULL,
    [cancelled_by] bigint NULL,
    [cancel_reason] varchar(32) NULL,
    [created_at] datetime2(3) NOT NULL CONSTRAINT [DF_InvoiceLine_created_at] DEFAULT (SYSUTCDATETIME()),
    [updated_at] datetime2(3) NOT NULL CONSTRAINT [DF_InvoiceLine_updated_at] DEFAULT (SYSUTCDATETIME()),
    [version] rowversion,
    CONSTRAINT [PK_InvoiceLine] PRIMARY KEY ([id])
);

CREATE UNIQUE INDEX [UX_InvoiceLine_order_id] ON [dbo].[InvoiceLine] ([order_id]) WHERE [order_id] IS NOT NULL;

CREATE UNIQUE INDEX [UX_InvoiceLine_invoice_id_line_no] ON [dbo].[InvoiceLine] ([invoice_id], [line_no]);

CREATE TABLE [dbo].[PaymentRequest] (
    [id] bigint IDENTITY(1,1) NOT NULL,
    [invoice_id] bigint NOT NULL,
    [provider] varchar(32) NOT NULL,
    [merchant_request_key] varchar(100) NOT NULL,
    [amount] decimal(19,0) NOT NULL,
    [status] varchar(32) NOT NULL,
    [expires_at] datetime2(3) NOT NULL,
    [provider_order_ref] varchar(150) NULL,
    [qr_file_id] bigint NULL,
    [checkout_reference] nvarchar(2000) NULL,
    [created_at] datetime2(3) NOT NULL CONSTRAINT [DF_PaymentRequest_created_at] DEFAULT (SYSUTCDATETIME()),
    [updated_at] datetime2(3) NOT NULL CONSTRAINT [DF_PaymentRequest_updated_at] DEFAULT (SYSUTCDATETIME()),
    [version] rowversion,
    CONSTRAINT [PK_PaymentRequest] PRIMARY KEY ([id])
);

CREATE UNIQUE INDEX [UX_PaymentRequest_merchant_request_key] ON [dbo].[PaymentRequest] ([merchant_request_key]);

CREATE UNIQUE INDEX [UX_PaymentRequest_provider_order_ref] ON [dbo].[PaymentRequest] ([provider_order_ref]) WHERE [provider_order_ref] IS NOT NULL;

CREATE TABLE [dbo].[PaymentEvent] (
    [id] bigint IDENTITY(1,1) NOT NULL,
    [provider] varchar(32) NOT NULL,
    [provider_event_key] varchar(200) NOT NULL,
    [payment_request_id] bigint NULL,
    [received_at] datetime2(3) NOT NULL,
    [provider_transaction_ref] varchar(150) NULL,
    [verification_status] varchar(32) NOT NULL,
    [processing_status] varchar(32) NOT NULL,
    [result_code] varchar(50) NULL,
    [payload_hash] char(64) NOT NULL,
    [redacted_payload] nvarchar(max) NULL,
    [processed_at] datetime2(3) NULL,
    [created_at] datetime2(3) NOT NULL CONSTRAINT [DF_PaymentEvent_created_at] DEFAULT (SYSUTCDATETIME()),
    CONSTRAINT [PK_PaymentEvent] PRIMARY KEY ([id])
);

CREATE UNIQUE INDEX [UX_PaymentEvent_provider_event_key] ON [dbo].[PaymentEvent] ([provider_event_key]);

CREATE TABLE [dbo].[Payment] (
    [id] bigint IDENTITY(1,1) NOT NULL,
    [code] varchar(40) NOT NULL,
    [invoice_id] bigint NOT NULL,
    [payment_request_id] bigint NULL,
    [method] varchar(32) NOT NULL,
    [amount] decimal(19,0) NOT NULL,
    [currency] char(3) NOT NULL,
    [status] varchar(32) NOT NULL,
    [paid_at] datetime2(3) NOT NULL,
    [confirmed_by] bigint NULL,
    [provider_transaction_ref] varchar(150) NULL,
    [idempotency_key] varchar(100) NOT NULL,
    [created_at] datetime2(3) NOT NULL CONSTRAINT [DF_Payment_created_at] DEFAULT (SYSUTCDATETIME()),
    CONSTRAINT [PK_Payment] PRIMARY KEY ([id])
);

CREATE UNIQUE INDEX [UX_Payment_code] ON [dbo].[Payment] ([code]);

CREATE UNIQUE INDEX [UX_Payment_idempotency_key] ON [dbo].[Payment] ([idempotency_key]);

CREATE TABLE [dbo].[PaymentAllocation] (
    [id] bigint IDENTITY(1,1) NOT NULL,
    [payment_id] bigint NOT NULL,
    [invoice_line_id] bigint NOT NULL,
    [amount] decimal(19,0) NOT NULL,
    [created_at] datetime2(3) NOT NULL CONSTRAINT [DF_PaymentAllocation_created_at] DEFAULT (SYSUTCDATETIME()),
    CONSTRAINT [PK_PaymentAllocation] PRIMARY KEY ([id])
);

CREATE UNIQUE INDEX [UX_PaymentAllocation_payment_id_invoice_line_id] ON [dbo].[PaymentAllocation] ([payment_id], [invoice_line_id]);

CREATE TABLE [dbo].[RefundRequest] (
    [id] bigint IDENTITY(1,1) NOT NULL,
    [code] varchar(40) NOT NULL,
    [payment_id] bigint NOT NULL,
    [allocation_id] bigint NULL,
    [reason] varchar(32) NOT NULL,
    [amount] decimal(19,0) NOT NULL,
    [status] varchar(32) NOT NULL,
    [requested_at] datetime2(3) NOT NULL,
    [requested_by] bigint NULL,
    [idempotency_key] varchar(100) NOT NULL,
    [created_at] datetime2(3) NOT NULL CONSTRAINT [DF_RefundRequest_created_at] DEFAULT (SYSUTCDATETIME()),
    [updated_at] datetime2(3) NOT NULL CONSTRAINT [DF_RefundRequest_updated_at] DEFAULT (SYSUTCDATETIME()),
    [version] rowversion,
    CONSTRAINT [PK_RefundRequest] PRIMARY KEY ([id])
);

CREATE UNIQUE INDEX [UX_RefundRequest_code] ON [dbo].[RefundRequest] ([code]);

CREATE UNIQUE INDEX [UX_RefundRequest_idempotency_key] ON [dbo].[RefundRequest] ([idempotency_key]);

CREATE TABLE [dbo].[Refund] (
    [id] bigint IDENTITY(1,1) NOT NULL,
    [code] varchar(40) NOT NULL,
    [request_id] bigint NOT NULL,
    [amount] decimal(19,0) NOT NULL,
    [refunded_at] datetime2(3) NOT NULL,
    [processed_by] bigint NOT NULL,
    [method] varchar(32) NOT NULL,
    [external_reference] nvarchar(150) NULL,
    [evidence_file_id] bigint NULL,
    [idempotency_key] varchar(100) NOT NULL,
    [created_at] datetime2(3) NOT NULL CONSTRAINT [DF_Refund_created_at] DEFAULT (SYSUTCDATETIME()),
    CONSTRAINT [PK_Refund] PRIMARY KEY ([id])
);

CREATE UNIQUE INDEX [UX_Refund_code] ON [dbo].[Refund] ([code]);

CREATE UNIQUE INDEX [UX_Refund_idempotency_key] ON [dbo].[Refund] ([idempotency_key]);

CREATE TABLE [dbo].[VideoSession] (
    [id] bigint IDENTITY(1,1) NOT NULL,
    [encounter_id] bigint NOT NULL,
    [provider] varchar(50) NOT NULL,
    [external_session_ref] nvarchar(200) NOT NULL,
    [status] varchar(32) NOT NULL,
    [opened_at] datetime2(3) NULL,
    [closed_at] datetime2(3) NULL,
    [created_at] datetime2(3) NOT NULL CONSTRAINT [DF_VideoSession_created_at] DEFAULT (SYSUTCDATETIME()),
    [updated_at] datetime2(3) NOT NULL CONSTRAINT [DF_VideoSession_updated_at] DEFAULT (SYSUTCDATETIME()),
    [version] rowversion,
    CONSTRAINT [PK_VideoSession] PRIMARY KEY ([id])
);

CREATE TABLE [dbo].[VideoParticipation] (
    [id] bigint IDENTITY(1,1) NOT NULL,
    [session_id] bigint NOT NULL,
    [account_id] bigint NOT NULL,
    [joined_at] datetime2(3) NOT NULL,
    [left_at] datetime2(3) NULL,
    [created_at] datetime2(3) NOT NULL CONSTRAINT [DF_VideoParticipation_created_at] DEFAULT (SYSUTCDATETIME()),
    [updated_at] datetime2(3) NOT NULL CONSTRAINT [DF_VideoParticipation_updated_at] DEFAULT (SYSUTCDATETIME()),
    [version] rowversion,
    CONSTRAINT [PK_VideoParticipation] PRIMARY KEY ([id])
);

CREATE TABLE [dbo].[FileObject] (
    [id] bigint IDENTITY(1,1) NOT NULL,
    [cloudinary_public_id] nvarchar(255) NOT NULL,
    [url] nvarchar(2048) NOT NULL,
    [resource_type] varchar(32) NOT NULL,
    [delivery_type] nvarchar(30) NOT NULL,
    [original_name] nvarchar(255) NOT NULL,
    [media_type] varchar(100) NOT NULL,
    [byte_size] bigint NOT NULL,
    [sha256] char(64) NULL,
    [uploaded_by] bigint NULL,
    [access_class] varchar(32) NOT NULL,
    [status] varchar(32) NOT NULL,
    [created_at] datetime2(3) NOT NULL CONSTRAINT [DF_FileObject_created_at] DEFAULT (SYSUTCDATETIME()),
    [updated_at] datetime2(3) NOT NULL CONSTRAINT [DF_FileObject_updated_at] DEFAULT (SYSUTCDATETIME()),
    [version] rowversion,
    CONSTRAINT [PK_FileObject] PRIMARY KEY ([id])
);

CREATE UNIQUE INDEX [UX_FileObject_cloudinary_public_id] ON [dbo].[FileObject] ([cloudinary_public_id]);

CREATE TABLE [dbo].[SystemSetting] (
    [id] bigint IDENTITY(1,1) NOT NULL,
    [setting_key] varchar(100) NOT NULL,
    [setting_value] nvarchar(2000) NOT NULL,
    [changed_by] bigint NOT NULL,
    [created_at] datetime2(3) NOT NULL CONSTRAINT [DF_SystemSetting_created_at] DEFAULT (SYSUTCDATETIME()),
    [updated_at] datetime2(3) NOT NULL CONSTRAINT [DF_SystemSetting_updated_at] DEFAULT (SYSUTCDATETIME()),
    [version] rowversion,
    CONSTRAINT [PK_SystemSetting] PRIMARY KEY ([id])
);

CREATE UNIQUE INDEX [UX_SystemSetting_setting_key] ON [dbo].[SystemSetting] ([setting_key]);

CREATE TABLE [dbo].[CommandReceipt] (
    [id] bigint IDENTITY(1,1) NOT NULL,
    [account_id] bigint NULL,
    [command_type] varchar(60) NOT NULL,
    [idempotency_key] varchar(100) NOT NULL,
    [request_hash] char(64) NOT NULL,
    [resource_type] varchar(60) NOT NULL,
    [resource_id] bigint NOT NULL,
    [created_at] datetime2(3) NOT NULL CONSTRAINT [DF_CommandReceipt_created_at] DEFAULT (SYSUTCDATETIME()),
    CONSTRAINT [PK_CommandReceipt] PRIMARY KEY ([id])
);

CREATE UNIQUE INDEX [UX_CommandReceipt_command_type_idempotency_key] ON [dbo].[CommandReceipt] ([command_type], [idempotency_key]);

CREATE TABLE [dbo].[AuditEvent] (
    [id] bigint IDENTITY(1,1) NOT NULL,
    [actor_id] bigint NULL,
    [actor_type] varchar(32) NOT NULL,
    [action] varchar(100) NOT NULL,
    [entity_type] varchar(60) NOT NULL,
    [entity_id] bigint NOT NULL,
    [occurred_at] datetime2(3) NOT NULL,
    [correlation_id] varchar(100) NOT NULL,
    [reason] nvarchar(1000) NULL,
    [redacted_change] nvarchar(max) NULL,
    [created_at] datetime2(3) NOT NULL CONSTRAINT [DF_AuditEvent_created_at] DEFAULT (SYSUTCDATETIME()),
    CONSTRAINT [PK_AuditEvent] PRIMARY KEY ([id])
);

ALTER TABLE [dbo].[Account] ADD CONSTRAINT [FK_Account_patient_id] FOREIGN KEY ([patient_id]) REFERENCES [dbo].[Patient] ([id]);

ALTER TABLE [dbo].[Account] ADD CONSTRAINT [FK_Account_staff_id] FOREIGN KEY ([staff_id]) REFERENCES [dbo].[Staff] ([id]);

ALTER TABLE [dbo].[AccountRole] ADD CONSTRAINT [FK_AccountRole_account_id] FOREIGN KEY ([account_id]) REFERENCES [dbo].[Account] ([id]);

ALTER TABLE [dbo].[AccountRole] ADD CONSTRAINT [FK_AccountRole_role_id] FOREIGN KEY ([role_id]) REFERENCES [dbo].[Role] ([id]);

ALTER TABLE [dbo].[AccountRole] ADD CONSTRAINT [FK_AccountRole_granted_by] FOREIGN KEY ([granted_by]) REFERENCES [dbo].[Account] ([id]);

CREATE INDEX [IX_AccountRole_granted_by] ON [dbo].[AccountRole] ([granted_by]);

ALTER TABLE [dbo].[RolePermission] ADD CONSTRAINT [FK_RolePermission_role_id] FOREIGN KEY ([role_id]) REFERENCES [dbo].[Role] ([id]);

ALTER TABLE [dbo].[RolePermission] ADD CONSTRAINT [FK_RolePermission_permission_id] FOREIGN KEY ([permission_id]) REFERENCES [dbo].[Permission] ([id]);

ALTER TABLE [dbo].[DepartmentSpecialty] ADD CONSTRAINT [FK_DepartmentSpecialty_department_id] FOREIGN KEY ([department_id]) REFERENCES [dbo].[Department] ([id]);

ALTER TABLE [dbo].[DepartmentSpecialty] ADD CONSTRAINT [FK_DepartmentSpecialty_specialty_id] FOREIGN KEY ([specialty_id]) REFERENCES [dbo].[Specialty] ([id]);

ALTER TABLE [dbo].[StaffDepartment] ADD CONSTRAINT [FK_StaffDepartment_staff_id] FOREIGN KEY ([staff_id]) REFERENCES [dbo].[Staff] ([id]);

CREATE INDEX [IX_StaffDepartment_staff_id] ON [dbo].[StaffDepartment] ([staff_id]);

ALTER TABLE [dbo].[StaffDepartment] ADD CONSTRAINT [FK_StaffDepartment_department_id] FOREIGN KEY ([department_id]) REFERENCES [dbo].[Department] ([id]);

CREATE INDEX [IX_StaffDepartment_department_id] ON [dbo].[StaffDepartment] ([department_id]);

ALTER TABLE [dbo].[StaffSpecialty] ADD CONSTRAINT [FK_StaffSpecialty_staff_id] FOREIGN KEY ([staff_id]) REFERENCES [dbo].[Staff] ([id]);

ALTER TABLE [dbo].[StaffSpecialty] ADD CONSTRAINT [FK_StaffSpecialty_specialty_id] FOREIGN KEY ([specialty_id]) REFERENCES [dbo].[Specialty] ([id]);

ALTER TABLE [dbo].[DepartmentHeadAssignment] ADD CONSTRAINT [FK_DepartmentHeadAssignment_staff_id] FOREIGN KEY ([staff_id]) REFERENCES [dbo].[Staff] ([id]);

CREATE INDEX [IX_DepartmentHeadAssignment_staff_id] ON [dbo].[DepartmentHeadAssignment] ([staff_id]);

ALTER TABLE [dbo].[DepartmentHeadAssignment] ADD CONSTRAINT [FK_DepartmentHeadAssignment_department_id] FOREIGN KEY ([department_id]) REFERENCES [dbo].[Department] ([id]);

CREATE INDEX [IX_DepartmentHeadAssignment_department_id] ON [dbo].[DepartmentHeadAssignment] ([department_id]);

ALTER TABLE [dbo].[DepartmentHeadAssignment] ADD CONSTRAINT [FK_DepartmentHeadAssignment_assigned_by] FOREIGN KEY ([assigned_by]) REFERENCES [dbo].[Account] ([id]);

CREATE INDEX [IX_DepartmentHeadAssignment_assigned_by] ON [dbo].[DepartmentHeadAssignment] ([assigned_by]);

ALTER TABLE [dbo].[Room] ADD CONSTRAINT [FK_Room_department_id] FOREIGN KEY ([department_id]) REFERENCES [dbo].[Department] ([id]);

CREATE INDEX [IX_Room_department_id] ON [dbo].[Room] ([department_id]);

ALTER TABLE [dbo].[Service] ADD CONSTRAINT [FK_Service_specialty_id] FOREIGN KEY ([specialty_id]) REFERENCES [dbo].[Specialty] ([id]);

CREATE INDEX [IX_Service_specialty_id] ON [dbo].[Service] ([specialty_id]);

ALTER TABLE [dbo].[RoomService] ADD CONSTRAINT [FK_RoomService_room_id] FOREIGN KEY ([room_id]) REFERENCES [dbo].[Room] ([id]);

ALTER TABLE [dbo].[RoomService] ADD CONSTRAINT [FK_RoomService_service_id] FOREIGN KEY ([service_id]) REFERENCES [dbo].[Service] ([id]);

ALTER TABLE [dbo].[ServicePrice] ADD CONSTRAINT [FK_ServicePrice_service_id] FOREIGN KEY ([service_id]) REFERENCES [dbo].[Service] ([id]);

CREATE INDEX [IX_ServicePrice_service_id] ON [dbo].[ServicePrice] ([service_id]);

ALTER TABLE [dbo].[ServicePrice] ADD CONSTRAINT [FK_ServicePrice_doctor_id] FOREIGN KEY ([doctor_id]) REFERENCES [dbo].[Staff] ([id]);

CREATE INDEX [IX_ServicePrice_doctor_id] ON [dbo].[ServicePrice] ([doctor_id]);

ALTER TABLE [dbo].[ServicePrice] ADD CONSTRAINT [FK_ServicePrice_created_by] FOREIGN KEY ([created_by]) REFERENCES [dbo].[Account] ([id]);

CREATE INDEX [IX_ServicePrice_created_by] ON [dbo].[ServicePrice] ([created_by]);

ALTER TABLE [dbo].[WorkSchedule] ADD CONSTRAINT [FK_WorkSchedule_department_id] FOREIGN KEY ([department_id]) REFERENCES [dbo].[Department] ([id]);

CREATE INDEX [IX_WorkSchedule_department_id] ON [dbo].[WorkSchedule] ([department_id]);

ALTER TABLE [dbo].[WorkSchedule] ADD CONSTRAINT [FK_WorkSchedule_published_by] FOREIGN KEY ([published_by]) REFERENCES [dbo].[Account] ([id]);

CREATE INDEX [IX_WorkSchedule_published_by] ON [dbo].[WorkSchedule] ([published_by]);

ALTER TABLE [dbo].[WorkAssignment] ADD CONSTRAINT [FK_WorkAssignment_schedule_id] FOREIGN KEY ([schedule_id]) REFERENCES [dbo].[WorkSchedule] ([id]);

CREATE INDEX [IX_WorkAssignment_schedule_id] ON [dbo].[WorkAssignment] ([schedule_id]);

ALTER TABLE [dbo].[WorkAssignment] ADD CONSTRAINT [FK_WorkAssignment_staff_id] FOREIGN KEY ([staff_id]) REFERENCES [dbo].[Staff] ([id]);

CREATE INDEX [IX_WorkAssignment_staff_id] ON [dbo].[WorkAssignment] ([staff_id]);

ALTER TABLE [dbo].[WorkAssignment] ADD CONSTRAINT [FK_WorkAssignment_room_id] FOREIGN KEY ([room_id]) REFERENCES [dbo].[Room] ([id]);

CREATE INDEX [IX_WorkAssignment_room_id] ON [dbo].[WorkAssignment] ([room_id]);

ALTER TABLE [dbo].[WorkAssignment] ADD CONSTRAINT [FK_WorkAssignment_specialty_id] FOREIGN KEY ([specialty_id]) REFERENCES [dbo].[Specialty] ([id]);

CREATE INDEX [IX_WorkAssignment_specialty_id] ON [dbo].[WorkAssignment] ([specialty_id]);

ALTER TABLE [dbo].[WorkAssignment] ADD CONSTRAINT [FK_WorkAssignment_shift_id] FOREIGN KEY ([shift_id]) REFERENCES [dbo].[ShiftDefinition] ([id]);

CREATE INDEX [IX_WorkAssignment_shift_id] ON [dbo].[WorkAssignment] ([shift_id]);

ALTER TABLE [dbo].[OnlineSlot] ADD CONSTRAINT [FK_OnlineSlot_assignment_id] FOREIGN KEY ([assignment_id]) REFERENCES [dbo].[WorkAssignment] ([id]);

CREATE INDEX [IX_OnlineSlot_assignment_id] ON [dbo].[OnlineSlot] ([assignment_id]);

ALTER TABLE [dbo].[SlotReservation] ADD CONSTRAINT [FK_SlotReservation_slot_id] FOREIGN KEY ([slot_id]) REFERENCES [dbo].[OnlineSlot] ([id]);

CREATE INDEX [IX_SlotReservation_slot_id] ON [dbo].[SlotReservation] ([slot_id]);

ALTER TABLE [dbo].[SlotReservation] ADD CONSTRAINT [FK_SlotReservation_hold_id] FOREIGN KEY ([hold_id]) REFERENCES [dbo].[BookingHold] ([id]);

ALTER TABLE [dbo].[BookingHold] ADD CONSTRAINT [FK_BookingHold_patient_id] FOREIGN KEY ([patient_id]) REFERENCES [dbo].[Patient] ([id]);

CREATE INDEX [IX_BookingHold_patient_id] ON [dbo].[BookingHold] ([patient_id]);

ALTER TABLE [dbo].[BookingHold] ADD CONSTRAINT [FK_BookingHold_slot_id] FOREIGN KEY ([slot_id]) REFERENCES [dbo].[OnlineSlot] ([id]);

CREATE INDEX [IX_BookingHold_slot_id] ON [dbo].[BookingHold] ([slot_id]);

ALTER TABLE [dbo].[BookingHold] ADD CONSTRAINT [FK_BookingHold_requested_doctor_id] FOREIGN KEY ([requested_doctor_id]) REFERENCES [dbo].[Staff] ([id]);

CREATE INDEX [IX_BookingHold_requested_doctor_id] ON [dbo].[BookingHold] ([requested_doctor_id]);

ALTER TABLE [dbo].[BookingHold] ADD CONSTRAINT [FK_BookingHold_price_id] FOREIGN KEY ([price_id]) REFERENCES [dbo].[ServicePrice] ([id]);

CREATE INDEX [IX_BookingHold_price_id] ON [dbo].[BookingHold] ([price_id]);

ALTER TABLE [dbo].[Appointment] ADD CONSTRAINT [FK_Appointment_patient_id] FOREIGN KEY ([patient_id]) REFERENCES [dbo].[Patient] ([id]);

CREATE INDEX [IX_Appointment_patient_id] ON [dbo].[Appointment] ([patient_id]);

ALTER TABLE [dbo].[Appointment] ADD CONSTRAINT [FK_Appointment_doctor_id] FOREIGN KEY ([doctor_id]) REFERENCES [dbo].[Staff] ([id]);

CREATE INDEX [IX_Appointment_doctor_id] ON [dbo].[Appointment] ([doctor_id]);

ALTER TABLE [dbo].[Appointment] ADD CONSTRAINT [FK_Appointment_department_id] FOREIGN KEY ([department_id]) REFERENCES [dbo].[Department] ([id]);

CREATE INDEX [IX_Appointment_department_id] ON [dbo].[Appointment] ([department_id]);

ALTER TABLE [dbo].[Appointment] ADD CONSTRAINT [FK_Appointment_specialty_id] FOREIGN KEY ([specialty_id]) REFERENCES [dbo].[Specialty] ([id]);

CREATE INDEX [IX_Appointment_specialty_id] ON [dbo].[Appointment] ([specialty_id]);

ALTER TABLE [dbo].[Appointment] ADD CONSTRAINT [FK_Appointment_onsite_assignment_id] FOREIGN KEY ([onsite_assignment_id]) REFERENCES [dbo].[WorkAssignment] ([id]);

CREATE INDEX [IX_Appointment_onsite_assignment_id] ON [dbo].[Appointment] ([onsite_assignment_id]);

ALTER TABLE [dbo].[Appointment] ADD CONSTRAINT [FK_Appointment_online_slot_id] FOREIGN KEY ([online_slot_id]) REFERENCES [dbo].[OnlineSlot] ([id]);

CREATE INDEX [IX_Appointment_online_slot_id] ON [dbo].[Appointment] ([online_slot_id]);

ALTER TABLE [dbo].[Appointment] ADD CONSTRAINT [FK_Appointment_hold_id] FOREIGN KEY ([hold_id]) REFERENCES [dbo].[BookingHold] ([id]);

ALTER TABLE [dbo].[Appointment] ADD CONSTRAINT [FK_Appointment_price_id] FOREIGN KEY ([price_id]) REFERENCES [dbo].[ServicePrice] ([id]);

CREATE INDEX [IX_Appointment_price_id] ON [dbo].[Appointment] ([price_id]);

ALTER TABLE [dbo].[AppointmentEvent] ADD CONSTRAINT [FK_AppointmentEvent_appointment_id] FOREIGN KEY ([appointment_id]) REFERENCES [dbo].[Appointment] ([id]);

CREATE INDEX [IX_AppointmentEvent_appointment_id] ON [dbo].[AppointmentEvent] ([appointment_id]);

ALTER TABLE [dbo].[AppointmentEvent] ADD CONSTRAINT [FK_AppointmentEvent_actor_id] FOREIGN KEY ([actor_id]) REFERENCES [dbo].[Account] ([id]);

CREATE INDEX [IX_AppointmentEvent_actor_id] ON [dbo].[AppointmentEvent] ([actor_id]);

ALTER TABLE [dbo].[Encounter] ADD CONSTRAINT [FK_Encounter_appointment_id] FOREIGN KEY ([appointment_id]) REFERENCES [dbo].[Appointment] ([id]);

ALTER TABLE [dbo].[PatientHistory] ADD CONSTRAINT [FK_PatientHistory_patient_id] FOREIGN KEY ([patient_id]) REFERENCES [dbo].[Patient] ([id]);

CREATE INDEX [IX_PatientHistory_patient_id] ON [dbo].[PatientHistory] ([patient_id]);

ALTER TABLE [dbo].[PatientHistory] ADD CONSTRAINT [FK_PatientHistory_recorded_by] FOREIGN KEY ([recorded_by]) REFERENCES [dbo].[Account] ([id]);

CREATE INDEX [IX_PatientHistory_recorded_by] ON [dbo].[PatientHistory] ([recorded_by]);

ALTER TABLE [dbo].[PatientAllergy] ADD CONSTRAINT [FK_PatientAllergy_patient_id] FOREIGN KEY ([patient_id]) REFERENCES [dbo].[Patient] ([id]);

CREATE INDEX [IX_PatientAllergy_patient_id] ON [dbo].[PatientAllergy] ([patient_id]);

ALTER TABLE [dbo].[PatientAllergy] ADD CONSTRAINT [FK_PatientAllergy_recorded_by] FOREIGN KEY ([recorded_by]) REFERENCES [dbo].[Account] ([id]);

CREATE INDEX [IX_PatientAllergy_recorded_by] ON [dbo].[PatientAllergy] ([recorded_by]);

ALTER TABLE [dbo].[EncounterHistorySnapshot] ADD CONSTRAINT [FK_EncounterHistorySnapshot_encounter_id] FOREIGN KEY ([encounter_id]) REFERENCES [dbo].[Encounter] ([id]);

CREATE INDEX [IX_EncounterHistorySnapshot_encounter_id] ON [dbo].[EncounterHistorySnapshot] ([encounter_id]);

ALTER TABLE [dbo].[EncounterHistorySnapshot] ADD CONSTRAINT [FK_EncounterHistorySnapshot_recorded_by] FOREIGN KEY ([recorded_by]) REFERENCES [dbo].[Account] ([id]);

CREATE INDEX [IX_EncounterHistorySnapshot_recorded_by] ON [dbo].[EncounterHistorySnapshot] ([recorded_by]);

ALTER TABLE [dbo].[VitalSign] ADD CONSTRAINT [FK_VitalSign_encounter_id] FOREIGN KEY ([encounter_id]) REFERENCES [dbo].[Encounter] ([id]);

CREATE INDEX [IX_VitalSign_encounter_id] ON [dbo].[VitalSign] ([encounter_id]);

ALTER TABLE [dbo].[VitalSign] ADD CONSTRAINT [FK_VitalSign_recorded_by] FOREIGN KEY ([recorded_by]) REFERENCES [dbo].[Account] ([id]);

CREATE INDEX [IX_VitalSign_recorded_by] ON [dbo].[VitalSign] ([recorded_by]);

ALTER TABLE [dbo].[PrevisitResponse] ADD CONSTRAINT [FK_PrevisitResponse_appointment_id] FOREIGN KEY ([appointment_id]) REFERENCES [dbo].[Appointment] ([id]);

ALTER TABLE [dbo].[PrevisitResponse] ADD CONSTRAINT [FK_PrevisitResponse_submitted_by] FOREIGN KEY ([submitted_by]) REFERENCES [dbo].[Account] ([id]);

CREATE INDEX [IX_PrevisitResponse_submitted_by] ON [dbo].[PrevisitResponse] ([submitted_by]);

ALTER TABLE [dbo].[Diagnosis] ADD CONSTRAINT [FK_Diagnosis_encounter_id] FOREIGN KEY ([encounter_id]) REFERENCES [dbo].[Encounter] ([id]);

CREATE INDEX [IX_Diagnosis_encounter_id] ON [dbo].[Diagnosis] ([encounter_id]);

ALTER TABLE [dbo].[Diagnosis] ADD CONSTRAINT [FK_Diagnosis_recorded_by] FOREIGN KEY ([recorded_by]) REFERENCES [dbo].[Account] ([id]);

CREATE INDEX [IX_Diagnosis_recorded_by] ON [dbo].[Diagnosis] ([recorded_by]);

ALTER TABLE [dbo].[ClinicalReview] ADD CONSTRAINT [FK_ClinicalReview_encounter_id] FOREIGN KEY ([encounter_id]) REFERENCES [dbo].[Encounter] ([id]);

CREATE INDEX [IX_ClinicalReview_encounter_id] ON [dbo].[ClinicalReview] ([encounter_id]);

ALTER TABLE [dbo].[ClinicalReview] ADD CONSTRAINT [FK_ClinicalReview_result_version_id] FOREIGN KEY ([result_version_id]) REFERENCES [dbo].[ResultVersion] ([id]);

CREATE INDEX [IX_ClinicalReview_result_version_id] ON [dbo].[ClinicalReview] ([result_version_id]);

ALTER TABLE [dbo].[ClinicalReview] ADD CONSTRAINT [FK_ClinicalReview_reviewed_by] FOREIGN KEY ([reviewed_by]) REFERENCES [dbo].[Account] ([id]);

CREATE INDEX [IX_ClinicalReview_reviewed_by] ON [dbo].[ClinicalReview] ([reviewed_by]);

ALTER TABLE [dbo].[EncounterEvent] ADD CONSTRAINT [FK_EncounterEvent_encounter_id] FOREIGN KEY ([encounter_id]) REFERENCES [dbo].[Encounter] ([id]);

CREATE INDEX [IX_EncounterEvent_encounter_id] ON [dbo].[EncounterEvent] ([encounter_id]);

ALTER TABLE [dbo].[EncounterEvent] ADD CONSTRAINT [FK_EncounterEvent_actor_id] FOREIGN KEY ([actor_id]) REFERENCES [dbo].[Account] ([id]);

CREATE INDEX [IX_EncounterEvent_actor_id] ON [dbo].[EncounterEvent] ([actor_id]);

ALTER TABLE [dbo].[ClinicalOrder] ADD CONSTRAINT [FK_ClinicalOrder_encounter_id] FOREIGN KEY ([encounter_id]) REFERENCES [dbo].[Encounter] ([id]);

CREATE INDEX [IX_ClinicalOrder_encounter_id] ON [dbo].[ClinicalOrder] ([encounter_id]);

ALTER TABLE [dbo].[ClinicalOrder] ADD CONSTRAINT [FK_ClinicalOrder_service_id] FOREIGN KEY ([service_id]) REFERENCES [dbo].[Service] ([id]);

CREATE INDEX [IX_ClinicalOrder_service_id] ON [dbo].[ClinicalOrder] ([service_id]);

ALTER TABLE [dbo].[ClinicalOrder] ADD CONSTRAINT [FK_ClinicalOrder_performing_department_id] FOREIGN KEY ([performing_department_id]) REFERENCES [dbo].[Department] ([id]);

CREATE INDEX [IX_ClinicalOrder_performing_department_id] ON [dbo].[ClinicalOrder] ([performing_department_id]);

ALTER TABLE [dbo].[ClinicalOrder] ADD CONSTRAINT [FK_ClinicalOrder_requested_room_id] FOREIGN KEY ([requested_room_id]) REFERENCES [dbo].[Room] ([id]);

CREATE INDEX [IX_ClinicalOrder_requested_room_id] ON [dbo].[ClinicalOrder] ([requested_room_id]);

ALTER TABLE [dbo].[ClinicalOrder] ADD CONSTRAINT [FK_ClinicalOrder_ordered_by] FOREIGN KEY ([ordered_by]) REFERENCES [dbo].[Account] ([id]);

CREATE INDEX [IX_ClinicalOrder_ordered_by] ON [dbo].[ClinicalOrder] ([ordered_by]);

ALTER TABLE [dbo].[ClinicalQueueEntry] ADD CONSTRAINT [FK_ClinicalQueueEntry_order_id] FOREIGN KEY ([order_id]) REFERENCES [dbo].[ClinicalOrder] ([id]);

CREATE INDEX [IX_ClinicalQueueEntry_order_id] ON [dbo].[ClinicalQueueEntry] ([order_id]);

ALTER TABLE [dbo].[ClinicalQueueEntry] ADD CONSTRAINT [FK_ClinicalQueueEntry_room_id] FOREIGN KEY ([room_id]) REFERENCES [dbo].[Room] ([id]);

CREATE INDEX [IX_ClinicalQueueEntry_room_id] ON [dbo].[ClinicalQueueEntry] ([room_id]);

ALTER TABLE [dbo].[ClinicalQueueEntry] ADD CONSTRAINT [FK_ClinicalQueueEntry_checked_in_by] FOREIGN KEY ([checked_in_by]) REFERENCES [dbo].[Account] ([id]);

CREATE INDEX [IX_ClinicalQueueEntry_checked_in_by] ON [dbo].[ClinicalQueueEntry] ([checked_in_by]);

ALTER TABLE [dbo].[ClinicalQueueEntry] ADD CONSTRAINT [FK_ClinicalQueueEntry_accepted_by] FOREIGN KEY ([accepted_by]) REFERENCES [dbo].[Staff] ([id]);

CREATE INDEX [IX_ClinicalQueueEntry_accepted_by] ON [dbo].[ClinicalQueueEntry] ([accepted_by]);

ALTER TABLE [dbo].[ClinicalOrderEvent] ADD CONSTRAINT [FK_ClinicalOrderEvent_order_id] FOREIGN KEY ([order_id]) REFERENCES [dbo].[ClinicalOrder] ([id]);

CREATE INDEX [IX_ClinicalOrderEvent_order_id] ON [dbo].[ClinicalOrderEvent] ([order_id]);

ALTER TABLE [dbo].[ClinicalOrderEvent] ADD CONSTRAINT [FK_ClinicalOrderEvent_actor_id] FOREIGN KEY ([actor_id]) REFERENCES [dbo].[Account] ([id]);

CREATE INDEX [IX_ClinicalOrderEvent_actor_id] ON [dbo].[ClinicalOrderEvent] ([actor_id]);

ALTER TABLE [dbo].[ResultVersion] ADD CONSTRAINT [FK_ResultVersion_order_id] FOREIGN KEY ([order_id]) REFERENCES [dbo].[ClinicalOrder] ([id]);

CREATE INDEX [IX_ResultVersion_order_id] ON [dbo].[ResultVersion] ([order_id]);

ALTER TABLE [dbo].[ResultVersion] ADD CONSTRAINT [FK_ResultVersion_replaces_version_id] FOREIGN KEY ([replaces_version_id]) REFERENCES [dbo].[ResultVersion] ([id]);

ALTER TABLE [dbo].[ResultVersion] ADD CONSTRAINT [FK_ResultVersion_authored_by] FOREIGN KEY ([authored_by]) REFERENCES [dbo].[Account] ([id]);

CREATE INDEX [IX_ResultVersion_authored_by] ON [dbo].[ResultVersion] ([authored_by]);

ALTER TABLE [dbo].[ResultVersion] ADD CONSTRAINT [FK_ResultVersion_confirmed_by] FOREIGN KEY ([confirmed_by]) REFERENCES [dbo].[Account] ([id]);

CREATE INDEX [IX_ResultVersion_confirmed_by] ON [dbo].[ResultVersion] ([confirmed_by]);

ALTER TABLE [dbo].[ResultVersion] ADD CONSTRAINT [FK_ResultVersion_published_by] FOREIGN KEY ([published_by]) REFERENCES [dbo].[Account] ([id]);

CREATE INDEX [IX_ResultVersion_published_by] ON [dbo].[ResultVersion] ([published_by]);

ALTER TABLE [dbo].[ServiceAnalyte] ADD CONSTRAINT [FK_ServiceAnalyte_service_id] FOREIGN KEY ([service_id]) REFERENCES [dbo].[Service] ([id]);

CREATE INDEX [IX_ServiceAnalyte_service_id] ON [dbo].[ServiceAnalyte] ([service_id]);

ALTER TABLE [dbo].[ResultValue] ADD CONSTRAINT [FK_ResultValue_result_version_id] FOREIGN KEY ([result_version_id]) REFERENCES [dbo].[ResultVersion] ([id]);

CREATE INDEX [IX_ResultValue_result_version_id] ON [dbo].[ResultValue] ([result_version_id]);

ALTER TABLE [dbo].[ResultValue] ADD CONSTRAINT [FK_ResultValue_analyte_id] FOREIGN KEY ([analyte_id]) REFERENCES [dbo].[ServiceAnalyte] ([id]);

CREATE INDEX [IX_ResultValue_analyte_id] ON [dbo].[ResultValue] ([analyte_id]);

ALTER TABLE [dbo].[ResultAttachment] ADD CONSTRAINT [FK_ResultAttachment_result_version_id] FOREIGN KEY ([result_version_id]) REFERENCES [dbo].[ResultVersion] ([id]);

ALTER TABLE [dbo].[ResultAttachment] ADD CONSTRAINT [FK_ResultAttachment_file_id] FOREIGN KEY ([file_id]) REFERENCES [dbo].[FileObject] ([id]);

ALTER TABLE [dbo].[Prescription] ADD CONSTRAINT [FK_Prescription_encounter_id] FOREIGN KEY ([encounter_id]) REFERENCES [dbo].[Encounter] ([id]);

CREATE INDEX [IX_Prescription_encounter_id] ON [dbo].[Prescription] ([encounter_id]);

ALTER TABLE [dbo].[Prescription] ADD CONSTRAINT [FK_Prescription_prescribed_by] FOREIGN KEY ([prescribed_by]) REFERENCES [dbo].[Account] ([id]);

CREATE INDEX [IX_Prescription_prescribed_by] ON [dbo].[Prescription] ([prescribed_by]);

ALTER TABLE [dbo].[PrescriptionItem] ADD CONSTRAINT [FK_PrescriptionItem_prescription_id] FOREIGN KEY ([prescription_id]) REFERENCES [dbo].[Prescription] ([id]);

CREATE INDEX [IX_PrescriptionItem_prescription_id] ON [dbo].[PrescriptionItem] ([prescription_id]);

ALTER TABLE [dbo].[PrescriptionItem] ADD CONSTRAINT [FK_PrescriptionItem_drug_id] FOREIGN KEY ([drug_id]) REFERENCES [dbo].[Drug] ([id]);

CREATE INDEX [IX_PrescriptionItem_drug_id] ON [dbo].[PrescriptionItem] ([drug_id]);

ALTER TABLE [dbo].[Invoice] ADD CONSTRAINT [FK_Invoice_patient_id] FOREIGN KEY ([patient_id]) REFERENCES [dbo].[Patient] ([id]);

CREATE INDEX [IX_Invoice_patient_id] ON [dbo].[Invoice] ([patient_id]);

ALTER TABLE [dbo].[Invoice] ADD CONSTRAINT [FK_Invoice_encounter_id] FOREIGN KEY ([encounter_id]) REFERENCES [dbo].[Encounter] ([id]);

CREATE INDEX [IX_Invoice_encounter_id] ON [dbo].[Invoice] ([encounter_id]);

ALTER TABLE [dbo].[Invoice] ADD CONSTRAINT [FK_Invoice_hold_id] FOREIGN KEY ([hold_id]) REFERENCES [dbo].[BookingHold] ([id]);

CREATE INDEX [IX_Invoice_hold_id] ON [dbo].[Invoice] ([hold_id]);

ALTER TABLE [dbo].[Invoice] ADD CONSTRAINT [FK_Invoice_issued_by] FOREIGN KEY ([issued_by]) REFERENCES [dbo].[Account] ([id]);

CREATE INDEX [IX_Invoice_issued_by] ON [dbo].[Invoice] ([issued_by]);

ALTER TABLE [dbo].[InvoiceLine] ADD CONSTRAINT [FK_InvoiceLine_invoice_id] FOREIGN KEY ([invoice_id]) REFERENCES [dbo].[Invoice] ([id]);

CREATE INDEX [IX_InvoiceLine_invoice_id] ON [dbo].[InvoiceLine] ([invoice_id]);

ALTER TABLE [dbo].[InvoiceLine] ADD CONSTRAINT [FK_InvoiceLine_order_id] FOREIGN KEY ([order_id]) REFERENCES [dbo].[ClinicalOrder] ([id]);

ALTER TABLE [dbo].[InvoiceLine] ADD CONSTRAINT [FK_InvoiceLine_service_id] FOREIGN KEY ([service_id]) REFERENCES [dbo].[Service] ([id]);

CREATE INDEX [IX_InvoiceLine_service_id] ON [dbo].[InvoiceLine] ([service_id]);

ALTER TABLE [dbo].[InvoiceLine] ADD CONSTRAINT [FK_InvoiceLine_price_id] FOREIGN KEY ([price_id]) REFERENCES [dbo].[ServicePrice] ([id]);

CREATE INDEX [IX_InvoiceLine_price_id] ON [dbo].[InvoiceLine] ([price_id]);

ALTER TABLE [dbo].[InvoiceLine] ADD CONSTRAINT [FK_InvoiceLine_cancelled_by] FOREIGN KEY ([cancelled_by]) REFERENCES [dbo].[Account] ([id]);

CREATE INDEX [IX_InvoiceLine_cancelled_by] ON [dbo].[InvoiceLine] ([cancelled_by]);

ALTER TABLE [dbo].[PaymentRequest] ADD CONSTRAINT [FK_PaymentRequest_invoice_id] FOREIGN KEY ([invoice_id]) REFERENCES [dbo].[Invoice] ([id]);

CREATE INDEX [IX_PaymentRequest_invoice_id] ON [dbo].[PaymentRequest] ([invoice_id]);

ALTER TABLE [dbo].[PaymentRequest] ADD CONSTRAINT [FK_PaymentRequest_qr_file_id] FOREIGN KEY ([qr_file_id]) REFERENCES [dbo].[FileObject] ([id]);

CREATE INDEX [IX_PaymentRequest_qr_file_id] ON [dbo].[PaymentRequest] ([qr_file_id]);

ALTER TABLE [dbo].[PaymentEvent] ADD CONSTRAINT [FK_PaymentEvent_payment_request_id] FOREIGN KEY ([payment_request_id]) REFERENCES [dbo].[PaymentRequest] ([id]);

CREATE INDEX [IX_PaymentEvent_payment_request_id] ON [dbo].[PaymentEvent] ([payment_request_id]);

ALTER TABLE [dbo].[Payment] ADD CONSTRAINT [FK_Payment_invoice_id] FOREIGN KEY ([invoice_id]) REFERENCES [dbo].[Invoice] ([id]);

CREATE INDEX [IX_Payment_invoice_id] ON [dbo].[Payment] ([invoice_id]);

ALTER TABLE [dbo].[Payment] ADD CONSTRAINT [FK_Payment_payment_request_id] FOREIGN KEY ([payment_request_id]) REFERENCES [dbo].[PaymentRequest] ([id]);

CREATE INDEX [IX_Payment_payment_request_id] ON [dbo].[Payment] ([payment_request_id]);

ALTER TABLE [dbo].[Payment] ADD CONSTRAINT [FK_Payment_confirmed_by] FOREIGN KEY ([confirmed_by]) REFERENCES [dbo].[Account] ([id]);

CREATE INDEX [IX_Payment_confirmed_by] ON [dbo].[Payment] ([confirmed_by]);

ALTER TABLE [dbo].[PaymentAllocation] ADD CONSTRAINT [FK_PaymentAllocation_payment_id] FOREIGN KEY ([payment_id]) REFERENCES [dbo].[Payment] ([id]);

CREATE INDEX [IX_PaymentAllocation_payment_id] ON [dbo].[PaymentAllocation] ([payment_id]);

ALTER TABLE [dbo].[PaymentAllocation] ADD CONSTRAINT [FK_PaymentAllocation_invoice_line_id] FOREIGN KEY ([invoice_line_id]) REFERENCES [dbo].[InvoiceLine] ([id]);

CREATE INDEX [IX_PaymentAllocation_invoice_line_id] ON [dbo].[PaymentAllocation] ([invoice_line_id]);

ALTER TABLE [dbo].[RefundRequest] ADD CONSTRAINT [FK_RefundRequest_payment_id] FOREIGN KEY ([payment_id]) REFERENCES [dbo].[Payment] ([id]);

CREATE INDEX [IX_RefundRequest_payment_id] ON [dbo].[RefundRequest] ([payment_id]);

ALTER TABLE [dbo].[RefundRequest] ADD CONSTRAINT [FK_RefundRequest_allocation_id] FOREIGN KEY ([allocation_id]) REFERENCES [dbo].[PaymentAllocation] ([id]);

CREATE INDEX [IX_RefundRequest_allocation_id] ON [dbo].[RefundRequest] ([allocation_id]);

ALTER TABLE [dbo].[RefundRequest] ADD CONSTRAINT [FK_RefundRequest_requested_by] FOREIGN KEY ([requested_by]) REFERENCES [dbo].[Account] ([id]);

CREATE INDEX [IX_RefundRequest_requested_by] ON [dbo].[RefundRequest] ([requested_by]);

ALTER TABLE [dbo].[Refund] ADD CONSTRAINT [FK_Refund_request_id] FOREIGN KEY ([request_id]) REFERENCES [dbo].[RefundRequest] ([id]);

CREATE INDEX [IX_Refund_request_id] ON [dbo].[Refund] ([request_id]);

ALTER TABLE [dbo].[Refund] ADD CONSTRAINT [FK_Refund_processed_by] FOREIGN KEY ([processed_by]) REFERENCES [dbo].[Account] ([id]);

CREATE INDEX [IX_Refund_processed_by] ON [dbo].[Refund] ([processed_by]);

ALTER TABLE [dbo].[Refund] ADD CONSTRAINT [FK_Refund_evidence_file_id] FOREIGN KEY ([evidence_file_id]) REFERENCES [dbo].[FileObject] ([id]);

CREATE INDEX [IX_Refund_evidence_file_id] ON [dbo].[Refund] ([evidence_file_id]);

ALTER TABLE [dbo].[VideoSession] ADD CONSTRAINT [FK_VideoSession_encounter_id] FOREIGN KEY ([encounter_id]) REFERENCES [dbo].[Encounter] ([id]);

CREATE INDEX [IX_VideoSession_encounter_id] ON [dbo].[VideoSession] ([encounter_id]);

ALTER TABLE [dbo].[VideoParticipation] ADD CONSTRAINT [FK_VideoParticipation_session_id] FOREIGN KEY ([session_id]) REFERENCES [dbo].[VideoSession] ([id]);

CREATE INDEX [IX_VideoParticipation_session_id] ON [dbo].[VideoParticipation] ([session_id]);

ALTER TABLE [dbo].[VideoParticipation] ADD CONSTRAINT [FK_VideoParticipation_account_id] FOREIGN KEY ([account_id]) REFERENCES [dbo].[Account] ([id]);

CREATE INDEX [IX_VideoParticipation_account_id] ON [dbo].[VideoParticipation] ([account_id]);

ALTER TABLE [dbo].[FileObject] ADD CONSTRAINT [FK_FileObject_uploaded_by] FOREIGN KEY ([uploaded_by]) REFERENCES [dbo].[Account] ([id]);

CREATE INDEX [IX_FileObject_uploaded_by] ON [dbo].[FileObject] ([uploaded_by]);

ALTER TABLE [dbo].[SystemSetting] ADD CONSTRAINT [FK_SystemSetting_changed_by] FOREIGN KEY ([changed_by]) REFERENCES [dbo].[Account] ([id]);

CREATE INDEX [IX_SystemSetting_changed_by] ON [dbo].[SystemSetting] ([changed_by]);

ALTER TABLE [dbo].[CommandReceipt] ADD CONSTRAINT [FK_CommandReceipt_account_id] FOREIGN KEY ([account_id]) REFERENCES [dbo].[Account] ([id]);

CREATE INDEX [IX_CommandReceipt_account_id] ON [dbo].[CommandReceipt] ([account_id]);

ALTER TABLE [dbo].[AuditEvent] ADD CONSTRAINT [FK_AuditEvent_actor_id] FOREIGN KEY ([actor_id]) REFERENCES [dbo].[Account] ([id]);

CREATE INDEX [IX_AuditEvent_actor_id] ON [dbo].[AuditEvent] ([actor_id]);

ALTER TABLE [dbo].[Account] ADD CONSTRAINT [CK_Account_account_type] CHECK ([account_type] IN ('PATIENT','STAFF'));
ALTER TABLE [dbo].[Account] ADD CONSTRAINT [CK_Account_status] CHECK ([status] IN ('ACTIVE','LOCKED'));
ALTER TABLE [dbo].[Role] ADD CONSTRAINT [CK_Role_account_type] CHECK ([account_type] IN ('PATIENT','STAFF'));
ALTER TABLE [dbo].[Department] ADD CONSTRAINT [CK_Department_department_type] CHECK ([department_type] IN ('CLINICAL','LAB'));
ALTER TABLE [dbo].[Room] ADD CONSTRAINT [CK_Room_room_type] CHECK ([room_type] IN ('CONSULTATION','LAB'));
ALTER TABLE [dbo].[Service] ADD CONSTRAINT [CK_Service_service_type] CHECK ([service_type] IN ('EXAMINATION','CLS'));
ALTER TABLE [dbo].[Service] ADD CONSTRAINT [CK_Service_result_type] CHECK ([result_type] IN ('LAB','IMAGING'));
ALTER TABLE [dbo].[ServicePrice] ADD CONSTRAINT [CK_ServicePrice_visit_mode] CHECK ([visit_mode] IN ('ONSITE','ONLINE'));
ALTER TABLE [dbo].[ServicePrice] ADD CONSTRAINT [CK_ServicePrice_amount_positive] CHECK ([amount] > 0);
ALTER TABLE [dbo].[WorkSchedule] ADD CONSTRAINT [CK_WorkSchedule_status] CHECK ([status] IN ('DRAFT','PUBLISHED'));
ALTER TABLE [dbo].[WorkAssignment] ADD CONSTRAINT [CK_WorkAssignment_mode] CHECK ([mode] IN ('ONSITE','ONLINE','LAB'));
ALTER TABLE [dbo].[WorkAssignment] ADD CONSTRAINT [CK_WorkAssignment_capacity_positive] CHECK ([capacity] > 0);
ALTER TABLE [dbo].[BookingHold] ADD CONSTRAINT [CK_BookingHold_quoted_amount_positive] CHECK ([quoted_amount] > 0);
ALTER TABLE [dbo].[BookingHold] ADD CONSTRAINT [CK_BookingHold_status] CHECK ([status] IN ('ACTIVE','CONFIRMED','EXPIRED'));
ALTER TABLE [dbo].[Appointment] ADD CONSTRAINT [CK_Appointment_visit_mode] CHECK ([visit_mode] IN ('ONSITE','ONLINE'));
ALTER TABLE [dbo].[Appointment] ADD CONSTRAINT [CK_Appointment_examination_amount_positive] CHECK ([examination_amount] > 0);
ALTER TABLE [dbo].[Appointment] ADD CONSTRAINT [CK_Appointment_status] CHECK ([status] IN ('BOOKED','COMPLETED','CANCELLED','NO_SHOW'));
ALTER TABLE [dbo].[AppointmentEvent] ADD CONSTRAINT [CK_AppointmentEvent_event_type] CHECK ([event_type] IN ('BOOKED','CANCELLED','NO_SHOW','COMPLETED'));
ALTER TABLE [dbo].[Encounter] ADD CONSTRAINT [CK_Encounter_status] CHECK ([status] IN ('PLANNED','IN_PROGRESS','WAITING_CLS','COMPLETED','CANCELLED','NO_SHOW'));
ALTER TABLE [dbo].[PatientHistory] ADD CONSTRAINT [CK_PatientHistory_history_type] CHECK ([history_type] IN ('PERSONAL','FAMILY','SURGERY'));
ALTER TABLE [dbo].[PatientAllergy] ADD CONSTRAINT [CK_PatientAllergy_severity] CHECK ([severity] IN ('UNKNOWN','MILD','MODERATE','SEVERE'));
ALTER TABLE [dbo].[Diagnosis] ADD CONSTRAINT [CK_Diagnosis_diagnosis_type] CHECK ([diagnosis_type] IN ('PRELIMINARY','FINAL'));
ALTER TABLE [dbo].[ClinicalOrder] ADD CONSTRAINT [CK_ClinicalOrder_status] CHECK ([status] IN ('PENDING_PAYMENT','READY','QUEUED','ACCEPTED','IN_PROGRESS','COMPLETED','CANCELLED'));
ALTER TABLE [dbo].[ClinicalOrder] ADD CONSTRAINT [CK_ClinicalOrder_validity_days_positive] CHECK ([validity_days] > 0);
ALTER TABLE [dbo].[ClinicalOrder] ADD CONSTRAINT [CK_ClinicalOrder_cancel_reason] CHECK ([cancel_reason] IN ('PATIENT_REQUEST','EXPIRED','CLINICAL_DECISION'));
ALTER TABLE [dbo].[ClinicalQueueEntry] ADD CONSTRAINT [CK_ClinicalQueueEntry_status] CHECK ([status] IN ('WAITING','ACCEPTED','STARTED','DEFERRED','EXPIRED','CANCELLED','DONE'));
ALTER TABLE [dbo].[ResultVersion] ADD CONSTRAINT [CK_ResultVersion_version_no_positive] CHECK ([version_no] > 0);
ALTER TABLE [dbo].[ResultVersion] ADD CONSTRAINT [CK_ResultVersion_status] CHECK ([status] IN ('DRAFT','CONFIRMED','PUBLISHED'));
ALTER TABLE [dbo].[ResultValue] ADD CONSTRAINT [CK_ResultValue_line_no_positive] CHECK ([line_no] > 0);
ALTER TABLE [dbo].[ResultValue] ADD CONSTRAINT [CK_ResultValue_abnormal_flag] CHECK ([abnormal_flag] IN ('NORMAL','LOW','HIGH','CRITICAL'));
ALTER TABLE [dbo].[Prescription] ADD CONSTRAINT [CK_Prescription_status] CHECK ([status] IN ('DRAFT','ISSUED'));
ALTER TABLE [dbo].[PrescriptionItem] ADD CONSTRAINT [CK_PrescriptionItem_line_no_positive] CHECK ([line_no] > 0);
ALTER TABLE [dbo].[PrescriptionItem] ADD CONSTRAINT [CK_PrescriptionItem_duration_days_positive] CHECK ([duration_days] > 0);
ALTER TABLE [dbo].[PrescriptionItem] ADD CONSTRAINT [CK_PrescriptionItem_quantity_positive] CHECK ([quantity] > 0);
ALTER TABLE [dbo].[Invoice] ADD CONSTRAINT [CK_Invoice_status] CHECK ([status] IN ('DRAFT','ISSUED','VOID'));
ALTER TABLE [dbo].[Invoice] ADD CONSTRAINT [CK_Invoice_issuer_type] CHECK ([issuer_type] IN ('STAFF','SYSTEM'));
ALTER TABLE [dbo].[Invoice] ADD CONSTRAINT [CK_Invoice_total_nonnegative] CHECK ([total_amount] >= 0);
ALTER TABLE [dbo].[Invoice] ADD CONSTRAINT [CK_Invoice_currency] CHECK ([currency] = 'VND');
ALTER TABLE [dbo].[InvoiceLine] ADD CONSTRAINT [CK_InvoiceLine_line_no_positive] CHECK ([line_no] > 0);
ALTER TABLE [dbo].[InvoiceLine] ADD CONSTRAINT [CK_InvoiceLine_line_type] CHECK ([line_type] IN ('EXAMINATION','CLS'));
ALTER TABLE [dbo].[InvoiceLine] ADD CONSTRAINT [CK_InvoiceLine_quantity_positive] CHECK ([quantity] > 0);
ALTER TABLE [dbo].[InvoiceLine] ADD CONSTRAINT [CK_InvoiceLine_unit_price_positive] CHECK ([unit_price] > 0);
ALTER TABLE [dbo].[InvoiceLine] ADD CONSTRAINT [CK_InvoiceLine_amount_positive] CHECK ([amount] > 0);
ALTER TABLE [dbo].[InvoiceLine] ADD CONSTRAINT [CK_InvoiceLine_status] CHECK ([status] IN ('ACTIVE','CANCELLED'));
ALTER TABLE [dbo].[InvoiceLine] ADD CONSTRAINT [CK_InvoiceLine_cancel_reason] CHECK ([cancel_reason] IN ('APPOINTMENT_CANCELLED','ORDER_CANCELLED','ORDER_EXPIRED','BOOKING_EXPIRED'));
ALTER TABLE [dbo].[PaymentRequest] ADD CONSTRAINT [CK_PaymentRequest_amount_positive] CHECK ([amount] > 0);
ALTER TABLE [dbo].[PaymentRequest] ADD CONSTRAINT [CK_PaymentRequest_status] CHECK ([status] IN ('CREATED','PENDING','SUCCEEDED','FAILED','EXPIRED'));
ALTER TABLE [dbo].[PaymentEvent] ADD CONSTRAINT [CK_PaymentEvent_verification_status] CHECK ([verification_status] IN ('VALID','INVALID','UNKNOWN'));
ALTER TABLE [dbo].[PaymentEvent] ADD CONSTRAINT [CK_PaymentEvent_processing_status] CHECK ([processing_status] IN ('RECEIVED','APPLIED','REJECTED','REVIEW'));
ALTER TABLE [dbo].[Payment] ADD CONSTRAINT [CK_Payment_method] CHECK ([method] IN ('MOMO','CASH'));
ALTER TABLE [dbo].[Payment] ADD CONSTRAINT [CK_Payment_amount_positive] CHECK ([amount] > 0);
ALTER TABLE [dbo].[Payment] ADD CONSTRAINT [CK_Payment_currency] CHECK ([currency] = 'VND');
ALTER TABLE [dbo].[PaymentAllocation] ADD CONSTRAINT [CK_PaymentAllocation_amount_positive] CHECK ([amount] > 0);
ALTER TABLE [dbo].[RefundRequest] ADD CONSTRAINT [CK_RefundRequest_reason] CHECK ([reason] IN ('LINE_CANCELLED','OVERPAYMENT','LATE_PAYMENT'));
ALTER TABLE [dbo].[RefundRequest] ADD CONSTRAINT [CK_RefundRequest_amount_positive] CHECK ([amount] > 0);
ALTER TABLE [dbo].[RefundRequest] ADD CONSTRAINT [CK_RefundRequest_status] CHECK ([status] IN ('REQUESTED','PROCESSING','COMPLETED'));
ALTER TABLE [dbo].[Refund] ADD CONSTRAINT [CK_Refund_amount_positive] CHECK ([amount] > 0);
ALTER TABLE [dbo].[Refund] ADD CONSTRAINT [CK_Refund_method] CHECK ([method] IN ('CASH','MANUAL_TRANSFER'));
ALTER TABLE [dbo].[VideoSession] ADD CONSTRAINT [CK_VideoSession_status] CHECK ([status] IN ('CREATED','OPEN','CLOSED','FAILED'));
ALTER TABLE [dbo].[FileObject] ADD CONSTRAINT [CK_FileObject_resource_type] CHECK ([resource_type] IN ('IMAGE','VIDEO','RAW'));
ALTER TABLE [dbo].[FileObject] ADD CONSTRAINT [CK_FileObject_access_class] CHECK ([access_class] IN ('MEDICAL','PAYMENT'));
ALTER TABLE [dbo].[FileObject] ADD CONSTRAINT [CK_FileObject_status] CHECK ([status] IN ('ACTIVE','QUARANTINED'));
ALTER TABLE [dbo].[AuditEvent] ADD CONSTRAINT [CK_AuditEvent_actor_type] CHECK ([actor_type] IN ('USER','SYSTEM'));
ALTER TABLE [dbo].[Account] ADD CONSTRAINT [CK_Account_profile] CHECK (([account_type]='PATIENT' AND [patient_id] IS NOT NULL AND [staff_id] IS NULL) OR ([account_type]='STAFF' AND [staff_id] IS NOT NULL AND [patient_id] IS NULL));
ALTER TABLE [dbo].[Account] ADD CONSTRAINT [CK_Account_type] CHECK ([account_type] IN ('PATIENT','STAFF'));
ALTER TABLE [dbo].[Account] ADD CONSTRAINT [CK_Account_login] CHECK (LEN(LTRIM(RTRIM([login_name]))) > 0 AND DATALENGTH([login_name])=DATALENGTH(LTRIM(RTRIM([login_name]))));
ALTER TABLE [dbo].[Role] ADD CONSTRAINT [CK_Role_type] CHECK ([account_type] IN ('PATIENT','STAFF'));
ALTER TABLE [dbo].[Role] ADD CONSTRAINT [CK_Role_code] CHECK ([code] IN ('PATIENT','DOCTOR','LAB_STAFF','DEPARTMENT_HEAD','CASHIER','SYSTEM_ADMIN'));
ALTER TABLE [dbo].[ShiftDefinition] ADD CONSTRAINT [CK_ShiftDefinition_code] CHECK ([code] IN ('MORNING','AFTERNOON'));
ALTER TABLE [dbo].[Patient] ADD CONSTRAINT [CK_Patient_avatar] CHECK (([avatar_url] IS NULL AND [avatar_public_id] IS NULL) OR ([avatar_url] IS NOT NULL AND [avatar_url] LIKE N'https://%' AND [avatar_public_id] IS NOT NULL));
ALTER TABLE [dbo].[Staff] ADD CONSTRAINT [CK_Staff_avatar] CHECK (([avatar_url] IS NULL AND [avatar_public_id] IS NULL) OR ([avatar_url] IS NOT NULL AND [avatar_url] LIKE N'https://%' AND [avatar_public_id] IS NOT NULL));
ALTER TABLE [dbo].[Staff] ADD CONSTRAINT [CK_Staff_sex] CHECK ([sex] IN ('UNKNOWN','MALE','FEMALE','OTHER'));
ALTER TABLE [dbo].[Patient] ADD CONSTRAINT [CK_Patient_sex] CHECK ([sex] IN ('UNKNOWN','MALE','FEMALE','OTHER'));
ALTER TABLE [dbo].[StaffDepartment] ADD CONSTRAINT [CK_StaffDepartment_range] CHECK ([valid_to] IS NULL OR [valid_to]>[valid_from]);
ALTER TABLE [dbo].[DepartmentHeadAssignment] ADD CONSTRAINT [CK_DepartmentHeadAssignment_range] CHECK ([valid_to] IS NULL OR [valid_to]>[valid_from]);
ALTER TABLE [dbo].[ServicePrice] ADD CONSTRAINT [CK_ServicePrice_range] CHECK ([valid_to] IS NULL OR [valid_to]>[valid_from]);
ALTER TABLE [dbo].[ShiftDefinition] ADD CONSTRAINT [CK_ShiftDefinition_range] CHECK ([local_end]>[local_start]);
ALTER TABLE [dbo].[WorkSchedule] ADD CONSTRAINT [CK_WorkSchedule_range] CHECK ([period_end]>=[period_start]);
ALTER TABLE [dbo].[WorkSchedule] ADD CONSTRAINT [CK_WorkSchedule_publication] CHECK (([status]='DRAFT' AND [published_at] IS NULL AND [published_by] IS NULL) OR ([status]='PUBLISHED' AND [published_at] IS NOT NULL AND [published_by] IS NOT NULL));
ALTER TABLE [dbo].[WorkAssignment] ADD CONSTRAINT [CK_WorkAssignment_range] CHECK ([ends_at]>[starts_at]);
ALTER TABLE [dbo].[WorkAssignment] ADD CONSTRAINT [CK_WorkAssignment_shape] CHECK (([mode]='ONSITE' AND [room_id] IS NOT NULL AND [specialty_id] IS NOT NULL AND [shift_id] IS NOT NULL AND [capacity] IS NOT NULL) OR ([mode]='ONLINE' AND [specialty_id] IS NOT NULL AND [room_id] IS NULL AND [shift_id] IS NULL AND [capacity] IS NULL) OR ([mode]='LAB' AND [room_id] IS NOT NULL AND [capacity] IS NULL));
ALTER TABLE [dbo].[OnlineSlot] ADD CONSTRAINT [CK_OnlineSlot_duration] CHECK ([ends_at]=DATEADD(MINUTE,20,[starts_at]));
ALTER TABLE [dbo].[BookingHold] ADD CONSTRAINT [CK_BookingHold_duration] CHECK ([expires_at]=DATEADD(SECOND,300,[created_at]));
ALTER TABLE [dbo].[BookingHold] ADD CONSTRAINT [CK_BookingHold_confirmation] CHECK (([status]='CONFIRMED' AND [confirmed_at] IS NOT NULL) OR ([status]<>'CONFIRMED' AND [confirmed_at] IS NULL));
ALTER TABLE [dbo].[Appointment] ADD CONSTRAINT [CK_Appointment_shape] CHECK (([visit_mode]='ONSITE' AND [onsite_assignment_id] IS NOT NULL AND [online_slot_id] IS NULL AND [hold_id] IS NULL) OR ([visit_mode]='ONLINE' AND [onsite_assignment_id] IS NULL AND [online_slot_id] IS NOT NULL AND [hold_id] IS NOT NULL));
ALTER TABLE [dbo].[Appointment] ADD CONSTRAINT [CK_Appointment_cancellation] CHECK (([status]='CANCELLED' AND [visit_mode]='ONLINE' AND [cancelled_at] IS NOT NULL AND [cancel_reason] IS NOT NULL) OR ([status]<>'CANCELLED' AND [cancelled_at] IS NULL AND [cancel_reason] IS NULL));
ALTER TABLE [dbo].[Service] ADD CONSTRAINT [CK_Service_result] CHECK (([service_type]='EXAMINATION' AND [result_type] IS NULL) OR ([service_type]='CLS' AND [result_type] IS NOT NULL));
ALTER TABLE [dbo].[ServicePrice] ADD CONSTRAINT [CK_ServicePrice_shape] CHECK (([doctor_id] IS NULL AND [visit_mode] IS NULL) OR ([doctor_id] IS NOT NULL AND [visit_mode] IS NOT NULL));
ALTER TABLE [dbo].[ResultValue] ADD CONSTRAINT [CK_ResultValue_value] CHECK (([numeric_value] IS NOT NULL AND [text_value] IS NULL) OR ([numeric_value] IS NULL AND [text_value] IS NOT NULL));
ALTER TABLE [dbo].[ResultVersion] ADD CONSTRAINT [CK_ResultVersion_correction] CHECK (([version_no]=1 AND [replaces_version_id] IS NULL) OR ([version_no]>1 AND [replaces_version_id] IS NOT NULL AND [correction_reason] IS NOT NULL));
ALTER TABLE [dbo].[ResultVersion] ADD CONSTRAINT [CK_ResultVersion_publication] CHECK ([status]<>'PUBLISHED' OR ([published_at] IS NOT NULL AND [published_by] IS NOT NULL AND [confirmed_at] IS NOT NULL AND [confirmed_by] IS NOT NULL));
ALTER TABLE [dbo].[ClinicalOrder] ADD CONSTRAINT [CK_ClinicalOrder_validity] CHECK (([fully_paid_at] IS NULL AND [validity_days] IS NULL AND [expires_at] IS NULL) OR ([fully_paid_at] IS NOT NULL AND [validity_days] IS NOT NULL AND [expires_at] IS NOT NULL AND [expires_at]=DATEADD(DAY,[validity_days],[fully_paid_at])));
ALTER TABLE [dbo].[ClinicalOrder] ADD CONSTRAINT [CK_ClinicalOrder_started] CHECK ([started_at] IS NULL OR ([expires_at] IS NOT NULL AND [fully_paid_at] IS NOT NULL AND [started_at]<[expires_at] AND [started_at]>=[fully_paid_at]));
ALTER TABLE [dbo].[ClinicalOrder] ADD CONSTRAINT [CK_ClinicalOrder_cancellation] CHECK (([status]='CANCELLED' AND [cancelled_at] IS NOT NULL AND [cancel_reason] IS NOT NULL) OR ([status]<>'CANCELLED' AND [cancelled_at] IS NULL AND [cancel_reason] IS NULL));
ALTER TABLE [dbo].[Invoice] ADD CONSTRAINT [CK_Invoice_source] CHECK (([encounter_id] IS NOT NULL AND [hold_id] IS NULL) OR ([encounter_id] IS NULL AND [hold_id] IS NOT NULL));
ALTER TABLE [dbo].[Invoice] ADD CONSTRAINT [CK_Invoice_issuer] CHECK (([issuer_type]='STAFF' AND [issued_by] IS NOT NULL) OR ([issuer_type]='SYSTEM' AND [issued_by] IS NULL));
ALTER TABLE [dbo].[Invoice] ADD CONSTRAINT [CK_Invoice_publication] CHECK ([status]<>'ISSUED' OR [issued_at] IS NOT NULL);
ALTER TABLE [dbo].[InvoiceLine] ADD CONSTRAINT [CK_InvoiceLine_shape] CHECK (([line_type]='CLS' AND [order_id] IS NOT NULL) OR ([line_type]='EXAMINATION' AND [order_id] IS NULL));
ALTER TABLE [dbo].[InvoiceLine] ADD CONSTRAINT [CK_InvoiceLine_total] CHECK ([quantity]=1 AND [amount]=[unit_price]);
ALTER TABLE [dbo].[InvoiceLine] ADD CONSTRAINT [CK_InvoiceLine_cancellation] CHECK (([status]='ACTIVE' AND [cancelled_at] IS NULL AND [cancelled_by] IS NULL AND [cancel_reason] IS NULL) OR ([status]='CANCELLED' AND [cancelled_at] IS NOT NULL AND [cancel_reason] IS NOT NULL));
ALTER TABLE [dbo].[PaymentRequest] ADD CONSTRAINT [CK_PaymentRequest_provider] CHECK ([provider]='MOMO');
ALTER TABLE [dbo].[PaymentEvent] ADD CONSTRAINT [CK_PaymentEvent_provider] CHECK ([provider]='MOMO');
ALTER TABLE [dbo].[Payment] ADD CONSTRAINT [CK_Payment_status] CHECK ([status]='CONFIRMED');
ALTER TABLE [dbo].[Payment] ADD CONSTRAINT [CK_Payment_method_shape] CHECK (([method]='CASH' AND [confirmed_by] IS NOT NULL AND [payment_request_id] IS NULL AND [provider_transaction_ref] IS NULL) OR ([method]='MOMO' AND [payment_request_id] IS NOT NULL AND [provider_transaction_ref] IS NOT NULL AND [confirmed_by] IS NULL));
ALTER TABLE [dbo].[RefundRequest] ADD CONSTRAINT [CK_RefundRequest_source] CHECK (([reason]='LINE_CANCELLED' AND [allocation_id] IS NOT NULL) OR ([reason] IN ('OVERPAYMENT','LATE_PAYMENT') AND [allocation_id] IS NULL));
ALTER TABLE [dbo].[FileObject] ADD CONSTRAINT [CK_FileObject_https] CHECK ([url] LIKE N'https://%' AND [byte_size]>0);
ALTER TABLE [dbo].[VideoParticipation] ADD CONSTRAINT [CK_VideoParticipation_range] CHECK ([left_at] IS NULL OR [left_at]>=[joined_at]);
ALTER TABLE [dbo].[VitalSign] ADD CONSTRAINT [CK_VitalSign_present] CHECK (COALESCE([temperature_c],[pulse_bpm],[systolic_mmhg],[diastolic_mmhg],[respiratory_rate],[spo2_percent],[weight_kg],[height_cm]) IS NOT NULL);
ALTER TABLE [dbo].[VitalSign] ADD CONSTRAINT [CK_VitalSign_temperature_c] CHECK ([temperature_c] > 0);
ALTER TABLE [dbo].[VitalSign] ADD CONSTRAINT [CK_VitalSign_pulse_bpm] CHECK ([pulse_bpm] > 0);
ALTER TABLE [dbo].[VitalSign] ADD CONSTRAINT [CK_VitalSign_systolic_mmhg] CHECK ([systolic_mmhg] > 0);
ALTER TABLE [dbo].[VitalSign] ADD CONSTRAINT [CK_VitalSign_diastolic_mmhg] CHECK ([diastolic_mmhg] > 0);
ALTER TABLE [dbo].[VitalSign] ADD CONSTRAINT [CK_VitalSign_respiratory_rate] CHECK ([respiratory_rate] > 0);
ALTER TABLE [dbo].[VitalSign] ADD CONSTRAINT [CK_VitalSign_spo2_percent] CHECK ([spo2_percent] > 0 AND [spo2_percent]<=100);
ALTER TABLE [dbo].[VitalSign] ADD CONSTRAINT [CK_VitalSign_weight_kg] CHECK ([weight_kg] > 0);
ALTER TABLE [dbo].[VitalSign] ADD CONSTRAINT [CK_VitalSign_height_cm] CHECK ([height_cm] > 0);

CREATE UNIQUE INDEX [UX_Invoice_hold] ON [dbo].[Invoice] ([hold_id]) WHERE [hold_id] IS NOT NULL;

CREATE UNIQUE INDEX [UX_Appointment_occupied_slot] ON [dbo].[Appointment] ([online_slot_id]) WHERE [online_slot_id] IS NOT NULL AND [status]<>'CANCELLED';

CREATE UNIQUE INDEX [UX_ClinicalQueueEntry_active_order] ON [dbo].[ClinicalQueueEntry] ([order_id]) WHERE [status] IN ('WAITING','ACCEPTED','STARTED');

CREATE UNIQUE INDEX [UX_ResultVersion_unpublished_order] ON [dbo].[ResultVersion] ([order_id]) WHERE [status] IN ('DRAFT','CONFIRMED');

CREATE UNIQUE INDEX [UX_Diagnosis_primary_final] ON [dbo].[Diagnosis] ([encounter_id]) WHERE [is_primary]=1 AND [diagnosis_type]='FINAL';

CREATE UNIQUE INDEX [UX_Prescription_issued_encounter] ON [dbo].[Prescription] ([encounter_id]) WHERE [status]='ISSUED';

CREATE UNIQUE INDEX [UX_Payment_provider_transaction] ON [dbo].[Payment] ([method], [provider_transaction_ref]) WHERE [provider_transaction_ref] IS NOT NULL;

CREATE UNIQUE INDEX [UX_InvoiceLine_examination] ON [dbo].[InvoiceLine] ([invoice_id]) WHERE [line_type]='EXAMINATION';

CREATE INDEX [IX_WorkAssignment_staff_time] ON [dbo].[WorkAssignment] ([staff_id], [starts_at], [ends_at]);

CREATE INDEX [IX_WorkAssignment_availability] ON [dbo].[WorkAssignment] ([work_date], [mode], [specialty_id], [shift_id]);

CREATE INDEX [IX_Appointment_onsite_capacity] ON [dbo].[Appointment] ([onsite_assignment_id], [status]);

CREATE INDEX [IX_Appointment_doctor_mode] ON [dbo].[Appointment] ([doctor_id], [visit_mode], [status]);

CREATE INDEX [IX_Appointment_patient_history] ON [dbo].[Appointment] ([patient_id], [booked_at] DESC);

CREATE INDEX [IX_BookingHold_expiry] ON [dbo].[BookingHold] ([status], [expires_at]);

CREATE INDEX [IX_ClinicalOrder_expiry] ON [dbo].[ClinicalOrder] ([status], [expires_at], [started_at]);

CREATE INDEX [IX_ClinicalQueueEntry_room_queue] ON [dbo].[ClinicalQueueEntry] ([room_id], [status], [checked_in_at]);

CREATE INDEX [IX_ResultVersion_published] ON [dbo].[ResultVersion] ([order_id], [status], [version_no] DESC);

CREATE INDEX [IX_Invoice_patient_time] ON [dbo].[Invoice] ([patient_id], [issued_at]);

CREATE INDEX [IX_Payment_invoice_time] ON [dbo].[Payment] ([invoice_id], [paid_at]);

CREATE INDEX [IX_RefundRequest_pending] ON [dbo].[RefundRequest] ([status], [requested_at]);

CREATE INDEX [IX_AuditEvent_entity] ON [dbo].[AuditEvent] ([entity_type], [entity_id], [occurred_at]);

COMMIT TRANSACTION;
END TRY
BEGIN CATCH
    IF XACT_STATE() <> 0 ROLLBACK TRANSACTION;
    THROW;
END CATCH;
PRINT N'Suncare: 58 tables and constraints created successfully.';
