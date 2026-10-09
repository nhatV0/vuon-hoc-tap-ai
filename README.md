# Sunflower Mentor & Emotional Garden (Trợ lý Hoa Hướng Dương & Khu Vườn Cảm Xúc)

Hệ thống web hỗ trợ học tập cá nhân hóa và chăm sóc sức khỏe tinh thần học đường dành cho học sinh THPT và giáo viên theo chương trình GDPT 2018.

---

## 🌻 Khởi Chạy Dự Án Cực Nhanh Bằng Bun

Dự án sử dụng **Bun** toàn diện từ backend đến frontend. Để khởi chạy đồng thời cả Backend (Hono) và Frontend (Vite + React Router):

```bash
# 1. Cài đặt dependencies cho backend và frontend (lần đầu)
cd backend && bun install && cd ../frontend && bun install && cd ..

# 2. Khởi chạy toàn bộ hệ thống
bun dev
```

- **Frontend Web App**: `http://localhost:3000`
- **Backend Hono API**: `http://localhost:8000`

---

## 🚀 Các lệnh phát triển độc lập

```bash
# Chỉ chạy Backend
bun run dev:backend

# Chỉ chạy Frontend
bun run dev:frontend

# Chạy toàn bộ kiểm thử bảo mật & nghiệp vụ
bun run test

# Build tĩnh frontend
bun run build
```

---

## 🛠️ Kiến Trúc Hệ Thống
- **Backend**: Hono framework (TypeScript) trên Bun runtime, Better Auth, Bun SQLite WAL mode.
- **Frontend**: React 18, Vite, React Router v6, Tailwind CSS, Shadcn UI primitives, KaTeX math text.
- **Bảo mật**: Đạt chuẩn kiểm thử API Security Pentest (BOLA/IDOR, RBAC, Mass Assignment, Zod validation).
