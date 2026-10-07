from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from app.config import settings
from app.database import engine, Base
from app.routers import api

# Khởi tạo các bảng database SQLite
Base.metadata.create_all(bind=engine)

# Auto-migration an toàn cho SQLite khi thêm cột mới vào bảng đã tồn tại
with engine.connect() as conn:
    for col_def in [
        "ALTER TABLE students ADD COLUMN user_id VARCHAR",
        "ALTER TABLE students ADD COLUMN diagnostic_answers JSON",
        "ALTER TABLE students ADD COLUMN target_subjects JSON",
        "ALTER TABLE students ADD COLUMN emotion_scale INTEGER DEFAULT 4",
        "ALTER TABLE planned_tasks ADD COLUMN subject VARCHAR DEFAULT 'Toán học'",
        "ALTER TABLE daily_checkins ADD COLUMN emotion_scale INTEGER DEFAULT 4",
        "ALTER TABLE daily_checkins ADD COLUMN energy_level INTEGER DEFAULT 70",
        "ALTER TABLE daily_checkins ADD COLUMN confidence_stars INTEGER DEFAULT 3",
        "ALTER TABLE daily_checkins ADD COLUMN completed_subjects JSON",
        "ALTER TABLE daily_checkins ADD COLUMN micro_wins JSON",
        "ALTER TABLE daily_checkins ADD COLUMN bottleneck_key VARCHAR DEFAULT 'none'",
        "ALTER TABLE daily_checkins ADD COLUMN weekday_answer TEXT",
        "ALTER TABLE students ADD COLUMN target_block VARCHAR DEFAULT 'A00'"
    ]:
        try:
            conn.execute(text(col_def))
            conn.commit()
        except Exception:
            pass

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Hệ thống Trợ lý Học tập Cá nhân hóa & Khu Vườn Cảm Xúc Hoa Hướng Dương dành cho Học sinh & Giáo viên",
    version="1.0.0"
)

# Cấu hình CORS để Frontend Next.js kết nối mượt mà
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api.router)

@app.get("/")
def read_root():
    return {
        "status": "online",
        "app": settings.PROJECT_NAME,
        "docs": "/docs",
        "version": "1.0.0"
    }
