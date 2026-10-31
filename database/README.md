# SQL Server — Suncare

## Chạy trên CSDL mới

Yêu cầu SQL Server 2019 trở lên, SSMS hoặc sqlcmd. Bộ script dùng schema `dbo`, thời gian UTC, tiền VND và chuỗi Unicode. Không chứa mật khẩu mặc định, tài khoản thật hoặc dữ liệu bệnh nhân.

1. Nếu chưa có database, chạy [00_create_database.sql](00_create_database.sql) trên `master`. Script chỉ tạo `Suncare` nếu chưa có, không ghi đè database cũ.
2. Chọn database **Suncare trống**, chạy [01_schema.sql](01_schema.sql). Script từ chối system database và database đã có bảng, không xóa dữ liệu. Tạo 58 bảng, 116 CHECK, PK/FK, UNIQUE, filtered indexes và chỉ mục tra cứu trong một transaction.
3. Chạy [02_seed_rbac.sql](02_seed_rbac.sql): 6 vai trò, 20 quyền, ánh xạ quyền. Có thể chạy lại, không reset quyền hay tài khoản đã tồn tại.
4. Chạy [03_reporting_views.sql](03_reporting_views.sql): 5 view số dư, tổng hợp hóa đơn, lượt khám, CLS chờ và chờ hoàn tiền.

Ví dụ từ thư mục gốc dự án, với Windows Authentication:

```powershell
sqlcmd -S localhost -E -C -I -b -i database/00_create_database.sql
sqlcmd -S localhost -d Suncare -E -C -I -b -i database/01_schema.sql
sqlcmd -S localhost -d Suncare -E -C -I -b -i database/02_seed_rbac.sql
sqlcmd -S localhost -d Suncare -E -C -I -b -i database/03_reporting_views.sql
```

Thay server theo máy của bạn; bản SQL Express thường dùng instance riêng. `-I` bật QUOTED_IDENTIFIER; các kết nối ghi dữ liệu phải bật ANSI_NULLS, ANSI_WARNINGS, ANSI_PADDING, ARITHABORT, CONCAT_NULL_YIELDS_NULL, QUOTED_IDENTIFIER và tắt NUMERIC_ROUNDABORT để dùng filtered index. `-C` tin certificate của server cho môi trường phát triển; cấu hình certificate tin cậy khi triển khai thực tế.

Nếu đã có database chứa dữ liệu, không chạy 01 lên đó: cần migration theo phiên bản, không sửa script initial để bỏ hàng rào này. Với Spring Boot, dùng migration quản lý schema, đặt Hibernate `ddl-auto=validate`, không dùng `create`/`update` để tự thay schema đã chốt.

## Cấu hình và khởi tạo admin

Chưa seed giờ ca, giá, sức chứa, thông tin cơ sở hay merchant MoMo vì chưa có giá trị được xác nhận. Sau khi tạo admin bằng backend/bootstrap có kiểm soát:

- Tạo Staff → Account loại STAFF → AccountRole SYSTEM_ADMIN trong một transaction. Password phải là hash do bộ mã hóa của backend tạo, không đặt mật khẩu mẫu trong SQL. AccountRole.granted_by tham chiếu chính Account admin ở lần bootstrap đầu.
- Tạo hai SystemSetting: `CLS_VALIDITY_DAYS = 10`, `ONLINE_HOLD_SECONDS = 300`, changed_by là admin. Trước khi có setting, backend dùng các giá trị mặc định này và không nhận giá trị tùy ý từ client.
- Khởi tạo khoa/chuyên khoa/phòng/ca, nhân viên, giá và lịch qua luồng quản trị. Bệnh nhân chỉ tự đăng ký loại PATIENT.
- Các cột status và code cần backend điền rõ ràng. Không sinh mã bằng `MAX(id)+1`; dùng sequence hoặc mã ngẫu nhiên có retry trên UNIQUE.
- `created_at` mặc định UTC; `updated_at` chỉ mặc định khi INSERT, backend phải cập nhật khi UPDATE. Rowversion do SQL Server sinh, không tự ghi từ Java.
- ID và mã nghiệp vụ không được sửa/tái sử dụng; hạn chế quyền cập nhật các cột này trong tầng ghi dữ liệu. Ảnh đại diện và ảnh CLS lưu Cloudinary URL/public_id; secret Cloudinary/MoMo đặt ngoài DB.

## Giới hạn thực thi của SQL

Schema bảo vệ kiểu dữ liệu, FK, XOR Patient/Staff, hình thức đặt lịch, slot 20 phút, hold 5 phút, mốc bắt đầu trước hạn, unique giao dịch, một slot đang chiếm, một queue active và các miền trạng thái. Không có Person, CreditNote hoặc snapshot mã bệnh nhân/dịch vụ.

Các điều kiện liên bảng và quyền nghiệp vụ **chưa được thay bằng stored procedure/trigger**: xác minh callback MoMo, cân bằng bác sĩ, chống vượt sức chứa ca/giao thời gian assignment, đúng khoa/phòng/phân công, Role khớp loại Account, bất biến chứng từ, tổng phân bổ/hoàn không vượt tiền, duy nhất phí khám theo Encounter, điều kiện hoàn tất và mốc hủy 24h. Backend phải dùng transaction/khóa theo [tài liệu giao dịch](../docs/05-giao-dich-rang-buoc.md); không cấp quyền DML trực tiếp cho người dùng cuối. Schema chưa phải toàn bộ ứng dụng vận hành.

Các view không tự phân quyền theo tài khoản. Backend phải lọc doctor/department/patient trước trả dữ liệu hoặc xuất CSV. Invoice.total_amount giữ tổng gốc; v_InvoiceSummary.outstanding bỏ khoản thu của dòng CANCELLED và không trừ nhầm phần hoàn chưa chi vào tiền thực thu.

## Kiểm chứng

```powershell
# Tạo database tên GUID riêng, chạy schema + seed hai lần + views + smoke test,
# DBCC kiểm tra constraint, rồi xóa đúng database tạm đã tạo trong finally.
.\database\validate.ps1 -Server 'lpc:.'
```

Cần quyền tạo/xóa database để chạy validator. Nếu chỉ có quyền trên database dự án, chạy [04_smoke_test.sql](04_smoke_test.sql) sau cài đặt trên database thử nghiệm; dữ liệu test được rollback, nhưng identity có thể bị tiêu thụ. Không dùng smoke test làm seed dữ liệu demo.

Đã chạy thành công trên SQL Server cục bộ ngày 2026-11-01: schema, seed lặp, 5 views, smoke test và DBCC CHECKCONSTRAINTS; database tạm đã được dọn. Smoke test kiểm tra XOR, ảnh URL/public_id, slot 20 phút, hạn CLS, nhiều lượt quay lại lab, nhiều thanh toán tiền mặt, số dư khi hủy và grain báo cáo. **Chưa chạy 49 ca kiểm thử nghiệp vụ/backend, cạnh tranh hai kết nối hoặc tích hợp MoMo/Cloudinary.**

`build-schema.mjs` tái tạo 01 từ từ điển và các ràng buộc bổ sung; dùng Node.js built-in, không cần npm install. Chạy khi thay thiết kế trước triển khai, review diff rồi chạy validator. Khi đã áp dụng schema ở môi trường có dữ liệu, mọi thay đổi mới phải thành migration riêng.
