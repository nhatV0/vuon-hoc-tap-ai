import { z } from "zod";
import { UserRole } from "@/common/types";

export const UserRegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(2),
  role: z.nativeEnum(UserRole).default(UserRole.STUDENT)
});

export const UserLoginSchema = z.object({
  email: z.string().min(1),
  password: z.string().min(1)
});

export type UserRegisterDto = z.infer<typeof UserRegisterSchema>;
export type UserLoginDto = z.infer<typeof UserLoginSchema>;
