import { Database } from "bun:sqlite";
import { env } from "@/config/env";
import { hashPassword } from "@/common/utils";
import { CREATE_TABLES_SQL } from "@/db/schema";

const dbFile = env.DATABASE_URL.replace("sqlite:///", "").replace("sqlite://", "");
export const db = new Database(dbFile);

db.run("PRAGMA journal_mode = WAL;");
db.run("PRAGMA foreign_keys = ON;");

export function initDatabase() {
  db.run(CREATE_TABLES_SQL);

  const admin = db.query("SELECT id FROM users WHERE email = 'admin' OR email = 'admin@sunflower.edu.vn'").get();
  if (!admin) {
    db.run(
      "INSERT INTO users (id, email, password_hash, name, role, assigned_classes, assigned_subject) VALUES (?, ?, ?, ?, ?, ?, ?)",
      ["usr_admin_default", "admin@sunflower.edu.vn", hashPassword("123456"), "Quản Trị Viên", "admin", "[]", "Toán học"]
    );
  }

  const classCount = db.query("SELECT COUNT(*) as count FROM classrooms").get() as { count: number };
  if (classCount.count === 0) {
    const defaultClasses = [
      ["12A1", "Lớp 12A1", "12", "Khối 12 Tự Nhiên"],
      ["12A2", "Lớp 12A2", "12", "Khối 12 Tự Nhiên B"],
      ["12A3", "Lớp 12A3", "12", "Khối 12 Xã Hội"],
      ["11B1", "Lớp 11B1", "11", "Khối 11 Cơ Bản"],
      ["11B2", "Lớp 11B2", "11", "Khối 11 Tự Nhiên"],
      ["10C1", "Lớp 10C1", "10", "Khối 10 Tiêu Chuẩn"]
    ];
    for (const [id, name, grade, desc] of defaultClasses) {
      db.run("INSERT INTO classrooms (id, name, grade, description) VALUES (?, ?, ?, ?)", [id, name, grade, desc]);
    }
  }
}
