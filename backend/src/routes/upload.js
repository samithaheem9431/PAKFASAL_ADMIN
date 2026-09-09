import { Router } from "express";
import multer from "multer";
import { uploadImage } from "../controllers/uploadController.js";
import { adminAuth } from "../middleware/adminAuth.js";

/** Memory storage — buffer goes to Firebase Storage (not ephemeral disk) */
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 8 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (/^image\/(jpeg|png|gif|webp)$/i.test(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only JPEG, PNG, GIF, WebP allowed"));
    }
  },
});

const r = Router();
r.use(adminAuth);
r.post("/", upload.single("file"), uploadImage);

export default r;
