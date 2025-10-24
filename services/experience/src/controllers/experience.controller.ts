import dotenv from 'dotenv';
import { Request, Response } from 'express';
import { prisma as sharedPrisma } from '@dissertation/prisma-client';

dotenv.config();

const prisma = sharedPrisma;
async function getPrisma() {
  return prisma;
}

export const getExperiences = async (req: Request, res: Response) => {
  try {
    const prisma = await getPrisma();
    if (!prisma) return res.status(503).json({ error: 'DB not available' });
    const userId = (req.headers['x-user-id'] as string) || (req.query.userId as string);
    const where = userId ? { userId } : { userId: null };
    const items = await prisma.experience.findMany({ where, orderBy: { id: 'asc' } });
    res.json(items);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getExperienceById = async (req: Request, res: Response) => {
  try {
    const prisma = await getPrisma();
    if (!prisma) return res.status(503).json({ error: 'DB not available' });
    const { id } = req.params;
    const item = await prisma.experience.findUnique({ where: { id: parseInt(id) } });
    if (!item) return res.status(404).json({ error: 'Experience not found' });
    res.json(item);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const createExperience = async (req: Request, res: Response) => {
  try {
    const prisma = await getPrisma();
    if (!prisma) return res.status(503).json({ error: 'DB not available' });
    const userId = req.headers['x-user-id'] as string;
    if (!userId) return res.status(400).json({ error: 'Missing user context' });
    const created = await prisma.experience.create({ data: { ...req.body, userId } });
    res.status(201).json(created);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updateExperience = async (req: Request, res: Response) => {
  try {
    const prisma = await getPrisma();
    if (!prisma) return res.status(503).json({ error: 'DB not available' });
    const userId = req.headers['x-user-id'] as string;
    if (!userId) return res.status(400).json({ error: 'Missing user context' });
    const { id } = req.params;
    const existing = await prisma.experience.findFirst({ where: { id: parseInt(id), userId } });
    if (!existing) return res.status(404).json({ error: 'Experience not found' });
    const updated = await prisma.experience.update({ where: { id: parseInt(id) }, data: req.body });
    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteExperience = async (req: Request, res: Response) => {
  try {
    const prisma = await getPrisma();
    if (!prisma) return res.status(503).json({ error: 'DB not available' });
    const userId = req.headers['x-user-id'] as string;
    if (!userId) return res.status(400).json({ error: 'Missing user context' });
    const { id } = req.params;
    const existing = await prisma.experience.findFirst({ where: { id: parseInt(id), userId } });
    if (!existing) return res.status(404).json({ error: 'Experience not found' });
    await prisma.experience.delete({ where: { id: parseInt(id) } });
    res.status(204).send();
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const replaceExperiencesForUser = async (req: Request, res: Response) => {
  try {
    const prisma = await getPrisma();
    if (!prisma) return res.status(503).json({ error: 'DB not available' });
    const userId = req.headers['x-user-id'] as string;
    if (!userId) return res.status(400).json({ error: 'Missing user context' });

    const items = Array.isArray(req.body) ? req.body : [];
    await prisma.experience.deleteMany({ where: { userId } });

    if (items.length) {
      const data = items.map((it: any) => {
        const { id, userId: _ignoredUserId, createdAt, updatedAt, ...rest } = it || {};
        return { ...rest, userId };
      });
      await prisma.experience.createMany({ data });
    }

    const fresh = await prisma.experience.findMany({ where: { userId }, orderBy: { id: 'asc' } });
    return res.json(fresh);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};
