import {
  validateCreateCategory,
  validateUpdateCategory,
} from "@/validations/category-validator";
import type { Context } from "hono";
import { db } from "@/db";
import { category } from "@/db/schema/category";
import { generateId } from "@/lib/generateID";
import { generateSlug } from "@/lib/generateSlug";
import { zodErrorToMessage } from "@/lib/zod-error-message";
import { eq } from "drizzle-orm";

interface CategoryResponse {
  message: string;
  category: typeof category.$inferSelect;
}

interface ApiError {
  error: string;
  code?: string;
  details?: any;
}

interface DatabaseError extends Error {
  code?: string;
  constraint?: string;
  detail?: string;
}

export const createCategory = async (c: Context): Promise<Response> => {
  try {
    const body = await c.req.json();

    const validatedBody = validateCreateCategory(body);

    if (!validatedBody.success || !validatedBody.data) {
      return c.json(
        {
          success: false,
          message: zodErrorToMessage(validatedBody.errors),
        },
        400
      );
    }

    const data = validatedBody.data;

    const id = generateId();
    const slug = generateSlug(data.name);

    const newCategory = await db
      .insert(category)
      .values({
        id,
        name: data.name,
        description: data.description,
        slug,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    const successResponse: CategoryResponse = {
      message: "Category created successfully",
      category: newCategory[0],
    };
    return c.json(successResponse, 201);
  } catch (error) {
    console.error(error);

    const dbError = error as DatabaseError;

    if (dbError.code === "23505") {
      const errorResponse: ApiError = {
        error: "Category with this slug already exists",
        code: "DUPLICATE_SLUG",
        details: { constraint: dbError.constraint },
      };
      return c.json(errorResponse, 409);
    }
    return c.json(
      {
        success: false,
        message: "Internal server error",
      },
      500
    );
  }
};

export const getCategory = async (c: Context): Promise<Response> => {
  try {
    const { id } = c.req.param();

    if (id) {
      const categoryData = await db
        .select()
        .from(category)
        .where(eq(category.id, id))
        .limit(1);

      if (categoryData.length === 0) {
        const categoryBySlug = await db
          .select()
          .from(category)
          .where(eq(category.slug, id))
          .limit(1);

        if (categoryBySlug.length === 0) {
          const errorResponse: ApiError = {
            error: "Category not found",
            code: "NOT_FOUND",
            details: { searchedId: id },
          };
          return c.json(errorResponse, 404);
        }

        const successResponse: { category: typeof category.$inferSelect } = {
          category: categoryBySlug[0],
        };
        return c.json(successResponse);
      }

      const successResponse: { category: typeof category.$inferSelect } = {
        category: categoryData[0],
      };
      return c.json(successResponse);
    } else {
      const categories = await db.select().from(category);
      const successResponse = { categories };
      return c.json(successResponse);
    }
  } catch (error: unknown) {
    console.error("Error fetching category:", error);

    const errorResponse: ApiError = {
      error: "Internal server error",
      code: "INTERNAL_ERROR",
    };
    return c.json(errorResponse, 500);
  }
};

export const getCategoryBySlug = async (c: Context): Promise<Response> => {
  try {
    const { slug } = c.req.param();

    if (!slug) {
      const errorResponse: ApiError = {
        error: "Category slug is required",
        code: "VALIDATION_ERROR",
      };
      return c.json(errorResponse, 400);
    }

    const categoryData = await db
      .select()
      .from(category)
      .where(eq(category.slug, slug))
      .limit(1);

    if (categoryData.length === 0) {
      const errorResponse: ApiError = {
        error: "Category not found",
        code: "NOT_FOUND",
        details: { searchedSlug: slug },
      };
      return c.json(errorResponse, 404);
    }

    const successResponse: { category: typeof category.$inferSelect } = {
      category: categoryData[0],
    };
    return c.json(successResponse);
  } catch (error: unknown) {
    console.error("Error fetching category by slug:", error);

    const errorResponse: ApiError = {
      error: "Internal server error",
      code: "INTERNAL_ERROR",
    };
    return c.json(errorResponse, 500);
  }
};

export const updateCategory = async (c: Context): Promise<Response> => {
  try {
    const { id } = c.req.param();
    const body = await c.req.json();

    const validatedBody = validateUpdateCategory(body);

    if (!validatedBody.success || !validatedBody.data) {
      const errorResponse: ApiError = {
        error: zodErrorToMessage(validatedBody.errors),
        code: "VALIDATION_ERROR",
      };
      return c.json(errorResponse, 400);
    }

    const { name, description } = validatedBody.data;

    if (!id) {
      const errorResponse: ApiError = {
        error: "Category ID is required",
        code: "VALIDATION_ERROR",
      };
      return c.json(errorResponse, 400);
    }

    const existingCategory = await db
      .select()
      .from(category)
      .where(eq(category.id, id))
      .limit(1);

    if (existingCategory.length === 0) {
      const errorResponse: ApiError = {
        error: "Category not found",
        code: "NOT_FOUND",
        details: { categoryId: id },
      };
      return c.json(errorResponse, 404);
    }

    const updateData: Partial<typeof category.$inferInsert> & {
      updatedAt: Date;
    } = {
      updatedAt: new Date(),
    };

    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;

    const updatedCategory = await db
      .update(category)
      .set(updateData)
      .where(eq(category.id, id))
      .returning();

    const successResponse: CategoryResponse = {
      message: "Category updated successfully",
      category: updatedCategory[0],
    };

    return c.json(successResponse);
  } catch (error: unknown) {
    console.error("Error updating category:", error);

    const errorResponse: ApiError = {
      error: "Internal server error",
      code: "INTERNAL_ERROR",
    };
    return c.json(errorResponse, 500);
  }
};

export const deleteCategory = async (c: Context): Promise<Response> => {
  try {
    const { id } = c.req.param();

    if (!id) {
      const errorResponse: ApiError = {
        error: "Category ID is required",
        code: "VALIDATION_ERROR",
      };
      return c.json(errorResponse, 400);
    }

    const existingCategory = await db
      .select()
      .from(category)
      .where(eq(category.id, id))
      .limit(1);

    if (existingCategory.length === 0) {
      const errorResponse: ApiError = {
        error: "Category not found",
        code: "NOT_FOUND",
        details: { categoryId: id },
      };
      return c.json(errorResponse, 404);
    }

    await db.delete(category).where(eq(category.id, id));

    const successResponse = {
      message: "Category deleted successfully",
    };
    return c.json(successResponse);
  } catch (error: unknown) {
    console.error("Error deleting category:", error);

    const errorResponse: ApiError = {
      error: "Internal server error",
      code: "INTERNAL_ERROR",
    };
    return c.json(errorResponse, 500);
  }
};
