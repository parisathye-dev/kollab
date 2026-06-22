import { z } from "zod";

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

export const applyForGigSchema = z
  .object({
    gigId: z.string().uuid(),
    pitchText: z
      .string()
      .trim()
      .min(51, "Pitch must be more than 50 characters."),
    quotedRate: z.number().int().min(0, "Enter a valid quoted rate."),
    budgetMin: z.number().int().min(0),
    budgetMax: z.number().int().min(0),
  })
  .superRefine((value, context) => {
    if (
      value.quotedRate < value.budgetMin ||
      value.quotedRate > value.budgetMax
    ) {
      context.addIssue({
        code: "custom",
        message: "Quoted rate must be within the gig budget range.",
        path: ["quotedRate"],
      });
    }
  });

export const portfolioFileSchema = z
  .custom<File>(
    (value) => typeof File !== "undefined" && value instanceof File,
    "Choose a valid portfolio file.",
  )
  .refine((file) => file.size <= 50 * 1024 * 1024, {
    message: "Portfolio file must be 50MB or smaller.",
  })
  .refine(
    (file) =>
      ["image/jpeg", "image/png", "video/mp4", "application/pdf"].includes(
        file.type,
      ),
    {
      message: "Supported formats are JPG, PNG, MP4, and PDF.",
    },
  );

export const portfolioTitleSchema = z.object({
  id: z.string().min(1),
  title: z.string().trim().min(1, "Enter a title."),
});

export const portfolioDetailsSchema = z.object({
  id: z.string().min(1),
  title: z.string().trim().min(1, "Enter a title."),
  description: z.string().trim().max(180, "Description must be under 180 characters."),
});

export const artistProfileEditSchema = z
  .object({
    displayName: z.string().trim().min(2, "Enter your display name."),
    bio: z.string().trim().max(240, "Bio must be under 240 characters."),
    age: z.string().trim().max(2, "Age must be 2 digits or fewer."),
    city: z.string().trim().max(60, "City must be under 60 characters."),
    workStatus: z
      .string()
      .trim()
      .max(80, "Status must be under 80 characters."),
    expenses: z.string().trim().max(80, "Expenses must be under 80 characters."),
    degree: z.string().trim().max(80, "Degree must be under 80 characters."),
    customSkills: z
      .array(z.string().trim().min(1).max(32))
      .max(8, "Add no more than 8 custom skills."),
    appearance: z.enum(["light", "dark"]),
    avatarUrl: z.string().url().optional(),
    locationText: z.string().trim().min(2, "Enter your location."),
    skills: z.array(artistSkillSchema).min(1, "Select at least one skill."),
    rateMin: z.number().int().min(0, "Enter a valid rate."),
    isOpenToGigs: z.boolean(),
  })
  .strict();

export const browseFilterSchema = z
  .object({
    skill: z.union([artistSkillSchema, z.literal("all")]),
    budgetMin: z.number().int().min(0),
    budgetMax: z.number().int().min(0),
    distanceKm: z.number().int().min(1),
    workType: z.enum(["all", "in_person", "remote", "either"]),
  })
  .superRefine((value, context) => {
    if (value.budgetMax < value.budgetMin) {
      context.addIssue({
        code: "custom",
        message: "Maximum budget must be greater than minimum budget.",
        path: ["budgetMax"],
      });
    }
  });

export type ApplyForGigInput = z.infer<typeof applyForGigSchema>;
export type PortfolioTitleInput = z.infer<typeof portfolioTitleSchema>;
export type PortfolioDetailsInput = z.infer<typeof portfolioDetailsSchema>;
export type ArtistProfileEditInput = z.infer<typeof artistProfileEditSchema>;
export type BrowseFilterInput = z.infer<typeof browseFilterSchema>;
