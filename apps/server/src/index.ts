import "dotenv/config";
import { auth } from "./lib/auth";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { appRouter } from "./routers";
import { startRoomCleanupJob } from "./lib/room-cronjob";

const app = new Hono();

app.use(logger());
app.use(
  "/*",
  cors({
    origin: process.env.CORS_ORIGIN || "",
    allowMethods: ["GET", "POST", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.on(["POST", "GET"], "/api/auth/**", (c) => auth.handler(c.req.raw));

app.get("/", (c) => {
  return c.text("OK");
});

app.route("/api/categories", appRouter.category);
app.route("/api/questions", appRouter.question);
app.route("/api/rooms", appRouter.rooms);
app.route("/api/room-member", appRouter.roomMember);
startRoomCleanupJob();
export default app;
