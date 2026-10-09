# Hướng Dẫn Triển Khai Hệ Thống Bền Vững (Self-Hosted + Cloudflare Tunnel)

Hệ thống được thiết kế chạy trực tiếp trên máy tính cá nhân hoặc máy chủ riêng, kết nối ra Internet bằng **Cloudflare Tunnel** (bảo mật, không cần mở cổng modem, chống DDoS và cấp SSL HTTPS miễn phí).

---

## Cách 1: Sử dụng Docker (Khuyên dùng cho máy chủ chuyên nghiệp)

Đã có sẵn file `docker-compose.yml` gồm 3 dịch vụ tự động liên kết:
1. **Database PostgreSQL 16**: Dữ liệu lưu vĩnh viễn trong volume `postgres_data`.
2. **Backend FastAPI**: Chạy tại cổng 8000.
3. **Frontend Next.js**: Chạy tại cổng 3000.

### Khởi chạy:
```bash
docker compose up -d --build
```

---

## Cách 2: Chạy trực tiếp trên Windows (Không cần cài Docker)

Đã chuẩn bị sẵn file chạy nhanh `start-local.bat`:
1. Nhấp đúp chuột vào file `start-local.bat`.
2. Hệ thống sẽ tự động bật 2 cửa sổ ngầm:
   - **Backend**: `http://localhost:8000` (FastAPI)
   - **Frontend**: `http://localhost:3000` (Next.js)

---

## Bước Kết Nối Ra Internet Với Cloudflare Tunnel (Miễn phí)

1. Cài đặt **cloudflared** trên Windows:
   Mở PowerShell với quyền Admin và gõ:
   ```powershell
   winget install --id Cloudflare.cloudflared
   ```

2. Đăng nhập vào trang quản trị: https://dash.cloudflare.com
   - Vào mục **Zero Trust** -> **Networks** -> **Tunnels** (hoặc truy cập nhanh: https://one.dash.cloudflare.com).
   - Bấm **Create a tunnel** -> Chọn **Cloudflared**.
   - Đặt tên tunnel: `khuvuoncamxuc`.
   - Copy lệnh cài đặt service do Cloudflare cung cấp (dạng `cloudflared.exe service install eyJh...`) và chạy trong terminal.

3. Cấu hình định tuyến tên miền (Public Hostnames):
   Trong mục cấu hình Tunnel trên Cloudflare, thêm 2 bản ghi:
   - **Bản ghi 1 (Web chính)**:
     - Subdomain: *(để trống hoặc www)*
     - Domain: `khuvuoncamxuc.app`
     - Service Type: `HTTP`
     - URL: `localhost:3000`
   - **Bản ghi 2 (API Backend)**:
     - Subdomain: `api`
     - Domain: `khuvuoncamxuc.app`
     - Service Type: `HTTP`
     - URL: `localhost:8000`

---
Như vậy, máy tính của bạn sẽ đóng vai trò là một máy chủ dữ liệu thực thụ, điện thoại từ bất kỳ đâu chỉ cần truy cập `https://khuvuoncamxuc.app` là sử dụng được vĩnh viễn và lưu dữ liệu thật 100%.
