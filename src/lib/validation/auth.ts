import { z } from "zod";

export const profileRoleSchema = z.enum(["artist", "business"]);

export const registerSchema = z
  .object({
    role: profileRoleSchema,
    fullName: z.string().trim().min(2, "Enter your full name."),
    email: z.string().trim().email("Enter a valid email address."),
    password: z.string().min(8, "Password must be at least 8 characters."),
    confirmPassword: z.string().min(8, "Confirm your password."),
  })
  .superRefine((value, context) => {
    if (value.password !== value.confirmPassword) {
      context.addIssue({
        code: "custom",
        message: "Passwords do not match.",
        path: ["confirmPassword"],
      });
    }
  });

export const loginSchema = z.object({
  email: z.string().trim().email("Enter a valid email address."),
  password: z.string().min(1, "Enter your password."),
});

export const resetPasswordSchema = z.object({
  email: z.string().trim().email("Enter a valid email address."),
});

export const updatePasswordSchema = z
  .object({
    password: z.string().min(8, "Password must be at least 8 characters."),
    confirmPassword: z.string().min(8, "Confirm your password."),
  })
  .superRefine((value, context) => {
    if (value.password !== value.confirmPassword) {
      context.addIssue({
        code: "custom",
        message: "Passwords do not match.",
        path: ["confirmPassword"],
      });
    }
  });

export const avatarFileSchema = z
  .custom<File>(
    (value) => typeof File !== "undefined" && value instanceof File,
    "Choose a valid image file.",
  )
  .refine((file) => file.size <= 5 * 1024 * 1024, {
    message: "Avatar must be 5MB or smaller.",
  })
  .refine((file) => file.type.startsWith("image/"), {
    message: "Avatar must be an image file.",
  });

export const artistSkillSchema = z.enum([
  "reel_editor",
  "photographer",
  "graphic_designer",
  "ui_ux",
  "motion_designer",
  "copywriter",
  "videographer",
  "illustrator",
]);

export const artistOnboardingSchema = z
  .object({
    avatar_url: z.string().url().optional(),
    location_text: z.string().trim().min(2, "Enter your location."),
    skills: z.array(artistSkillSchema).min(1, "Select at least one skill."),
    rate_min: z.number().int().min(0, "Enter a minimum rate."),
    rate_max: z.number().int().min(0, "Enter a maximum rate."),
    is_open_to_gigs: z.boolean(),
  })
  .superRefine((value, context) => {
    if (value.rate_max < value.rate_min) {
      context.addIssue({
        code: "custom",
        message: "Maximum rate must be greater than minimum rate.",
        path: ["rate_max"],
      });
    }
  });

export const businessTypeSchema = z.enum([
  "cafe",
  "boutique",
  "hotel",
  "startup",
  "restaurant",
]);

export const businessOnboardingSchema = z.object({
  business_name: z.string().trim().min(2, "Enter your business name."),
  business_type: businessTypeSchema,
  location_text: z.string().trim().min(2, "Enter your location."),
  avatar_url: z.string().url().optional(),
});

export type ProfileRoleInput = z.infer<typeof profileRoleSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type UpdatePasswordInput = z.infer<typeof updatePasswordSchema>;
export type ArtistSkillInput = z.infer<typeof artistSkillSchema>;
export type ArtistOnboardingInput = z.infer<typeof artistOnboardingSchema>;
export type BusinessTypeInput = z.infer<typeof businessTypeSchema>;
export type BusinessOnboardingInput = z.infer<typeof businessOnboardingSchema>;
