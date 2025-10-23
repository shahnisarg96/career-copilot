import dotenv from 'dotenv';
import { Request, Response } from 'express';
import { prisma as sharedPrisma } from '@dissertation/prisma-client';

dotenv.config();

const prisma = sharedPrisma;
async function getPrisma() {
  return prisma;
}

export const getAbouts = async (req: Request, res: Response) => {
  try {
    const prisma = await getPrisma();
    if (!prisma) return res.status(503).json({ error: 'DB not available' });
    const userId = (req.headers['x-user-id'] as string) || (req.query.userId as string);
    const where = userId ? { userId } : { userId: null };
    const items = await prisma.about.findMany({ where, orderBy: { id: 'asc' } });
    res.json(items);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getAboutById = async (req: Request, res: Response) => {
  try {
    const prisma = await getPrisma();
    if (!prisma) return res.status(503).json({ error: 'DB not available' });
    const { id } = req.params;
    const item = await prisma.about.findUnique({ where: { id: parseInt(id) } });
    if (!item) return res.status(404).json({ error: 'About not found' });
    res.json(item);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const createAbout = async (req: Request, res: Response) => {
  try {
    const prisma = await getPrisma();
    if (!prisma) return res.status(503).json({ error: 'DB not available' });
    const userId = req.headers['x-user-id'] as string;
    if (!userId) return res.status(400).json({ error: 'Missing user context' });
    const created = await prisma.about.create({ data: { ...req.body, userId } });
    res.status(201).json(created);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updateAbout = async (req: Request, res: Response) => {
  try {
    const prisma = await getPrisma();
    if (!prisma) return res.status(503).json({ error: 'DB not available' });
    const userId = req.headers['x-user-id'] as string;
    if (!userId) return res.status(400).json({ error: 'Missing user context' });
    const { id } = req.params;
    const existing = await prisma.about.findFirst({ where: { id: parseInt(id), userId } });
    if (!existing) return res.status(404).json({ error: 'About not found' });
    const updated = await prisma.about.update({ where: { id: parseInt(id) }, data: req.body });
    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteAbout = async (req: Request, res: Response) => {
  try {
    const prisma = await getPrisma();
    if (!prisma) return res.status(503).json({ error: 'DB not available' });
    const userId = req.headers['x-user-id'] as string;
    if (!userId) return res.status(400).json({ error: 'Missing user context' });
    const { id } = req.params;
    const existing = await prisma.about.findFirst({ where: { id: parseInt(id), userId } });
    if (!existing) return res.status(404).json({ error: 'About not found' });
    await prisma.about.delete({ where: { id: parseInt(id) } });
    res.status(204).send();
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const upsertAboutForUser = async (req: Request, res: Response) => {
  try {
    const prisma = await getPrisma();
    if (!prisma) return res.status(503).json({ error: 'DB not available' });
    const userId = req.headers['x-user-id'] as string;
    if (!userId) return res.status(400).json({ error: 'Missing user context' });

    const body = Array.isArray(req.body) ? req.body[0] : req.body;
    if (!body || typeof body !== 'object') return res.status(400).json({ error: 'Invalid body' });

    const existing = await prisma.about.findFirst({ where: { userId } });
    if (existing) {
      const updated = await prisma.about.update({ where: { id: existing.id }, data: body });
      return res.json(updated);
    }

    const created = await prisma.about.create({ data: { ...body, userId } });
    return res.status(201).json(created);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};
