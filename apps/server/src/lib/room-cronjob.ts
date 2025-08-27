import { CronJob } from "cron";
import { db } from "../db";
import { lt, inArray } from "drizzle-orm";
import { room, roomMember } from "@/db/schema/room";

export const startRoomCleanupJob = () => {
  console.log("Starting room cleanup cron job...");

  const cleanupJob = new CronJob(
    "*/5 * * * *",
    async () => {
      try {
        console.log("Running room cleanup...");
        const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);

        const expiredRooms = await db
          .select({ id: room.id, name: room.name })
          .from(room)
          .where(lt(room.createdAt, fifteenMinutesAgo));

        if (expiredRooms.length > 0) {
          const roomIds = expiredRooms.map((r) => r.id);

          console.log(
            `Found ${expiredRooms.length} expired rooms to delete:`,
            expiredRooms.map((r) => r.name)
          );

          await db
            .delete(roomMember)
            .where(inArray(roomMember.roomId, roomIds));

          const deletedRooms = await db
            .delete(room)
            .where(inArray(room.id, roomIds))
            .returning({ id: room.id, name: room.name });

          console.log(
            `Successfully cleaned up ${deletedRooms.length} expired rooms`
          );
        } else {
          console.log("No expired rooms found");
        }
      } catch (error) {
        console.error("Error in room cleanup job:", error);
      }
    },
    null,
    true,
    "UTC"
  );

  process.on("SIGINT", () => {
    console.log("Stopping room cleanup job...");
    cleanupJob.stop();
    process.exit(0);
  });

  process.on("SIGTERM", () => {
    console.log("Stopping room cleanup job...");
    cleanupJob.stop();
    process.exit(0);
  });

  return cleanupJob;
};
