// 📌 src/routes/event.routes.js - Routes pour les événements avec filtres, tri et pagination
import express from "express";
import { body } from "express-validator";
import validate from "../middlewares/validationMiddleware.js";
import {
  createEvent,
  getEvents,
  deleteEvent,
  addVisual,
} from "../controllers/event.controller.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import checkRole from "../middlewares/roleMiddleware.js";
import upload from "../middlewares/uploadMiddleware.js";

const router = express.Router();

// Création d'un événement avec validation et rôle "organisateur"
router.post(
  "/create",
  authMiddleware,
  checkRole(["ADMIN", "ORGANISATEUR"]),
  validate([
    body("titre").notEmpty().withMessage("Le titre est requis"),
    body("dateDebut").isISO8601().withMessage("Format de date invalide"),
    body("lieu").notEmpty().withMessage("Le lieu est requis"),
  ]),
  createEvent
);

// Ajout d'un visuel à un événement (Organisateur/Admin)
router.post(
  "/add-visual/:eventId",
  authMiddleware,
  checkRole(["ADMIN", "ORGANISATEUR"]),
  (req, res, next) => {
    req.uploadType = "eventVisual";
    next();
  },
  upload.single("visual"),
  addVisual
);

// Récupération des événements avec filtres, recherche, tri et pagination
router.get("/", getEvents);

// Suppression d'un événement (Organisateur/Admin)
router.delete("/:id", authMiddleware, checkRole(["ADMIN"]), deleteEvent);

export default router;
