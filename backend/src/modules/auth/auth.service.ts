import { AuthRepository } from "./auth.repository";
import { UserRegisterDto, UserLoginDto } from "./auth.schemas";
import { hashPassword, verifyPassword, generateToken, generateId } from "@/common/utils";
import { UserRole } from "@/common/types";

export class AuthService {
  constructor(private repo: AuthRepository) {}

  register(dto: UserRegisterDto) {
    if (dto.role === UserRole.TEACHER || dto.role === UserRole.ADMIN) {
      throw new Error("FORBIDDEN_ROLE");
    }
    const emailNorm = dto.email.trim().toLowerCase();
    const existing = this.repo.findByEmail(emailNorm);
    if (existing) {
      throw new Error("EMAIL_EXISTS");
    }
    const id = generateId("usr");
    const user = this.repo.create({
      id,
      email: emailNorm,
      password_hash: hashPassword(dto.password),
      name: dto.name.trim(),
      role: dto.role
    });
    const token = generateToken(user.id);
    return { token, user: { ...user, student_id: null } };
  }

  login(dto: UserLoginDto) {
    const input = dto.email.trim().toLowerCase();
    let user = this.repo.findByEmail(input);
    if (!user && (input === "admin" || input === "admin@sunflower.edu.vn")) {
      user = this.repo.findByEmail("admin@sunflower.edu.vn") || this.repo.findByEmail("admin");
    }
    if (!user || !verifyPassword(dto.password, user.password_hash)) {
      throw new Error("INVALID_CREDENTIALS");
    }
    const token = generateToken(user.id);
    const studentId = this.repo.findStudentIdByUserId(user.id);
    return { token, user: { ...user, student_id: studentId } };
  }
}
