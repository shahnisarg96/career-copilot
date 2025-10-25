import dotenv from 'dotenv';
import { Request, Response } from 'express';
import { prisma as sharedPrisma } from '@dissertation/prisma-client';

dotenv.config();

const prisma = sharedPrisma;
async function getPrisma() {
  return prisma;
}

export const getProjects = async (req: Request, res: Response) => {
  try {
    const prisma = await getPrisma();
    if (!prisma) return res.status(503).json({ error: 'DB not available' });
    const userId = (req.headers['x-user-id'] as string) || (req.query.userId as string);
    const where = userId ? { userId } : { userId: null };
    const items = await prisma.project.findMany({ where, orderBy: { id: 'asc' } });
    res.json(items);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getProjectById = async (req: Request, res: Response) => {
  try {
    const prisma = await getPrisma();
    if (!prisma) return res.status(503).json({ error: 'DB not available' });
    const { id } = req.params;
    const item = await prisma.project.findUnique({ where: { id: parseInt(id) } });
    if (!item) return res.status(404).json({ error: 'Project not found' });
    res.json(item);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const createProject = async (req: Request, res: Response) => {
  try {
    const prisma = await getPrisma();
    if (!prisma) return res.status(503).json({ error: 'DB not available' });
    const userId = req.headers['x-user-id'] as string;
    if (!userId) return res.status(400).json({ error: 'Missing user context' });
    const created = await prisma.project.create({ data: { ...req.body, userId } });
    res.status(201).json(created);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updateProject = async (req: Request, res: Response) => {
  try {
    const userId = req.headers['x-user-id'] as string;
    if (!userId) return res.status(400).json({ error: 'Missing user context' });
    const { id } = req.params;
    const prisma = await getPrisma();
    if (!prisma) return res.status(503).json({ error: 'DB not available' });
    const existing = await prisma.project.findFirst({ where: { id: parseInt(id), userId } });
    if (!existing) return res.status(404).json({ error: 'Project not found' });
    const updated = await prisma.project.update({ where: { id: parseInt(id) }, data: req.body });
    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteProject = async (req: Request, res: Response) => {
  try {
    const userId = req.headers['x-user-id'] as string;
    if (!userId) return res.status(400).json({ error: 'Missing user context' });
    const { id } = req.params;
    const prisma = await getPrisma();
    if (!prisma) return res.status(503).json({ error: 'DB not available' });
    const existing = await prisma.project.findFirst({ where: { id: parseInt(id), userId } });
    if (!existing) return res.status(404).json({ error: 'Project not found' });
    await prisma.project.delete({ where: { id: parseInt(id) } });
    res.status(204).send();
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const replaceProjectsForUser = async (req: Request, res: Response) => {
  try {
    const prisma = await getPrisma();
    if (!prisma) return res.status(503).json({ error: 'DB not available' });
    const userId = req.headers['x-user-id'] as string;
    if (!userId) return res.status(400).json({ error: 'Missing user context' });

    const items = Array.isArray(req.body) ? req.body : [];
    await prisma.project.deleteMany({ where: { userId } });

    if (items.length) {
      const data = items.map((it: any) => {
        const { id, userId: _ignoredUserId, createdAt, updatedAt, ...rest } = it || {};
        return { ...rest, userId };
      });
      await prisma.project.createMany({ data });
    }

    const fresh = await prisma.project.findMany({ where: { userId }, orderBy: { id: 'asc' } });
    return res.json(fresh);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};
