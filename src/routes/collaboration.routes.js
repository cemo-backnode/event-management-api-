import express from 'express';
import { addCollaborator, getCollaborators, removeCollaborator } from '../controllers/collaboration.controller.js';
import authMiddleware from '../middlewares/authMiddleware.js';
import checkRole from '../middlewares/roleMiddleware.js';

const router = express.Router();

// Ajouter un collaborateur (Organisateur principal)
router.post('/add', authMiddleware, checkRole(['ORGANISATEUR']), addCollaborator);

// Récupérer les collaborateurs d'un événement
router.get('/:eventId', authMiddleware, getCollaborators);

// Supprimer un collaborateur (Organisateur principal)
router.delete('/:eventId/:collaboratorId', authMiddleware, checkRole(['ORGANISATEUR']), removeCollaborator);

export default router;