import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "../config/prismaClient.js";

const SECRET_KEY = process.env.JWT_SECRET || "supersecretkey";

export const signup = async (req, res) => {
  try {
    const { username, email, password, role } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: { username, email, password: hashedPassword, role },
    });

    // Créer un portefeuille avec un solde initial de 1000 unités pour les participants
    if (role === "PARTICIPANT") {
      await prisma.wallet.create({
        data: {
          userId: user.id,
          balance: 1000,
        },
      });

      // Enregistrer la transaction initiale
      await prisma.transaction.create({
        data: {
          userId: user.id,
          amount: 1000,
          type: "DEPOSIT",
        },
      });
    }

    res.status(201).json({ message: "Enregistrement réussi", user });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user)
      return res.status(400).json({ message: "Utilisateur non trouvé" });

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword)
      return res.status(400).json({ message: "Mot de passe incorrect" });

    const token = jwt.sign({ id: user.id, role: user.role }, SECRET_KEY, {
      expiresIn: "1h",
    });
    res.json({ message: "Connexion réussie", token });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

export const me = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!user)
      return res.status(404).json({ message: "Utilisateur non trouvé" });

    res.json(user);
  } catch (error) {
    console.error("Get user error:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

export const updateMe = async (req, res) => {
  const { username, email, password } = req.body;
  try {
    const data = {};
    if (username) data.username = username;
    if (email) data.email = email;
    if (password) data.password = await bcrypt.hash(password, 10);

    const user = await prisma.user.update({
      where: { id: req.user.id },
      data,
    });

    res.json(user);
  } catch (error) {
    if (error.code === "P2002") {
      res.status(400).json({ message: "Email déjà utilisé" });
    } else {
      console.error("Update user error:", error);
      res.status(500).json({ message: "Erreur serveur" });
    }
  }
};

export const refreshToken = async (req, res) => {
  const { token } = req.body;
  if (!token) {
    return res.status(401).json({ message: "Token manquant" });
  }

  try {
    const decoded = jwt.verify(token, SECRET_KEY, { ignoreExpiration: true });
    const newToken = jwt.sign(
      { id: decoded.id, role: decoded.role },
      SECRET_KEY,
      { expiresIn: "2h" }
    );
    res.json({ token: newToken });
  } catch (error) {
    console.error("Refresh token error:", error);
    res.status(403).json({ message: "Token invalide" });
  }
};

export const updateProfilePicture = async (req, res) => {
  try {
    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: { profilePicture: req.file.path },
    });

    res.json({ message: "Photo de profil mise à jour", user });
  } catch (error) {
    console.error("Update profile picture error:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};
