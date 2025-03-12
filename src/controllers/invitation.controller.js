import prisma from '../config/prismaClient.js';

export const inviteUser = async (req, res) => {
  try {
    const { eventId, userId } = req.body;

    const invitation = await prisma.invitation.create({
      data: { eventId, userId },
    });

    res.status(201).json({ message: 'Invitation envoyée', invitation });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

export const respondToInvitation = async (req, res) => {
  try {
    const { invitationId, status } = req.body;

    const invitation = await prisma.invitation.update({
      where: { id: invitationId },
      data: { status },
    });

    res.status(200).json({ message: 'Réponse enregistrée', invitation });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
};