import express from "express";
import { body } from "express-validator";
import validate from "../middlewares/validationMiddleware.js";
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

router.post(
  "/signup",
  validate([
    body("username").notEmpty().withMessage("Le nom d'utilisateur est requis"),
    body("email").isEmail().withMessage("Email invalide"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Le mot de passe doit contenir au moins 6 caractères"),
  ]),
  signup
);

router.post(
  "/login",
  validate([
    body("email").isEmail().withMessage("Email invalide"),
    body("password").notEmpty().withMessage("Le mot de passe est requis"),
  ]),
  login
);

router.get("/me", authMiddleware, me);
router.put("/me", authMiddleware, updateMe);
router.post("/refresh-token", refreshToken);

// Route pour mettre à jour la photo de profil
router.post(
  "/me/profile-picture",
  authMiddleware,
  (req, res, next) => {
    req.uploadType = "profilePicture";
    next();
  },
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
