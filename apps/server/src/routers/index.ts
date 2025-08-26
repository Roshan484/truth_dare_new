import { categoryRouter } from "./category";
import { questionRouter } from "./question";
import { roomMemberRouter } from "./room-member";
import { roomRouter } from "./rooms";

export const appRouter = {
  category: categoryRouter,
  question: questionRouter,
  rooms: roomRouter,
  roomMember: roomMemberRouter,
};
export type AppRouter = typeof appRouter;
