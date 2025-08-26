import { z } from "zod";

export const createQuestionSchema = z.object({
  content: z
    .string()
    .min(1, "Content is required")
    .max(200, "Content too long"),
});

export const updateQuestionSchema = z.object({
  id: z.uuid("Invalid category ID"),
  content: z
    .string()
    .min(1, "Content is required")
    .max(200, "Content too long")
    .optional(),
});

export function validateCreateQuestion(input: unknown) {
  const result = createQuestionSchema.safeParse(input);
  if (!result.success) return { success: false, errors: result.error.issues };
  return { success: true, data: result.data };
}

export function validateUpdateQuestion(input: unknown) {
  const result = updateQuestionSchema.safeParse(input);
  if (!result.success) return { success: false, errors: result.error.issues };
  return { success: true, data: result.data };
}
