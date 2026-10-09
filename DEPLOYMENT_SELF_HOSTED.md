# Hướng Dẫn Tự Triển Khai (Self-Hosted Deployment)

Dự án **Sunflower Mentor & Emotional Garden** chạy trên kiến trúc hiện đại, hiệu năng cao và gọn nhẹ:
- **Backend**: Hono framework (TypeScript) trên Bun runtime, tích hợp Better Auth & SQLite WAL mode.
- **Frontend**: React 18, Vite, React Router v6, Tailwind CSS.

## 1. Triển khai Nhanh bằng Docker Compose

```bash
docker compose up -d --build
```
- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:8000`

## 2. Triển khai Local thủ công

### Backend
```bash
cd backend
bun install
bun run dev
```

### Frontend
```bash
cd frontend
bun install
bun run dev
```
Hoặc build tĩnh:
```bash
cd frontend
npm run build
npm run preview
```
