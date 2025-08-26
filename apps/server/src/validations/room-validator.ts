import { z } from "zod";

export const createRoomSchema = z.object({
  name: z
    .string()
    .min(3, "Room name is required")
    .max(15, "Room name too long"),
  isPublic: z.boolean().default(true),
  limit: z
    .number()
    .int()
    .min(2, "Room limit must be at least 1")
    .max(8, "Room limit cannot exceed 8")
    .default(1),
  categorySlug: z.string(),
  createdBy: z.string(),
});

export const updateRoomSchema = z.object({
  id: z.uuid("Invalid room ID"),
  name: z.string().min(1).max(100).optional(),
  isPublic: z.boolean().optional(),
  limit: z
    .number()
    .int()
    .min(2, "Room limit must be at least 2")
    .max(8, "Room limit cannot exceed 8")
    .optional(),
  categorySlug: z.string().optional(),
  joinCode: z.string().nullable(),
});

export function validateCreateRoom(input: unknown) {
  const result = createRoomSchema.safeParse(input);
  if (!result.success) return { success: false, errors: result.error.issues };
  return { success: true, data: result.data };
}

export function validateUpdateRoom(input: unknown) {
  const result = updateRoomSchema.safeParse(input);
  if (!result.success) return { success: false, errors: result.error.issues };
  return { success: true, data: result.data };
}
