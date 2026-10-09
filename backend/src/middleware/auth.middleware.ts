import { Context, Next } from "hono";
import { auth } from "@/auth";
import { db } from "@/db/client";
import { UserRole } from "@/common/types";

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  assigned_classes?: string[];
  assigned_subject?: string;
  student_id?: string | null;
}

export async function authMiddleware(c: Context, next: Next) {
  const session = await auth.api.getSession({
    headers: c.req.raw.headers
  });

  if (!session || !session.user) {
    const header = c.req.header("Authorization");
    if (header && header.startsWith("Bearer ")) {
      const token = header.substring(7);
      const user = db.query("SELECT id, email, name, role, assigned_classes, assigned_subject FROM users WHERE id = ?").get(token) as {
        id: string;
        email: string;
        name: string;
        role: string;
        assigned_classes: string | null;
        assigned_subject: string | null;
      } | null;

      if (user) {
        const student = db.query("SELECT id FROM students WHERE user_id = ?").get(user.id) as { id: string } | null;
        let assignedClasses: string[] = [];
        try {
          assignedClasses = JSON.parse(user.assigned_classes || "[]");
        } catch {
          assignedClasses = [];
        }
        c.set("user", {
          id: user.id,
          email: user.email,
          name: user.name,
          role: (user.role as UserRole) || UserRole.STUDENT,
          assigned_classes: assignedClasses,
          assigned_subject: user.assigned_subject || "Toán học",
          student_id: student?.id || null
        } satisfies AuthUser);
        return await next();
      }
    }
    return c.json({ detail: "Chưa đăng nhập" }, 401);
  }

  const user = session.user as unknown as {
    id: string;
    email: string;
    name: string;
    role?: string;
    assigned_classes?: string;
    assigned_subject?: string;
  };

  const student = db.query("SELECT id FROM students WHERE user_id = ?").get(user.id) as { id: string } | null;
  let assignedClasses: string[] = [];
  try {
    assignedClasses = JSON.parse(user.assigned_classes || "[]");
  } catch {
    assignedClasses = [];
  }

  c.set("user", {
    id: user.id,
    email: user.email,
    name: user.name,
    role: (user.role as UserRole) || UserRole.STUDENT,
    assigned_classes: assignedClasses,
    assigned_subject: user.assigned_subject || "Toán học",
    student_id: student?.id || null
  } satisfies AuthUser);

  await next();
}

export function roleGuard(allowedRoles: UserRole[]) {
  return async (c: Context, next: Next) => {
    const user = c.get("user") as AuthUser | undefined;
    if (!user) {
      return c.json({ detail: "Chưa đăng nhập" }, 401);
    }
    if (!allowedRoles.includes(user.role)) {
      return c.json({ detail: "Không có quyền truy cập chức năng này" }, 403);
    }
    await next();
  };
}
