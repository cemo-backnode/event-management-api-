// 📌 src/routes/event.routes.js - Routes pour les événements avec filtres, tri et pagination
import express from "express";
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

// Création d'un événement (Organisateur/Admin)
router.post(
  "/create",
  authMiddleware,
  checkRole(["ADMIN", "ORGANISATEUR"]),
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
router.delete("/:id", authMiddleware, deleteEvent);

export default router;
