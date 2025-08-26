import { z } from "zod";

export const createCategorySchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name too long"),
  description: z.string().max(500, "Description too long").optional(),
});

export const updateCategorySchema = z.object({
  id: z.uuid("Invalid category ID"),
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
});

export function validateCreateCategory(input: unknown) {
  const result = createCategorySchema.safeParse(input);
  if (!result.success) return { success: false, errors: result.error.issues };
  return { success: true, data: result.data };
}

export function validateUpdateCategory(input: unknown) {
  const result = updateCategorySchema.safeParse(input);
  if (!result.success) return { success: false, errors: result.error.issues };
  return { success: true, data: result.data };
}
