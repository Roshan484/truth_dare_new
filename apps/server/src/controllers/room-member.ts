import type { Context } from "hono";
import { db } from "../db";

import { eq, and } from "drizzle-orm";
import { room, roomMember } from "@/db/schema/room";
import { user } from "@/db/schema/auth";
import { generateId } from "@/lib/generateID";

interface ApiError {
  error: string;
  code: string;
  details?: Record<string, any>;
}

interface LeaveRoomResponse {
  message: string;
}

interface DatabaseError {
  code: string;
  constraint?: string;
}

export const joinPublicRoom = async (c: Context): Promise<Response> => {
  try {
    const { roomId } = c.req.param();
    const body = await c.req.json();
    const { userId } = body;

    if (!roomId) {
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
      .where(eq(room.id, roomId))
      .limit(1);

    if (existingRoom.length === 0) {
      const errorResponse: ApiError = {
        error: "Room not found",
        code: "NOT_FOUND",
        details: { roomId },
      };
      return c.json(errorResponse, 404);
    }

    if (!existingRoom[0].isPublic) {
      const errorResponse: ApiError = {
        error: "Cannot join private room without join code",
        code: "PRIVATE_ROOM_ACCESS_DENIED",
        details: { roomId },
      };
      return c.json(errorResponse, 403);
    }

    const existingUser = await db
      .select()
      .from(user)
      .where(eq(user.id, userId))
      .limit(1);

    if (existingUser.length === 0) {
      const errorResponse: ApiError = {
        error: "User not found",
        code: "NOT_FOUND",
        details: { userId },
      };
      return c.json(errorResponse, 404);
    }

    const existingMember = await db
      .select()
      .from(roomMember)
      .where(and(eq(roomMember.roomId, roomId), eq(roomMember.userId, userId)))
      .limit(1);

    if (existingMember.length > 0) {
      const errorResponse: ApiError = {
        error: "User is already a member of this room",
        code: "ALREADY_MEMBER",
        details: { roomId, userId },
      };
      return c.json(errorResponse, 409);
    }

    const newMember = await db
      .insert(roomMember)
      .values({
        id: generateId(),
        roomId,
        userId,
        joinedAt: new Date(),
        isHost: false,
      })
      .returning();

    const successResponse = {
      message: "Successfully joined the room",
      data: {
        room: existingRoom[0],
        member: newMember[0],
      },
    };
    return c.json(successResponse, 201);
  } catch (error: unknown) {
    console.error("Error joining public room:", error);

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

export const joinPrivateRoom = async (c: Context): Promise<Response> => {
  try {
    const body = await c.req.json();
    const { joinCode, userId } = body;

    if (!joinCode) {
      const errorResponse: ApiError = {
        error: "Join code is required",
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
      .where(eq(room.id, joinCode))
      .limit(1);

    if (existingRoom.length === 0) {
      const errorResponse: ApiError = {
        error: "Invalid join code",
        code: "INVALID_JOIN_CODE",
        details: { joinCode },
      };
      return c.json(errorResponse, 404);
    }

    if (existingRoom[0].isPublic) {
      const errorResponse: ApiError = {
        error: "This is a public room. Use public room join instead.",
        code: "ROOM_TYPE_MISMATCH",
        details: { roomId: joinCode },
      };
      return c.json(errorResponse, 400);
    }

    const existingUser = await db
      .select()
      .from(user)
      .where(eq(user.id, userId))
      .limit(1);

    if (existingUser.length === 0) {
      const errorResponse: ApiError = {
        error: "User not found",
        code: "NOT_FOUND",
        details: { userId },
      };
      return c.json(errorResponse, 404);
    }

    const existingMember = await db
      .select()
      .from(roomMember)
      .where(
        and(eq(roomMember.roomId, joinCode), eq(roomMember.userId, userId))
      )
      .limit(1);

    if (existingMember.length > 0) {
      const errorResponse: ApiError = {
        error: "User is already a member of this room",
        code: "ALREADY_MEMBER",
        details: { roomId: joinCode, userId },
      };
      return c.json(errorResponse, 409);
    }

    const newMember = await db
      .insert(roomMember)
      .values({
        id: generateId(),
        roomId: joinCode,
        userId,
        joinedAt: new Date(),
        isHost: false,
      })
      .returning();

    const successResponse = {
      message: "Successfully joined the private room",
      data: {
        room: existingRoom[0],
        member: newMember[0],
      },
    };
    return c.json(successResponse, 201);
  } catch (error: unknown) {
    console.error("Error joining private room:", error);

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

export const leaveRoom = async (c: Context): Promise<Response> => {
  try {
    const { roomId } = c.req.param();
    const body = await c.req.json();
    const { userId } = body;

    if (!roomId) {
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

    // Check if room exists
    const existingRoom = await db
      .select()
      .from(room)
      .where(eq(room.id, roomId))
      .limit(1);

    if (existingRoom.length === 0) {
      const errorResponse: ApiError = {
        error: "Room not found",
        code: "NOT_FOUND",
        details: { roomId },
      };
      return c.json(errorResponse, 404);
    }

    // Check if user is a member
    const existingMember = await db
      .select()
      .from(roomMember)
      .where(and(eq(roomMember.roomId, roomId), eq(roomMember.userId, userId)))
      .limit(1);

    if (existingMember.length === 0) {
      const errorResponse: ApiError = {
        error: "User is not a member of this room",
        code: "NOT_MEMBER",
        details: { roomId, userId },
      };
      return c.json(errorResponse, 404);
    }

    // Check if user is the host/creator
    if (existingMember[0].isHost || existingRoom[0].createdBy === userId) {
      const errorResponse: ApiError = {
        error:
          "Room creator/host cannot leave the room. Delete the room instead.",
        code: "HOST_CANNOT_LEAVE",
        details: { roomId, userId },
      };
      return c.json(errorResponse, 403);
    }

    // Remove user from room
    await db
      .delete(roomMember)
      .where(and(eq(roomMember.roomId, roomId), eq(roomMember.userId, userId)));

    const successResponse: LeaveRoomResponse = {
      message: "Successfully left the room",
    };
    return c.json(successResponse);
  } catch (error: unknown) {
    console.error("Error leaving room:", error);

    const errorResponse: ApiError = {
      error: "Internal server error",
      code: "INTERNAL_ERROR",
    };
    return c.json(errorResponse, 500);
  }
};

export const getRoomMembers = async (c: Context): Promise<Response> => {
  try {
    const { roomId } = c.req.param();

    if (!roomId) {
      const errorResponse: ApiError = {
        error: "Room ID is required",
        code: "VALIDATION_ERROR",
      };
      return c.json(errorResponse, 400);
    }

    const existingRoom = await db
      .select()
      .from(room)
      .where(eq(room.id, roomId))
      .limit(1);

    if (existingRoom.length === 0) {
      const errorResponse: ApiError = {
        error: "Room not found",
        code: "NOT_FOUND",
        details: { roomId },
      };
      return c.json(errorResponse, 404);
    }

    const members = await db
      .select({
        id: roomMember.id,
        roomId: roomMember.roomId,
        userId: roomMember.userId,
        joinedAt: roomMember.joinedAt,
        isHost: roomMember.isHost,
        userName: user.name,
        userEmail: user.email,
        userImage: user.image,
      })
      .from(roomMember)
      .leftJoin(user, eq(roomMember.userId, user.id))
      .where(eq(roomMember.roomId, roomId))
      .orderBy(roomMember.joinedAt);

    const successResponse = {
      data: members,
    };
    return c.json(successResponse);
  } catch (error: unknown) {
    console.error("Error fetching room members:", error);

    const errorResponse: ApiError = {
      error: "Internal server error",
      code: "INTERNAL_ERROR",
    };
    return c.json(errorResponse, 500);
  }
};

export const getUserRooms = async (c: Context): Promise<Response> => {
  try {
    const { userId } = c.req.param();

    if (!userId) {
      const errorResponse: ApiError = {
        error: "User ID is required",
        code: "VALIDATION_ERROR",
      };
      return c.json(errorResponse, 400);
    }

    const existingUser = await db
      .select()
      .from(user)
      .where(eq(user.id, userId))
      .limit(1);

    if (existingUser.length === 0) {
      const errorResponse: ApiError = {
        error: "User not found",
        code: "NOT_FOUND",
        details: { userId },
      };
      return c.json(errorResponse, 404);
    }

    const userRooms = await db
      .select({
        memberId: roomMember.id,
        roomId: room.id,
        roomName: room.name,
        isPublic: room.isPublic,
        categorySlug: room.categorySlug,
        createdBy: room.createdBy,
        createdAt: room.createdAt,
        joinedAt: roomMember.joinedAt,
        isHost: roomMember.isHost,
      })
      .from(roomMember)
      .leftJoin(room, eq(roomMember.roomId, room.id))
      .where(eq(roomMember.userId, userId))
      .orderBy(roomMember.joinedAt);

    const userRoomsWithIsCreator = userRooms.map((room) => ({
      ...room,
      isCreator: room.createdBy === userId,
    }));

    const successResponse = {
      data: userRoomsWithIsCreator,
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

export const removeMember = async (c: Context): Promise<Response> => {
  try {
    const { roomId, memberId } = c.req.param();
    const body = await c.req.json();
    const { hostUserId } = body;

    if (!roomId || !memberId) {
      const errorResponse: ApiError = {
        error: "Room ID and member ID are required",
        code: "VALIDATION_ERROR",
      };
      return c.json(errorResponse, 400);
    }

    if (!hostUserId) {
      const errorResponse: ApiError = {
        error: "Host user ID is required",
        code: "VALIDATION_ERROR",
      };
      return c.json(errorResponse, 400);
    }

    const existingRoom = await db
      .select()
      .from(room)
      .where(eq(room.id, roomId))
      .limit(1);

    if (existingRoom.length === 0) {
      const errorResponse: ApiError = {
        error: "Room not found",
        code: "NOT_FOUND",
        details: { roomId },
      };
      return c.json(errorResponse, 404);
    }

    const hostMember = await db
      .select()
      .from(roomMember)
      .where(
        and(eq(roomMember.roomId, roomId), eq(roomMember.userId, hostUserId))
      )
      .limit(1);

    const isCreator = existingRoom[0].createdBy === hostUserId;
    const isHost = hostMember.length > 0 && hostMember[0].isHost;

    if (!isCreator && !isHost) {
      const errorResponse: ApiError = {
        error: "Only room creator or host can remove members",
        code: "UNAUTHORIZED",
        details: { roomId, userId: hostUserId },
      };
      return c.json(errorResponse, 403);
    }

    const memberToRemove = await db
      .select()
      .from(roomMember)
      .where(eq(roomMember.id, memberId))
      .limit(1);

    if (memberToRemove.length === 0) {
      const errorResponse: ApiError = {
        error: "Member not found",
        code: "NOT_FOUND",
        details: { memberId },
      };
      return c.json(errorResponse, 404);
    }

    if (memberToRemove[0].userId === existingRoom[0].createdBy) {
      const errorResponse: ApiError = {
        error: "Cannot remove room creator",
        code: "CANNOT_REMOVE_CREATOR",
        details: { memberId },
      };
      return c.json(errorResponse, 403);
    }

    await db.delete(roomMember).where(eq(roomMember.id, memberId));

    const successResponse: LeaveRoomResponse = {
      message: "Member removed successfully",
    };
    return c.json(successResponse);
  } catch (error: unknown) {
    console.error("Error removing member:", error);

    const errorResponse: ApiError = {
      error: "Internal server error",
      code: "INTERNAL_ERROR",
    };
    return c.json(errorResponse, 500);
  }
};
