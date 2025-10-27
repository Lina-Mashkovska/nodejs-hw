import express from "express";
import { updateUserAvatar } from "../controllers/userController.js";
import { auth } from "../middleware/auth.js";
import { upload } from "../middleware/multer.js";

const router = express.Router();

router.patch("/users/me/avatar", auth, upload.single("avatar"), updateUserAvatar);

export default router;
