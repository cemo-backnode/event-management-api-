import express from 'express';
import { getWallet, deposit, withdraw } from '../controllers/wallet.controller.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/', authMiddleware, getWallet);
router.post('/deposit', authMiddleware, deposit);
router.post('/withdraw', authMiddleware, withdraw);

export default router;