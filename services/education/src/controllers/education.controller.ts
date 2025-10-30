import dotenv from 'dotenv';
import { Request, Response } from 'express';
import { prisma as sharedPrisma } from '@dissertation/prisma-client';

dotenv.config();

const prisma = sharedPrisma;
async function getPrisma() {
  return prisma;
}

export const getEducation = async (req: Request, res: Response) => {
  try {
    const userId = (req.headers['x-user-id'] as string) || (req.query.userId as string);
    const where = userId ? { userId } : { userId: null };
    const prisma = await getPrisma();
    if (!prisma) return res.status(503).json({ error: 'DB not available' });
    const education = await prisma.education.findMany({
      where,
      orderBy: { id: 'asc' },
    });
    res.json(education);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getEducationById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const prisma = await getPrisma();
    if (!prisma) return res.status(503).json({ error: 'DB not available' });
    const education = await prisma.education.findUnique({
      where: { id: parseInt(id) },
    });
    if (!education) {
      return res.status(404).json({ error: 'Education not found' });
    }
    res.json(education);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const createEducation = async (req: Request, res: Response) => {
  try {
    const userId = req.headers['x-user-id'] as string;
    if (!userId) return res.status(400).json({ error: 'Missing user context' });
    const prisma = await getPrisma();
    if (!prisma) return res.status(503).json({ error: 'DB not available' });
    const education = await prisma.education.create({
      data: { ...req.body, userId },
    });
    res.status(201).json(education);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updateEducation = async (req: Request, res: Response) => {
  try {
    const userId = req.headers['x-user-id'] as string;
    if (!userId) return res.status(400).json({ error: 'Missing user context' });
    
    const { id } = req.params;
    const prisma = await getPrisma();
    if (!prisma) return res.status(503).json({ error: 'DB not available' });
    const existing = await prisma.education.findFirst({ where: { id: parseInt(id), userId } });
    if (!existing) return res.status(404).json({ error: 'Education not found' });
    
    const education = await prisma.education.update({
      where: { id: parseInt(id) },
      data: req.body,
    });
    res.json(education);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteEducation = async (req: Request, res: Response) => {
  try {
    const userId = req.headers['x-user-id'] as string;
    if (!userId) return res.status(400).json({ error: 'Missing user context' });
    
    const { id } = req.params;
    const prisma = await getPrisma();
    if (!prisma) return res.status(503).json({ error: 'DB not available' });
    const existing = await prisma.education.findFirst({ where: { id: parseInt(id), userId } });
    if (!existing) return res.status(404).json({ error: 'Education not found' });
    
    await prisma.education.delete({
      where: { id: parseInt(id) },
    });
    res.status(204).send();
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const replaceEducationForUser = async (req: Request, res: Response) => {
  try {
    const userId = req.headers['x-user-id'] as string;
    if (!userId) return res.status(400).json({ error: 'Missing user context' });

    const prisma = await getPrisma();
    if (!prisma) return res.status(503).json({ error: 'DB not available' });

    const items = Array.isArray(req.body) ? req.body : [];
    await prisma.education.deleteMany({ where: { userId } });

    if (items.length) {
      const data = items.map((it: any) => {
        const { id, userId: _ignoredUserId, createdAt, updatedAt, ...rest } = it || {};
        return { ...rest, userId };
      });
      await prisma.education.createMany({ data });
    }

    const fresh = await prisma.education.findMany({ where: { userId }, orderBy: { id: 'asc' } });
    return res.json(fresh);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};
