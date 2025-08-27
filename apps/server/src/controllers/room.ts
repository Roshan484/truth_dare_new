import type { Context } from "hono";
import { db } from "../db";

import { eq, and, count, gte, sql, desc } from "drizzle-orm";
import {
  validateCreateRoom,
  validateUpdateRoom,
} from "@/validations/room-validator";
import { category } from "@/db/schema/category";
import { user } from "@/db/schema/auth";
import { generateId } from "@/lib/generateID";
import { room, roomMember } from "@/db/schema/room";
import { customAlphabet } from "nanoid";
interface ApiError {
  error: string;
  code: string;
  details?: Record<string, any>;
}

interface CreateRoomResponse {
  message: string;
  data: {
    room: any;
    joinCode?: string;
  };
}

interface UpdateRoomResponse {
  message: string;
  data: any;
}

interface DeleteRoomResponse {
  message: string;
}

interface GetRoomResponse {
  data: any;
}

interface GetAllRoomsResponse {
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

const generateJoinCode = customAlphabet(
  "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ",
  5
);

export const createRoom = async (c: Context): Promise<Response> => {
  try {
    const body = await c.req.json();
    const validation = validateCreateRoom(body);

    if (!validation.success || !validation.data) {
      const errorResponse: ApiError = {
        error: "Validation failed",
        code: "VALIDATION_ERROR",
        details: { errors: validation.errors },
      };
      return c.json(errorResponse, 400);
    }

    const { name, isPublic, limit, categorySlug, createdBy } = validation.data;

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

    const existingUser = await db
      .select()
      .from(user)
      .where(eq(user.id, createdBy))
      .limit(1);

    if (existingUser.length === 0) {
      const errorResponse: ApiError = {
        error: "User not found",
        code: "NOT_FOUND",
        details: { userId: createdBy },
      };
      return c.json(errorResponse, 404);
    }

    const existingRoomWithName = await db
      .select()
      .from(room)
      .where(and(eq(room.name, name), eq(room.categorySlug, categorySlug)))
      .limit(1);

    if (existingRoomWithName.length > 0) {
      const errorResponse: ApiError = {
        error: "A room with this name already exists in this category",
        code: "DUPLICATE_ROOM_NAME",
        details: { roomName: name, categorySlug },
      };
      return c.json(errorResponse, 409);
    }

    const roomId = generateId();
    let joinCode: string | null = null;

    if (!isPublic) {
      joinCode = generateJoinCode();

      let attempts = 0;
      while (attempts < 3) {
        const existingJoinCode = await db
          .select()
          .from(room)
          .where(eq(room.joinCode, joinCode))
          .limit(1);

        if (existingJoinCode.length === 0) break;

        joinCode = generateJoinCode();
        attempts++;
      }

      if (attempts === 3) {
        const errorResponse: ApiError = {
          error: "Unable to generate unique join code. Please try again.",
          code: "GENERATION_FAILED",
        };
        return c.json(errorResponse, 500);
      }
    }

    const newRoom = await db
      .insert(room)
      .values({
        id: roomId,
        name: name.toLowerCase(),
        isPublic,
        limit,
        joinCode,
        categorySlug: categorySlug,
        createdBy,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    await db.insert(roomMember).values({
      id: generateId(),
      roomId,
      userId: createdBy,
      joinedAt: new Date(),
      isHost: true,
    });

    const successResponse: CreateRoomResponse = {
      message: "Room created successfully",
      data: {
        room: newRoom[0],
        ...(joinCode && { joinCode }),
      },
    };
    return c.json(successResponse, 201);
  } catch (error: unknown) {
    console.error("Error creating room:", error);

    const dbError = error as DatabaseError;

    if (dbError.code === "23503") {
      const errorResponse: ApiError = {
        error: "Referenced resource not found",
        code: "FOREIGN_KEY_CONSTRAINT",
        details: { constraint: dbError.constraint },
      };
      return c.json(errorResponse, 409);
    }

    if (dbError.code === "23505") {
      const errorResponse: ApiError = {
        error: "A room with this name already exists in this category",
        code: "DUPLICATE_ROOM_NAME",
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

export const updateRoom = async (c: Context): Promise<Response> => {
  try {
    const { id } = c.req.param();

    if (!id) {
      const errorResponse: ApiError = {
        error: "Room ID is required",
        code: "VALIDATION_ERROR",
      };
      return c.json(errorResponse, 400);
    }

    const body = await c.req.json();
    const validation = validateUpdateRoom({ id, ...body });

    if (!validation.success || !validation.data) {
      const errorResponse: ApiError = {
        error: "Validation failed",
        code: "VALIDATION_ERROR",
        details: { errors: validation.errors },
      };
      return c.json(errorResponse, 400);
    }

    const { name, isPublic, categorySlug, limit } = validation.data;

    const existingRoom = await db
      .select()
      .from(room)
      .where(eq(room.id, id))
      .limit(1);

    if (existingRoom.length === 0) {
      const errorResponse: ApiError = {
        error: "Room not found",
        code: "NOT_FOUND",
        details: { roomId: id },
      };
      return c.json(errorResponse, 404);
    }

    if (categorySlug) {
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
    }

    const updateData: any = {
      updatedAt: new Date(),
    };

    if (name !== undefined) updateData.name = name;
    if (isPublic !== undefined) updateData.isPublic = isPublic;
    if (limit !== undefined) updateData.limit = limit;

    const updatedRoom = await db
      .update(room)
      .set(updateData)
      .where(eq(room.id, id))
      .returning();

    const successResponse: UpdateRoomResponse = {
      message: "Room updated successfully",
      data: updatedRoom[0],
    };
    return c.json(successResponse);
  } catch (error: unknown) {
    console.error("Error updating room:", error);

    const dbError = error as DatabaseError;

    if (dbError.code === "23503") {
      const errorResponse: ApiError = {
        error: "Referenced resource not found",
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

export const deleteRoom = async (c: Context): Promise<Response> => {
  try {
    const { id } = c.req.param();
    const { userId } = c.req.query();

    if (!id) {
      const errorResponse: ApiError = {
        error: "Room ID is required",
        code: "VALIDATION_ERROR",
      };
      return c.json(errorResponse, 400);
    }

    if (!userId) {
      const errorResponse: ApiError = {
        error: "User ID is required",
        code: "VALIDATION_ERROR",
      };
      return c.json(errorResponse, 400);
    }

    const existingRoom = await db
      .select()
      .from(room)
      .where(eq(room.id, id))
      .limit(1);

    if (existingRoom.length === 0) {
      const errorResponse: ApiError = {
        error: "Room not found",
        code: "NOT_FOUND",
        details: { roomId: id },
      };
      return c.json(errorResponse, 404);
    }

    if (existingRoom[0].createdBy !== userId) {
      const errorResponse: ApiError = {
        error: "You are not authorized to delete this room",
        code: "UNAUTHORIZED",
        details: { roomId: id },
      };
      return c.json(errorResponse, 403);
    }

    await db.delete(room).where(eq(room.id, id));

    const successResponse: DeleteRoomResponse = {
      message: "Room deleted successfully",
    };
    return c.json(successResponse);
  } catch (error: unknown) {
    console.error("Error deleting room:", error);

    const dbError = error as DatabaseError;

    if (dbError.code === "23503") {
      const errorResponse: ApiError = {
        error: "Cannot delete room because it is referenced by other records",
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

export const getRoomById = async (c: Context): Promise<Response> => {
  try {
    const { id } = c.req.param();

    if (!id) {
      const errorResponse: ApiError = {
        error: "Room ID is required",
        code: "VALIDATION_ERROR",
      };
      return c.json(errorResponse, 400);
    }

    const roomData = await db
      .select({
        id: room.id,
        name: room.name,
        isPublic: room.isPublic,
        limit: room.limit,
        joinCode: room.joinCode,
        categorySlug: room.categorySlug,
        createdBy: room.createdBy,
        createdAt: room.createdAt,
        updatedAt: room.updatedAt,

        creatorName: user.name,
        categoryName: category.name,
      })
      .from(room)
      .leftJoin(user, eq(room.createdBy, user.id))
      .leftJoin(category, eq(room.categorySlug, category.slug))
      .where(eq(room.id, id))
      .limit(1);

    if (roomData.length === 0) {
      const errorResponse: ApiError = {
        error: "Room not found",
        code: "NOT_FOUND",
        details: { roomId: id },
      };
      return c.json(errorResponse, 404);
    }

    const successResponse: GetRoomResponse = {
      data: roomData[0],
    };
    return c.json(successResponse);
  } catch (error: unknown) {
    console.error("Error fetching room:", error);

    const errorResponse: ApiError = {
      error: "Internal server error",
      code: "INTERNAL_ERROR",
    };
    return c.json(errorResponse, 500);
  }
};

export const getAllRooms = async (c: Context): Promise<Response> => {
  try {
    const page = parseInt(c.req.query("page") || "1");
    const limit = parseInt(c.req.query("limit") || "10");
    const categorySlug = c.req.query("categorySlug");
    const isPublic = c.req.query("isPublic");
    const offset = (page - 1) * limit;

    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);
    const conditions = [gte(room.createdAt, fifteenMinutesAgo)];

    if (categorySlug) {
      conditions.push(eq(room.categorySlug, categorySlug));
    }
    if (isPublic !== undefined) {
      conditions.push(eq(room.isPublic, isPublic === "true"));
    }

    const baseQuery = db
      .select({
        id: room.id,
        name: room.name,
        isPublic: room.isPublic,
        categorySlug: room.categorySlug,
        limit: room.limit,
        joinCode: room.joinCode,
        createdBy: room.createdBy,
        createdAt: room.createdAt,
        updatedAt: room.updatedAt,
        creatorName: user.name,
        categoryName: category.name,
        totalPlayers: count(roomMember.id),
        timeRemaining: sql<number>`GREATEST(0, 900 - EXTRACT(EPOCH FROM (NOW() - ${room.createdAt})))`,
      })
      .from(room)
      .leftJoin(user, eq(room.createdBy, user.id))
      .leftJoin(category, eq(room.categorySlug, category.slug))
      .leftJoin(roomMember, eq(room.id, roomMember.roomId))
      .groupBy(
        room.id,
        room.name,
        room.isPublic,
        room.categorySlug,
        room.limit,
        room.joinCode,
        room.createdBy,
        room.createdAt,
        room.updatedAt,
        user.name,
        category.name
      );

    const rooms = await baseQuery
      .where(and(...conditions))
      .limit(limit)
      .offset(offset)
      .orderBy(desc(room.createdAt));

    const successResponse: GetAllRoomsResponse = {
      data: rooms,
      pagination: {
        page,
        limit,
        offset,
      },
    };
    return c.json(successResponse);
  } catch (error: unknown) {
    console.error("Error fetching rooms:", error);

    const errorResponse: ApiError = {
      error: "Internal server error",
      code: "INTERNAL_ERROR",
    };
    return c.json(errorResponse, 500);
  }
};

export const getRoomsByUser = async (c: Context): Promise<Response> => {
  try {
    const { userId } = c.req.param();

    if (!userId) {
      const errorResponse: ApiError = {
        error: "User ID is required",
        code: "VALIDATION_ERROR",
      };
      return c.json(errorResponse, 400);
    }

    const rooms = await db
      .select({
        id: room.id,
        name: room.name,
        isPublic: room.isPublic,
        categorySlug: room.categorySlug,
        limit: room.limit,
        joinCode: room.joinCode,
        createdBy: room.createdBy,
        createdAt: room.createdAt,
        updatedAt: room.updatedAt,
        categoryName: category.name,
      })
      .from(room)
      .leftJoin(category, eq(room.categorySlug, category.slug))
      .where(eq(room.createdBy, userId))
      .orderBy(room.createdAt);

    const successResponse: GetRoomResponse = {
      data: rooms,
    };
    return c.json(successResponse);
  } catch (error: unknown) {
    console.error("Error fetching user rooms:", error);

    const errorResponse: ApiError = {
      error: "Internal server error",
      code: "INTERNAL_ERROR",
    };
    return c.json(errorResponse, 500);
  }
};
