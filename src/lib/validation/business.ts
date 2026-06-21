import { z } from "zod";
import { artistSkillSchema } from "@/lib/validation/artist";

const twentyMb = 20 * 1024 * 1024;

function isValidDeadline(value: string): boolean {
  const selectedDate = new Date(`${value}T00:00:00`);

  if (Number.isNaN(selectedDate.getTime())) {
    return false;
  }

  const minimumDate = new Date();
  minimumDate.setHours(0, 0, 0, 0);
  minimumDate.setDate(minimumDate.getDate() + 2);

  return selectedDate >= minimumDate;
}

export const businessRadiusSchema = z.union([
  z.literal(5),
  z.literal(10),
  z.literal(25),
  z.literal(999),
]);

export const workTypeSchema = z.enum(["in_person", "remote", "either"]);

export const referenceFileSchema = z
  .custom<File>(
    (value) => typeof File !== "undefined" && value instanceof File,
    "Choose a valid reference file.",
  )
  .refine((file) => file.size <= twentyMb, {
    message: "Each reference file must be 20MB or smaller.",
  });

export const referenceFilesSchema = z
  .array(referenceFileSchema)
  .max(3, "Upload no more than 3 reference files.");

export const postGigSchema = z
  .object({
    skillRequired: artistSkillSchema,
    title: z.string().trim().min(6, "Enter a clear gig title."),
    description: z
      .string()
      .trim()
      .min(100, "Description must be at least 100 characters."),
    budgetMin: z
      .number()
      .int()
      .min(500, "Minimum budget must be at least Rs 500.")
      .max(25000, "Minimum budget must be Rs 25,000 or lower."),
    budgetMax: z
      .number()
      .int()
      .min(500, "Maximum budget must be at least Rs 500.")
      .max(25000, "Maximum budget must be Rs 25,000 or lower."),
    deadline: z
      .string()
      .trim()
      .refine(isValidDeadline, "Deadline must be at least 2 days from today."),
    workType: workTypeSchema,
    locationText: z.string().trim().min(2, "Enter the gig location."),
    radiusKm: businessRadiusSchema,
  })
  .strict()
  .superRefine((value, context) => {
    if (value.budgetMax < value.budgetMin) {
      context.addIssue({
        code: "custom",
        message: "Maximum budget must be greater than minimum budget.",
        path: ["budgetMax"],
      });
    }
  });

export const businessArtistFilterSchema = z
  .object({
    skill: z.union([artistSkillSchema, z.literal("all")]),
    maxBudget: z.number().int().min(500).max(25000),
    distanceKm: z.number().int().min(1).max(100),
    ratingMinimum: z.number().min(0).max(5),
  })
  .strict();

export const inviteArtistSchema = z
  .object({
    artistId: z.string().uuid(),
    gigId: z.string().uuid(),
  })
  .strict();

export const applicationDecisionSchema = z
  .object({
    applicationId: z.string().uuid(),
  })
  .strict();

export const businessReviewSchema = z
  .object({
    gigId: z.string().uuid(),
    action: z.enum(["approve", "revision", "dispute"]),
    message: z.string().trim().max(400, "Message must stay under 400 chars."),
    stars: z.number().int().min(1).max(5).optional(),
    reviewText: z.string().trim().max(240).optional(),
  })
  .strict()
  .superRefine((value, context) => {
    if (value.action === "approve" && value.stars === undefined) {
      context.addIssue({
        code: "custom",
        message: "Choose a rating before approving work.",
        path: ["stars"],
      });
    }

    if (value.action !== "approve" && value.message.length < 12) {
      context.addIssue({
        code: "custom",
        message: "Add a short note for the artist or KOLLAB team.",
        path: ["message"],
      });
    }
  });

export const historySortSchema = z.enum(["date", "amount", "rating"]);

export type PostGigInput = z.infer<typeof postGigSchema>;
export type BusinessArtistFilterInput = z.infer<
  typeof businessArtistFilterSchema
>;
export type InviteArtistInput = z.infer<typeof inviteArtistSchema>;
export type ApplicationDecisionInput = z.infer<
  typeof applicationDecisionSchema
>;
export type BusinessReviewInput = z.infer<typeof businessReviewSchema>;
export type HistorySortInput = z.infer<typeof historySortSchema>;
