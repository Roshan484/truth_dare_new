import { auth } from "@/lib/auth";
import type { Context, Next } from "hono";

export const requireAuth = async (c: Context, next: Next) => {
  try {
    const session = await auth.api.getSession({
      headers: c.req.raw.headers,
    });

    if (!session) {
      return c.text("Unauthorized", 401);
    }

    c.set("session", session);
    c.set("user", session.user);

    return next();
  } catch (err) {
    console.error("Auth error:", err);
    return c.text("Unauthorized", 401);
  }
};
