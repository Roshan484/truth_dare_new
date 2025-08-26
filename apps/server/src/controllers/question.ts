import type { Context } from "hono";
import { db } from "../db"; // Adjust path to your database instance

import { eq } from "drizzle-orm";
import {
  validateCreateQuestion,
  validateUpdateQuestion,
} from "@/validations/questions-validator";
import { question } from "@/db/schema/questions";
import { generateId } from "@/lib/generateID";
import { category } from "@/db/schema/category";

interface ApiError {
  error: string;
  code: string;
  details?: Record<string, any>;
}

interface DeleteResponse {
  message: string;
}

interface GetAllResponse {
  data: any[];
  pagination: {
    page: number;
    limit: number;
    offset: number;
  };
}

interface DatabaseError {
  code: string;
  constraint?: string;
}

export const createQuestion = async (c: Context): Promise<Response> => {
  try {
    const body = await c.req.json();
    const validation = validateCreateQuestion(body);

    if (!validation.success || !validation.data) {
      const errorResponse: ApiError = {
        error: "Validation failed",
        code: "VALIDATION_ERROR",
        details: { errors: validation.errors },
      };
      return c.json(errorResponse, 400);
    }

    const { content } = validation.data;
    const { categorySlug } = body;

    if (!categorySlug) {
      const errorResponse: ApiError = {
        error: "Category slug is required",
        code: "VALIDATION_ERROR",
      };
      return c.json(errorResponse, 400);
    }
    const existingCategory = await db
      .select()
      .from(category)
      .where(eq(category.slug, categorySlug))
      .limit(1);

    if (existingCategory.length === 0) {
      const errorResponse: ApiError = {
        error: "Category not found",
        code: "NOT_FOUND",
        details: { categorySlug },
      };
      return c.json(errorResponse, 404);
    }
    const id = generateId();
    const newQuestion = await db
      .insert(question)
      .values({
        id,
        categorySlug: categorySlug,
        content,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    const successResponse = {
      message: "Question created successfully",
      data: newQuestion[0],
    };
    return c.json(successResponse, 201);
  } catch (error: unknown) {
    console.error("Error creating question:", error);

    const dbError = error as DatabaseError;

    if (dbError.code === "23503") {
      const errorResponse: ApiError = {
        error: "Category not found",
        code: "FOREIGN_KEY_CONSTRAINT",
        details: { constraint: dbError.constraint },
      };
      return c.json(errorResponse, 409);
    }

    const errorResponse: ApiError = {
      error: "Internal server error",
      code: "INTERNAL_ERROR",
    };
    return c.json(errorResponse, 500);
  }
};

export const updateQuestion = async (c: Context): Promise<Response> => {
  try {
    const { id } = c.req.param();

    if (!id) {
      const errorResponse: ApiError = {
        error: "Question ID is required",
        code: "VALIDATION_ERROR",
      };
      return c.json(errorResponse, 400);
    }

    const body = await c.req.json();
    const validation = validateUpdateQuestion({ id, ...body });

    if (!validation.success || !validation.data) {
      const errorResponse: ApiError = {
        error: "Validation failed",
        code: "VALIDATION_ERROR",
        details: { errors: validation.errors },
      };
      return c.json(errorResponse, 400);
    }

    const { content } = validation.data;

    const existingQuestion = await db
      .select()
      .from(question)
      .where(eq(question.id, id))
      .limit(1);

    if (existingQuestion.length === 0) {
      const errorResponse: ApiError = {
        error: "Question not found",
        code: "NOT_FOUND",
        details: { questionId: id },
      };
      return c.json(errorResponse, 404);
    }

    const updateData: any = {
      updatedAt: new Date(),
    };

    if (content !== undefined) {
      updateData.content = content;
    }

    const updatedQuestion = await db
      .update(question)
      .set(updateData)
      .where(eq(question.id, id))
      .returning();

    const successResponse = {
      message: "Question updated successfully",
      data: updatedQuestion[0],
    };
    return c.json(successResponse);
  } catch (error: unknown) {
    console.error("Error updating question:", error);

    const errorResponse: ApiError = {
      error: "Internal server error",
      code: "INTERNAL_ERROR",
    };
    return c.json(errorResponse, 500);
  }
};

export const deleteQuestion = async (c: Context): Promise<Response> => {
  try {
    const { id } = c.req.param();

    if (!id) {
      const errorResponse: ApiError = {
        error: "Question ID is required",
        code: "VALIDATION_ERROR",
      };
      return c.json(errorResponse, 400);
    }

    const existingQuestion = await db
      .select()
      .from(question)
      .where(eq(question.id, id))
      .limit(1);

    if (existingQuestion.length === 0) {
      const errorResponse: ApiError = {
        error: "Question not found",
        code: "NOT_FOUND",
        details: { questionId: id },
      };
      return c.json(errorResponse, 404);
    }

    await db.delete(question).where(eq(question.id, id));

    const successResponse: DeleteResponse = {
      message: "Question deleted successfully",
    };
    return c.json(successResponse);
  } catch (error: unknown) {
    console.error("Error deleting question:", error);

    const dbError = error as DatabaseError;

    if (dbError.code === "23503") {
      const errorResponse: ApiError = {
        error:
          "Cannot delete question because it is referenced by other records",
        code: "FOREIGN_KEY_CONSTRAINT",
        details: { constraint: dbError.constraint },
      };
      return c.json(errorResponse, 409);
    }

    const errorResponse: ApiError = {
      error: "Internal server error",
      code: "INTERNAL_ERROR",
    };
    return c.json(errorResponse, 500);
  }
};

export const getQuestionById = async (c: Context): Promise<Response> => {
  try {
    const { id } = c.req.param();

    if (!id) {
      const errorResponse: ApiError = {
        error: "Question ID is required",
        code: "VALIDATION_ERROR",
      };
      return c.json(errorResponse, 400);
    }

    const questionData = await db
      .select()
      .from(question)
      .where(eq(question.id, id))
      .limit(1);

    if (questionData.length === 0) {
      const errorResponse: ApiError = {
        error: "Question not found",
        code: "NOT_FOUND",
        details: { questionId: id },
      };
      return c.json(errorResponse, 404);
    }

    const successResponse = {
      data: questionData[0],
    };
    return c.json(successResponse);
  } catch (error: unknown) {
    console.error("Error fetching question:", error);

    const errorResponse: ApiError = {
      error: "Internal server error",
      code: "INTERNAL_ERROR",
    };
    return c.json(errorResponse, 500);
  }
};

export const getAllQuestions = async (c: Context): Promise<Response> => {
  try {
    const page = parseInt(c.req.query("page") || "1");
    const limit = parseInt(c.req.query("limit") || "10");
    const offset = (page - 1) * limit;

    const questions = await db
      .select()
      .from(question)
      .limit(limit)
      .offset(offset)
      .orderBy(question.createdAt);

    const successResponse: GetAllResponse = {
      data: questions,
      pagination: {
        page,
        limit,
        offset,
      },
    };
    return c.json(successResponse);
  } catch (error: unknown) {
    console.error("Error fetching questions:", error);

    const errorResponse: ApiError = {
      error: "Internal server error",
      code: "INTERNAL_ERROR",
    };
    return c.json(errorResponse, 500);
  }
};

export const getQuestionsByCategory = async (c: Context): Promise<Response> => {
  try {
    const { categorySlug } = c.req.param();

    if (!categorySlug) {
      const errorResponse: ApiError = {
        error: "Category slug is required",
        code: "VALIDATION_ERROR",
      };
      return c.json(errorResponse, 400);
    }

    const questions = await db
      .select()
      .from(question)
      .where(eq(question.categorySlug, categorySlug))
      .orderBy(question.createdAt);

    const successResponse = {
      data: questions,
    };
    return c.json(successResponse);
  } catch (error: unknown) {
    console.error("Error fetching questions by category:", error);

    const errorResponse: ApiError = {
      error: "Internal server error",
      code: "INTERNAL_ERROR",
    };
    return c.json(errorResponse, 500);
  }
};
