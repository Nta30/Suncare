-- Idempotent seed: no passwords, no patient records, no assumed clinic hours/prices.
SET NOCOUNT ON;
SET QUOTED_IDENTIFIER ON;
SET ANSI_NULLS ON;
SET XACT_ABORT ON;
BEGIN TRY
BEGIN TRANSACTION;
INSERT INTO dbo.[Role] (code, name, account_type)
SELECT v.code,v.name,v.account_type
FROM (VALUES
 ('PATIENT',N'Bệnh nhân','PATIENT'),
 ('DOCTOR',N'Bác sĩ','STAFF'),
 ('LAB_STAFF',N'Nhân viên cận lâm sàng','STAFF'),
 ('DEPARTMENT_HEAD',N'Trưởng khoa','STAFF'),
 ('CASHIER',N'Thu ngân','STAFF'),
 ('SYSTEM_ADMIN',N'Quản trị hệ thống','STAFF')
) v(code,name,account_type)
WHERE NOT EXISTS (SELECT 1 FROM dbo.[Role] r WHERE r.code=v.code);

INSERT INTO dbo.Permission (code,description)
SELECT v.code,v.description FROM (VALUES
 ('APPOINTMENT_CREATE_SELF',N'Đặt lịch cho bản thân'),
 ('APPOINTMENT_CANCEL_SELF',N'Hủy lịch online của mình theo chính sách'),
 ('PROFILE_EDIT_SELF',N'Cập nhật thông tin cá nhân cho phép'),
 ('EMR_READ_SELF',N'Đọc hồ sơ đã công bố của mình'),
 ('ENCOUNTER_WRITE_ASSIGNED',N'Khám, chẩn đoán và kê đơn lượt được phân công'),
 ('EMR_READ_ASSIGNED',N'Đọc lịch sử bệnh nhân có lượt khám được phân công'),
 ('RESULT_REVIEW_ASSIGNED',N'Đánh giá kết quả của lượt khám được phân công'),
 ('ORDER_MANAGE_ASSIGNED',N'Tạo/hủy chỉ định thuộc lượt khám được phân công'),
 ('RESULT_WRITE_ASSIGNED',N'Tiếp nhận/thực hiện/phát hành CLS đúng phân công'),
 ('INVOICE_ISSUE_ASSIGNED',N'Lập/in hóa đơn lượt khám được phân công'),
 ('CASH_RECEIVE',N'Xác nhận thu tiền mặt'),
 ('REFUND_PROCESS',N'Xử lý hoàn tiền thủ công'),
 ('SCHEDULE_READ_SELF',N'Xem lịch làm việc cá nhân'),
 ('SCHEDULE_PUBLISH_DEPARTMENT',N'Phân và công bố lịch khoa được giao'),
 ('REPORT_EXPORT_SELF',N'Xuất lượt khám của bản thân'),
 ('REPORT_EXPORT_DEPARTMENT',N'Xuất thống kê khoa được giao'),
 ('REPORT_EXPORT_BILLING',N'Xuất hóa đơn, thu và hoàn tiền'),
 ('REPORT_EXPORT_ALL',N'Xuất thống kê toàn cơ sở'),
 ('ACCOUNT_MANAGE',N'Cấp/khóa tài khoản và gán vai trò'),
 ('CATALOG_MANAGE',N'Quản lý tổ chức, danh mục và giá')
) v(code,description)
WHERE NOT EXISTS (SELECT 1 FROM dbo.Permission p WHERE p.code=v.code);

INSERT INTO dbo.RolePermission(role_id,permission_id)
SELECT r.id,p.id FROM (VALUES
 ('PATIENT','APPOINTMENT_CREATE_SELF'),('PATIENT','APPOINTMENT_CANCEL_SELF'),
 ('PATIENT','PROFILE_EDIT_SELF'),('PATIENT','EMR_READ_SELF'),
 ('DOCTOR','PROFILE_EDIT_SELF'),('DOCTOR','ENCOUNTER_WRITE_ASSIGNED'),
 ('DOCTOR','EMR_READ_ASSIGNED'),('DOCTOR','RESULT_REVIEW_ASSIGNED'),
 ('DOCTOR','ORDER_MANAGE_ASSIGNED'),('DOCTOR','INVOICE_ISSUE_ASSIGNED'),
 ('DOCTOR','SCHEDULE_READ_SELF'),('DOCTOR','REPORT_EXPORT_SELF'),
 ('LAB_STAFF','PROFILE_EDIT_SELF'),('LAB_STAFF','RESULT_WRITE_ASSIGNED'),
 ('LAB_STAFF','SCHEDULE_READ_SELF'),
 ('DEPARTMENT_HEAD','PROFILE_EDIT_SELF'),('DEPARTMENT_HEAD','SCHEDULE_READ_SELF'),
 ('DEPARTMENT_HEAD','SCHEDULE_PUBLISH_DEPARTMENT'),('DEPARTMENT_HEAD','REPORT_EXPORT_DEPARTMENT'),
 ('CASHIER','PROFILE_EDIT_SELF'),('CASHIER','CASH_RECEIVE'),
 ('CASHIER','REFUND_PROCESS'),('CASHIER','REPORT_EXPORT_BILLING'),
 ('SYSTEM_ADMIN','PROFILE_EDIT_SELF'),('SYSTEM_ADMIN','ACCOUNT_MANAGE'),
 ('SYSTEM_ADMIN','CATALOG_MANAGE'),('SYSTEM_ADMIN','REPORT_EXPORT_ALL')
) v(role_code,permission_code)
JOIN dbo.[Role] r ON r.code=v.role_code
JOIN dbo.Permission p ON p.code=v.permission_code
WHERE NOT EXISTS (SELECT 1 FROM dbo.RolePermission x WHERE x.role_id=r.id AND x.permission_id=p.id);
COMMIT;
END TRY
BEGIN CATCH
    IF XACT_STATE()<>0 ROLLBACK;
    THROW;
END CATCH;
