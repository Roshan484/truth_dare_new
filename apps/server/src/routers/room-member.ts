import {
  getRoomMembers,
  getUserRooms,
  joinPrivateRoom,
  joinPublicRoom,
  leaveRoom,
  removeMember,
} from "@/controllers/room-member";
import { requireAuth } from "@/middleware/auth.middleware";
import { Hono } from "hono";

export const roomMemberRouter = new Hono();

roomMemberRouter.post("/join-private", requireAuth, joinPrivateRoom);
roomMemberRouter.get("/get-room-members/:roomId", requireAuth, getRoomMembers);
roomMemberRouter.post("/leave-room/:roomId", requireAuth, leaveRoom);
roomMemberRouter.post("/join-room/:roomId", requireAuth, joinPublicRoom);
roomMemberRouter.get("/members/user/:userId", requireAuth, getUserRooms);

roomMemberRouter.delete("/:id/members/:memberId", requireAuth, removeMember);
