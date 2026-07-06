import { Router } from "express";
import {
  listLearningArticles,
  createLearningArticle,
  updateLearningArticle,
  deleteLearningArticle,
} from "../controllers/learningArticleController.js";
import { adminAuth } from "../middleware/adminAuth.js";

const r = Router();
r.use(adminAuth);

r.get("/", listLearningArticles);
r.post("/", createLearningArticle);
r.put("/:id", updateLearningArticle);
r.delete("/:id", deleteLearningArticle);

export default r;
