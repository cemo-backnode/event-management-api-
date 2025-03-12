import express from "express";
import {
  bookEvent,
  getUserBookings,
  cancelBooking,
  validateQRCode,
} from "../controllers/booking.controller.js";
import authMiddleware from "../middlewares/authMiddleware.js";

const router = express.Router();

// Réserver un événement avec QR Code (Participant)
router.post("/", authMiddleware, bookEvent);

// Voir ses réservations (Participant)
router.get("/mine", authMiddleware, getUserBookings);

// Annuler une réservation (Participant)
router.delete("/:id", authMiddleware, cancelBooking);

// Valider un QR code (Organisateur/Admin)
router.post("/validate-qr", authMiddleware, validateQRCode);

export default router;
