import express from 'express';
import { inviteUser, respondToInvitation } from '../controllers/invitation.controller.js';
import authMiddleware from '../middlewares/authMiddleware.js';
import checkRole from '../middlewares/roleMiddleware.js';

const router = express.Router();

router.post('/invite', authMiddleware, checkRole(['ADMIN', 'ORGANISATEUR']), inviteUser);
router.post('/respond', authMiddleware, respondToInvitation);

export default router;