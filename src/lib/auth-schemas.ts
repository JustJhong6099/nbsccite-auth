import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .email("Please enter a valid email address")
    .refine((email) => email.endsWith("@nbsc.edu.ph"), {
      message: "Please use your official NBSC email address (@nbsc.edu.ph)",
    }),
  password: z.string().min(1, "Password is required"),
});

export const signupSchema = z
  .object({
    firstName: z
      .string()
      .min(2, "First name must be at least 2 characters")
      .max(50, "First name must be less than 50 characters"),
    lastName: z
      .string()
      .min(2, "Last name must be at least 2 characters")
      .max(50, "Last name must be less than 50 characters"),
    email: z
      .string()
      .email("Please enter a valid email address")
      .refine((email) => email.endsWith("@nbsc.edu.ph"), {
        message: "Please use your official NBSC email address (@nbsc.edu.ph)",
      }),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/(?=.*[0-9])/, "Password must contain at least one number"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export type LoginFormData = z.infer<typeof loginSchema>;
export type SignupFormData = z.infer<typeof signupSchema>;