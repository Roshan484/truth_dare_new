import {
  createCategory,
  deleteCategory,
  getCategory,
  getCategoryBySlug,
  updateCategory,
} from "@/controllers/category";
import { requireAuth } from "@/middleware/auth.middleware";
import { Hono } from "hono";

export const categoryRouter = new Hono();

categoryRouter.post("/", createCategory);
categoryRouter.get("/", getCategory);

// Static routes first
categoryRouter.get("/get-by-slug/:slug", getCategoryBySlug);
categoryRouter.get("/get-by-id/:id", getCategory);

// Dynamic routes (with auth)
categoryRouter.put("/:id", requireAuth, updateCategory);
categoryRouter.delete("/:id", requireAuth, deleteCategory);
