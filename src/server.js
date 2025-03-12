import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";
import authRoutes from "./routes/auth.routes.js";
import eventRoutes from "./routes/event.routes.js";
import bookingRoutes from "./routes/booking.routes.js";
import invitationRoutes from "./routes/invitation.routes.js";
import walletRoutes from "./routes/wallet.routes.js";
import collaborationRoutes from "./routes/collaboration.routes.js"; // Importer les routes de collaboration

// Charger les variables d'environnement depuis le fichier .env
dotenv.config();

// Initialiser Prisma Client
const prisma = new PrismaClient();

// Créer une instance d'Express
const app = express();

// Middleware pour la sécurité
app.use(helmet());

// Middleware pour gérer les requêtes CORS
app.use(cors());

// Middleware pour parser les corps de requêtes JSON
app.use(bodyParser.json());

// Définir un port par défaut ou utiliser celui défini dans les variables d'environnement
const PORT = process.env.PORT || 3000;

// Utiliser les routes d'authentification
app.use("/auth", authRoutes);

// Utiliser les routes des événements
app.use("/events", eventRoutes);

// Utiliser les routes de réservation
app.use("/bookings", bookingRoutes);

// Utiliser les routes d'invitation
app.use("/invitations", invitationRoutes);

// Utiliser les routes de portefeuille
app.use("/wallet", walletRoutes);

// Utiliser les routes de collaboration
app.use("/collaborations", collaborationRoutes);

// Exemple de route
app.get("/", (req, res) => {
  res.send("Welcome to the Event Management API");
});

// Démarrer le serveur
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}, click  http://localhost:${PORT}`);
});

// Gestion des erreurs globales
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

// Fermer Prisma Client lors de la fermeture du serveur
process.on("SIGINT", async () => {
  await prisma.$disconnect();
  process.exit();
});
