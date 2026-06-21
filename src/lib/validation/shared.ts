import { z } from "zod";

export const notificationTypeSchema = z.enum([
  "NEW_APPLICATION",
  "APPLICATION_ACCEPTED",
  "WORK_SUBMITTED",
  "PAYMENT_RELEASED",
  "NEW_MESSAGE",
]);

export const chatMessageSchema = z
  .object({
    gigId: z.string().uuid(),
    content: z.string().trim().max(1000, "Message must stay under 1000 chars."),
  })
  .strict()
  .superRefine((value, context) => {
    if (value.content.length === 0) {
      context.addIssue({
        code: "custom",
        message: "Write a message or attach a file.",
        path: ["content"],
      });
    }
  });

export const deliverableFileSchema = z
  .custom<File>(
    (value) => typeof File !== "undefined" && value instanceof File,
    "Choose a valid attachment.",
  )
  .refine((file) => file.size <= 50 * 1024 * 1024, {
    message: "Attachment must be 50MB or smaller.",
  });

export const ratingSchema = z
  .object({
    gigId: z.string().uuid(),
    stars: z.number().int().min(1).max(5),
    reviewText: z
      .string()
      .trim()
      .max(200, "Review must be 200 characters or fewer."),
  })
  .strict();

export const submitWorkSchema = z
  .object({
    gigId: z.string().uuid(),
  })
  .strict();

export type ChatMessageInput = z.infer<typeof chatMessageSchema>;
export type RatingInput = z.infer<typeof ratingSchema>;
export type SubmitWorkInput = z.infer<typeof submitWorkSchema>;
