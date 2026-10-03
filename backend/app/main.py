from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database import engine, Base
from app.routers import api

# Khởi tạo các bảng database SQLite
Base.metadata.create_all(bind=engine)

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
