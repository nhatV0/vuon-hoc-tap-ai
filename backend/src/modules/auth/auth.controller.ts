import { Context } from "hono";
import { AuthService } from "./auth.service";
import { UserRegisterSchema, UserLoginSchema } from "./auth.schemas";
import { AuthUser } from "@/middleware/auth.middleware";

export class AuthController {
  constructor(private service: AuthService) {}

  register = async (c: Context) => {
    try {
      const body = await c.req.json();
      const dto = UserRegisterSchema.parse(body);
      const res = this.service.register(dto);
      return c.json(res, 201);
    } catch (err) {
      if (err instanceof Error) {
        if (err.message === "FORBIDDEN_ROLE") {
          return c.json({ detail: "Tài khoản Giáo viên không thể tự đăng ký. Phải do Admin khởi tạo." }, 403);
        }
        if (err.message === "EMAIL_EXISTS") {
          return c.json({ detail: "Email này đã được sử dụng" }, 400);
        }
      }
      return c.json({ detail: "Dữ liệu đăng ký không hợp lệ", error: String(err) }, 400);
    }
  };

  login = async (c: Context) => {
    try {
      const body = await c.req.json();
      const dto = UserLoginSchema.parse(body);
      const res = this.service.login(dto);
      return c.json(res, 200);
    } catch (err) {
      if (err instanceof Error && err.message === "INVALID_CREDENTIALS") {
        return c.json({ detail: "Email hoặc mật khẩu không chính xác" }, 401);
      }
      return c.json({ detail: "Đăng nhập thất bại", error: String(err) }, 400);
    }
  };

  me = async (c: Context) => {
    const user = c.get("user") as AuthUser;
    return c.json(user, 200);
  };
}
