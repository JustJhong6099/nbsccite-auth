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
      }),
    password: z
      .string()
      .min(6, "Password must be at least 6 characters")
      .regex(/(?=.*[0-9])/, "Password must contain at least one number"),
    confirmPassword: z.string(),
    role: z.enum(["student", "faculty"], {
      message: "Please select your role",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  })
  .refine((data) => {
    // Extract the local part of the email (before @)
    const emailLocalPart = data.email.split("@")[0];
    // Check if email starts with a number (student email pattern)
    const isStudentEmail = /^\d/.test(emailLocalPart);
    
    // If the email starts with a number (student email) but role is faculty, reject
    if (isStudentEmail && data.role === "faculty") {
      return false;
    }
    
    return true;
  }, {
    message: "Student emails (starting with numbers) cannot be used for faculty registration. Please select 'Student' as your role.",
    path: ["role"],
  });

export type LoginFormData = z.infer<typeof loginSchema>;
export type SignupFormData = z.infer<typeof signupSchema>;