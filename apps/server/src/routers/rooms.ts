import {
  createRoom,
  deleteRoom,
  getAllRooms,
  getRoomById,
  getRoomsByUser,
  updateRoom,
} from "@/controllers/room";
import { requireAuth } from "@/middleware/auth.middleware";

import { Hono } from "hono";

export const roomRouter = new Hono();

roomRouter.post("/", requireAuth, createRoom);
roomRouter.get("/", requireAuth, getAllRooms);

roomRouter.get("/user/:userId", requireAuth, getRoomsByUser);

roomRouter.get("/get-room-by-id/:id", getRoomById);
roomRouter.put("/:id", requireAuth, updateRoom);
roomRouter.delete("/:id", requireAuth, deleteRoom);
