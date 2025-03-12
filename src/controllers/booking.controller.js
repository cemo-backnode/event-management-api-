// 📌 src/controllers/booking.controller.js - Gestion des réservations avec QR Code
import prisma from "../config/prismaClient.js";
import QRCode from "qrcode";
import nodemailer from "nodemailer";

// Fonction pour générer un QR Code
const generateQRCode = async (text) => {
  try {
    return await QRCode.toDataURL(text);
  } catch (error) {
    console.error("Erreur QR Code:", error);
    return null;
  }
};

// Fonction pour envoyer un email avec QR Code
const sendEmailWithQRCode = async (email, qrCodeUrl) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Confirmation de réservation - QR Code",
    html: `<p>Votre réservation est confirmée ! Voici votre QR Code :</p><img src='${qrCodeUrl}' />`,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Erreur d'envoi d'email:", error);
  }
};

export const bookEvent = async (req, res) => {
  try {
    const { eventId, dateParticipation, heureDebut, heureFin } = req.body;
    const userId = req.user.id;

    const event = await prisma.event.findUnique({ where: { id: eventId } });
    if (!event)
      return res.status(404).json({ message: "Événement non trouvé." });

    // Vérifier si l'événement nécessite une invitation
    if (event.requiresInvitation) {
      const invitation = await prisma.invitation.findFirst({
        where: { eventId, userId, status: "ACCEPTED" },
      });
      if (!invitation)
        return res
          .status(403)
          .json({ message: "Vous n'êtes pas invité à cet événement." });
    }

    // Vérifier si une réservation existe déjà pour cette date
    const existingBooking = await prisma.booking.findFirst({
      where: { userId, eventId, dateParticipation },
    });
    if (existingBooking)
      return res
        .status(400)
        .json({
          message: "Vous avez déjà réservé cet événement pour cette date.",
        });

    // Vérifier le paiement si les frais de participation sont > 0
    if (event.fraisParticipation > 0) {
      const wallet = await prisma.wallet.findUnique({ where: { userId } });
      if (wallet.balance < event.fraisParticipation) {
        return res
          .status(400)
          .json({
            message: "Solde insuffisant. Veuillez recharger votre compte.",
          });
      }

      // Déduire les frais de participation du portefeuille de l'utilisateur
      await prisma.wallet.update({
        where: { userId },
        data: { balance: { decrement: event.fraisParticipation } },
      });

      // Enregistrer la transaction
      await prisma.transaction.create({
        data: { userId, amount: event.fraisParticipation, type: "PAYMENT" },
      });
    }

    // Générer le QR Code
    const qrCode = await generateQRCode(
      `${userId}-${eventId}-${dateParticipation}`
    );

    // Créer la réservation
    const booking = await prisma.booking.create({
      data: {
        userId,
        eventId,
        dateParticipation,
        heureDebut,
        heureFin,
        qrCode,
      },
    });

    // Envoyer l'email avec le QR Code
    await sendEmailWithQRCode(req.user.email, qrCode);

    res.status(201).json({ message: "Réservation confirmée !", booking });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur" });
  }
};

export const getUserBookings = async (req, res) => {
  try {
    const bookings = await prisma.booking.findMany({
      where: { userId: req.user.id },
    });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur" });
  }
};

export const cancelBooking = async (req, res) => {
  try {
    await prisma.booking.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ message: "Réservation annulée." });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur" });
  }
};

export const validateQRCode = async (req, res) => {
  try {
    const { qrCode } = req.body;

    const booking = await prisma.booking.findFirst({ where: { qrCode } });
    if (!booking) return res.status(404).json({ message: "QR Code invalide." });

    res.status(200).json({ message: "QR Code valide.", booking });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur" });
  }
};
