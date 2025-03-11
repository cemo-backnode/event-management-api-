import express from "express";
import {
  signup,
  login,
  me,
  updateMe,
  refreshToken,
  updateProfilePicture,
} from "../controllers/auth.controller.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import checkRole from "../middlewares/roleMiddleware.js";
import upload from "../middlewares/uploadMiddleware.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.get("/me", authMiddleware, me);
router.put("/me", authMiddleware, updateMe);
router.post("/refresh-token", refreshToken);

// Route pour mettre à jour la photo de profil
router.post(
  "/me/profile-picture",
  authMiddleware,
  upload.single("profilePicture"),
  updateProfilePicture
);

// Exemple de route protégée par rôle
router.get("/admin", authMiddleware, checkRole(["ADMIN"]), (req, res) => {
  res.json({ message: "Welcome Admin", user: req.user });
});

router.get(
  "/organizer",
  authMiddleware,
  checkRole(["ADMIN", "ORGANISATEUR"]),
  (req, res) => {
    res.json({ message: "Welcome Organizer", user: req.user });
  }
);

export default router;
