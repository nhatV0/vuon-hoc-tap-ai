import { db } from "@/db/client";
import { UserRole } from "@/common/types";

export interface UserEntity {
  id: string;
  email: string;
  password_hash: string;
  name: string;
  role: UserRole;
  assigned_classes: string;
  assigned_subject: string;
  created_at: string;
}

export class AuthRepository {
  findByEmail(email: string): UserEntity | null {
    return db.query("SELECT * FROM users WHERE email = ?").get(email) as UserEntity | null;
  }

  findById(id: string): UserEntity | null {
    return db.query("SELECT * FROM users WHERE id = ?").get(id) as UserEntity | null;
  }

  findStudentIdByUserId(userId: string): string | null {
    const row = db.query("SELECT id FROM students WHERE user_id = ?").get(userId) as { id: string } | null;
    return row?.id ?? null;
  }

  create(user: { id: string; email: string; password_hash: string; name: string; role: UserRole }): UserEntity {
    db.run(
      "INSERT INTO users (id, email, password_hash, name, role, assigned_classes, assigned_subject) VALUES (?, ?, ?, ?, ?, '[]', 'Toán học')",
      [user.id, user.email, user.password_hash, user.name, user.role]
    );
    return this.findById(user.id)!;
  }
}
