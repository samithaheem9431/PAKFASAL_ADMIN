import { Router } from "express";
import { me } from "../controllers/authController.js";
import { adminAuth } from "../middleware/adminAuth.js";

const r = Router();
r.get("/me", ...adminAuth, me);

export default r;
