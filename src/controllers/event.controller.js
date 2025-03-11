// 📌 src/controllers/event.controller.js - Gestion des événements avec filtres, tri et pagination
import prisma from "../config/prismaClient.js";

export const createEvent = async (req, res) => {
  try {
    const {
      titre,
      description,
      dateDebut,
      dateFin,
      heureDebut,
      heureFin,
      lieu,
      capacite,
      typeId,
    } = req.body;
    const event = await prisma.event.create({
      data: {
        titre,
        description,
        dateDebut: new Date(dateDebut),
        dateFin: new Date(dateFin),
        heureDebut,
        heureFin,
        lieu,
        capacite,
        typeId,
        organizerId: req.user.id,
      },
    });
    res.status(201).json(event);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur" });
  }
};

export const getEvents = async (req, res) => {
  try {
    const { search, typeId, date, lieu, sortBy, order, page, limit } =
      req.query;

    const filters = {};
    if (search) {
      filters.OR = [
        { titre: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }
    if (typeId) filters.typeId = parseInt(typeId);
    if (date) filters.dateDebut = { gte: new Date(date) };
    if (lieu) filters.lieu = { contains: lieu, mode: "insensitive" };

    const sorting = {};
    if (sortBy) {
      sorting[sortBy] = order === "desc" ? "desc" : "asc";
    }

    const pageNumber = parseInt(page) || 1;
    const pageSize = parseInt(limit) || 10;
    const skip = (pageNumber - 1) * pageSize;

    const events = await prisma.event.findMany({
      where: filters,
      orderBy: sorting,
      skip: skip,
      take: pageSize,
    });

    const totalEvents = await prisma.event.count({ where: filters });

    res.json({
      total: totalEvents,
      page: pageNumber,
      totalPages: Math.ceil(totalEvents / pageSize),
      events,
    });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur" });
  }
};

export const deleteEvent = async (req, res) => {
  try {
    await prisma.event.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ message: "Événement supprimé" });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur" });
  }
};

export const addVisual = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { type } = req.body;
    const visual = await prisma.visual.create({
      data: {
        url: req.file.path,
        type,
        eventId: parseInt(eventId, 10),
      },
    });
    res.status(201).json({ message: "Visual added", visual });
  } catch (error) {
    console.error("Add visual error:", error);
    res.status(500).json({ error: "Server error" });
  }
};
