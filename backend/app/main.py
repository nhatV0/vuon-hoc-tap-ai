from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from app.config import settings
from app.database import engine, Base
from app.models import User, UserRole, Classroom
from app.auth import hash_password
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
        "ALTER TABLE students ADD COLUMN target_block VARCHAR DEFAULT 'A00'",
        "ALTER TABLE students ADD COLUMN classroom VARCHAR DEFAULT '12A1'",
        "ALTER TABLE students ADD COLUMN selected_flower VARCHAR DEFAULT 'sunflower'",
        "ALTER TABLE students ADD COLUMN initial_password VARCHAR DEFAULT '123456'",
        "ALTER TABLE users ADD COLUMN assigned_classes JSON",
        "ALTER TABLE users ADD COLUMN assigned_subject VARCHAR DEFAULT 'Toán học'",
        "ALTER TABLE streak_inventories ADD COLUMN freeze_shields_available INTEGER DEFAULT 1",
        "ALTER TABLE streak_inventories ADD COLUMN grace_passes_available INTEGER DEFAULT 1",
        "ALTER TABLE streak_inventories ADD COLUMN restores_claimed_count INTEGER DEFAULT 0",
        "ALTER TABLE streak_inventories ADD COLUMN saved_streak_before_break INTEGER DEFAULT 0",
        "ALTER TABLE streak_inventories ADD COLUMN total_shields_used INTEGER DEFAULT 0",
        "ALTER TABLE streak_inventories ADD COLUMN last_shield_used_at DATETIME",
        "ALTER TABLE streak_inventories ADD COLUMN last_restore_used_at DATETIME",
        "ALTER TABLE streak_inventories ADD COLUMN quiz_tickets INTEGER DEFAULT 1",
        "ALTER TABLE streak_inventories ADD COLUMN holy_water INTEGER DEFAULT 0",
        "ALTER TABLE streak_inventories ADD COLUMN conquest_streak INTEGER DEFAULT 0",
        "ALTER TABLE streak_inventories ADD COLUMN last_daily_ticket_date DATE",
        "ALTER TABLE streak_inventories ADD COLUMN holy_water_claimed_count INTEGER DEFAULT 0",
        "ALTER TABLE streak_inventories ADD COLUMN quiz_stage_milestones_claimed JSON"
    ]:
        try:
            conn.execute(text(col_def))
            conn.commit()
        except Exception:
            pass
# Khởi tạo mặc định tài khoản Giáo Viên Quản Trị (TK: admin, MK: 123456)
from sqlalchemy.orm import Session
with Session(engine) as init_db:
    admin_user = init_db.query(User).filter(User.email.in_(["admin", "admin@sunflower.edu.vn"])).first()
    if not admin_user:
        admin_user = User(
            id="usr_admin_master",
            email="admin",
            name="Quản Trị Viên (Admin)",
            role=UserRole.ADMIN,
            assigned_classes=["ALL"],
            assigned_subject="ALL"
        )
        init_db.add(admin_user)
        init_db.commit()
    else:
        # Cập nhật quyền ADMIN và mật khẩu 123456
        admin_user.password_hash = hash_password("123456")
        admin_user.role = UserRole.ADMIN
        admin_user.assigned_classes = ["ALL"]
        admin_user.assigned_subject = "ALL"
        init_db.commit()
    if init_db.query(Classroom).count() == 0:
        for c_id, gr in [("12A1", "12"), ("12A2", "12"), ("12A3", "12"), ("11B1", "11"), ("11B2", "11"), ("10C1", "10")]:
            init_db.add(Classroom(id=c_id, name=f"Lớp {c_id}", grade=gr, description=f"Khối {gr} chuyên sâu"))
        init_db.commit()

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
