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
    full_name: z
      .string()
      .min(2, "Full name must be at least 2 characters")
      .max(100, "Full name must be less than 100 characters"),
    email: z
      .string()
      .email("Please enter a valid email address")
      .refine((email) => email.endsWith("@nbsc.edu.ph"), {
        message: "Please use your official NBSC email address (@nbsc.edu.ph)",
      })
      .refine((email) => {
        const emailLocalPart = email.split("@")[0];
        const startsWithNumber = /^\d/.test(emailLocalPart);
        const startsWithLetter = /^[a-zA-Z]/.test(emailLocalPart);
        return startsWithNumber || startsWithLetter;
      }, {
        message: "Invalid email format. Student emails must start with numbers (e.g., 20211199@nbsc.edu.ph) and faculty emails must start with letters (e.g., jhongemata@nbsc.edu.ph)",
      }),
    password: z
      .string()
      .min(6, "Password must be at least 6 characters")
      .regex(/(?=.*[0-9])/, "Password must contain at least one number"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export type LoginFormData = z.infer<typeof loginSchema>;
export type SignupFormData = z.infer<typeof signupSchema>;