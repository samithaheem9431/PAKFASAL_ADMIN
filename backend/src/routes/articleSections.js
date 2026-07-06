import { Router } from "express";
import {
  listArticleSections,
  createArticleSection,
  updateArticleSection,
  deleteArticleSection,
} from "../controllers/articleSectionController.js";
import { adminAuth } from "../middleware/adminAuth.js";

const r = Router();
r.use(adminAuth);

r.get("/", listArticleSections);
r.post("/", createArticleSection);
r.put("/:id", updateArticleSection);
r.delete("/:id", deleteArticleSection);

export default r;
