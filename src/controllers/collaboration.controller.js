import prisma from '../config/prismaClient.js';

export const addCollaborator = async (req, res) => {
  try {
    const { eventId, collaboratorId } = req.body;
    const organizerId = req.user.id;

    const event = await prisma.event.findUnique({ where: { id: eventId } });
    if (!event || event.organizerId !== organizerId) {
      return res.status(403).json({ message: "Accès refusé : vous n'êtes pas l'organisateur principal." });
    }

    const existingCollab = await prisma.collaboration.findFirst({ where: { eventId, organizerSecondaireId: collaboratorId } });
    if (existingCollab) return res.status(400).json({ message: "Cet organisateur est déjà collaborateur." });

    const collaboration = await prisma.collaboration.create({
      data: { organizerPrincipalId: organizerId, organizerSecondaireId: collaboratorId, eventId }
    });

    res.status(201).json({ message: "Collaborateur ajouté !", collaboration });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur" });
  }
};

export const getCollaborators = async (req, res) => {
  try {
    const { eventId } = req.params;
    const collaborators = await prisma.collaboration.findMany({
      where: { eventId },
      include: { organizerSecondaire: true }
    });
    res.json(collaborators);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur" });
  }
};

export const removeCollaborator = async (req, res) => {
  try {
    const { eventId, collaboratorId } = req.params;
    const organizerId = req.user.id;

    const event = await prisma.event.findUnique({ where: { id: parseInt(eventId) } });
    if (!event || event.organizerId !== organizerId) {
      return res.status(403).json({ message: "Accès refusé : vous n'êtes pas l'organisateur principal." });
    }

    await prisma.collaboration.delete({
      where: {
        organizerSecondaireId_eventId: { organizerSecondaireId: parseInt(collaboratorId), eventId: parseInt(eventId) }
      }
    });

    res.json({ message: "Collaborateur supprimé." });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur" });
  }
};