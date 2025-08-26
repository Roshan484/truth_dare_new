import {
  createQuestion,
  deleteQuestion,
  getAllQuestions,
  getQuestionById,
  getQuestionsByCategory,
  updateQuestion,
} from "@/controllers/question";
import { requireAuth } from "@/middleware/auth.middleware";
import { Hono } from "hono";

export const questionRouter = new Hono();

questionRouter.get("/all", getAllQuestions);
questionRouter.post("/", requireAuth, createQuestion);

questionRouter.get("/by-category/:categorySlug", getQuestionsByCategory);
questionRouter.get("/by-questionId/:id", getQuestionById);

questionRouter.put("/:id", requireAuth, updateQuestion);
questionRouter.delete("/:id", requireAuth, deleteQuestion);
