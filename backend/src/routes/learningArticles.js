import { Router } from "express";
import {
  listArticles,
  createArticle,
  updateArticle,
  deleteArticle,
} from "../controllers/learningArticleController.js";
import { adminAuth } from "../middleware/adminAuth.js";

const r = Router();
r.use(adminAuth);

r.get("/", listArticles);
r.post("/", createArticle);
r.put("/:id", updateArticle);
r.delete("/:id", deleteArticle);

export default r;
