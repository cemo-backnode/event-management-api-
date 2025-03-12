import prisma from '../config/prismaClient.js';

export const getWallet = async (req, res) => {
  try {
    const wallet = await prisma.wallet.findUnique({ where: { userId: req.user.id } });
    res.json(wallet);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

export const deposit = async (req, res) => {
  try {
    const { amount } = req.body;

    const wallet = await prisma.wallet.update({
      where: { userId: req.user.id },
      data: { balance: { increment: amount } },
    });

    await prisma.transaction.create({
      data: { userId: req.user.id, amount, type: 'DEPOSIT' },
    });

    res.json(wallet);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

export const withdraw = async (req, res) => {
  try {
    const { amount } = req.body;

    const wallet = await prisma.wallet.update({
      where: { userId: req.user.id },
      data: { balance: { decrement: amount } },
    });

    await prisma.transaction.create({
      data: { userId: req.user.id, amount, type: 'WITHDRAWAL' },
    });

    res.json(wallet);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
};