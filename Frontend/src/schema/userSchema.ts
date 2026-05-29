import { z } from "zod";

/* =========================
   ROLE DEFINITIONS
========================= */

// Signup roles
export const SignUpRoles = ["Customer", "Applicant"] as const;
export const SignUpRoleEnum = z.enum(SignUpRoles);

// Login roles
export const LoginRoles = [
  "Customer",
  "Applicant",
  "Restaurant_Owner",
  "Delivery_Agent",
  "Admin",
] as const;
export const LoginRoleEnum = z.enum(LoginRoles);

/* =========================
   USER SIGNUP SCHEMA
========================= */

export const userSignUpSchema = z.object({
  fullName: z
    .string()
    .min(1, "Name is required")
    .max(30, "Name is too long — please keep it under 30 characters"),

  role: SignUpRoleEnum,

  email: z.string().email("Invalid email address"),

  password: z
    .string()
    .min(6, "Password must be at least 6 characters long"),

  contact: z.string().refine((val) => /^\d{10}$/.test(val), {
    message: "Contact number must be exactly 10 digits",
  }),
});

export type SignUpInputState = z.infer<typeof userSignUpSchema>;

/* =========================
   GOOGLE SIGNUP SCHEMA
========================= */

export const googleSignUpSchema = z.object({
  fullName: z
    .string()
    .min(1, "Name is required")
    .max(30, "Name is too long"),

  role: SignUpRoleEnum,

  email: z.string().email("Invalid email address"),

  contact: z.string().regex(/^\d{10}$/, {
    message: "Contact number must be exactly 10 digits",
  }),
});

export type GoogleSignUpInputState = z.infer<typeof googleSignUpSchema>;

/* =========================
   LOGIN SCHEMA
========================= */

export const userLoginSchema = z.object({
  email: z.string().email("Invalid email address"),

  password: z
    .string()
    .min(6, "Password must be at least 6 characters"),

  role: LoginRoleEnum,
});

export type LoginInputState = z.infer<typeof userLoginSchema>;

/* =========================
   CHANGE PASSWORD SCHEMA
========================= */

export const changePasswordSchema = z
  .object({
    currentPassword: z
      .string()
      .min(6, "Password must be at least 6 characters long"),

    newPassword: z
      .string()
      .min(6, "Password must be at least 6 characters long"),

    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword !== data.currentPassword, {
    message: "New password should be different from current password",
    path: ["newPassword"],
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Confirm password must match new password",
    path: ["confirmPassword"],
  });

export type ChangePasswordState = z.infer<typeof changePasswordSchema>;
