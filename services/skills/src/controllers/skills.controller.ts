import dotenv from 'dotenv';
import { Request, Response } from 'express';
import { prisma as sharedPrisma } from '@dissertation/prisma-client';

dotenv.config();

const prisma = sharedPrisma;
async function getPrisma() {
  return prisma;
}

export const getSkills = async (req: Request, res: Response) => {
  try {
    const userId = (req.headers['x-user-id'] as string) || (req.query.userId as string);
    const where = userId ? { userId } : { userId: null };
    const prisma = await getPrisma();
    if (!prisma) return res.status(503).json({ error: 'DB not available' });
    const items = await prisma.skill.findMany({ where, orderBy: { id: 'asc' } });
    res.json(items);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getSkillById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const prisma = await getPrisma();
    if (!prisma) return res.status(503).json({ error: 'DB not available' });
    const item = await prisma.skill.findUnique({ where: { id: parseInt(id) } });
    if (!item) return res.status(404).json({ error: 'Skill not found' });
    res.json(item);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const createSkill = async (req: Request, res: Response) => {
  try {
    const prisma = await getPrisma();
    if (!prisma) return res.status(503).json({ error: 'DB not available' });
    const userId = req.headers['x-user-id'] as string;
    if (!userId) return res.status(400).json({ error: 'Missing user context' });
    const created = await prisma.skill.create({ data: { ...req.body, userId } });
    res.status(201).json(created);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updateSkill = async (req: Request, res: Response) => {
  try {
    const prisma = await getPrisma();
    if (!prisma) return res.status(503).json({ error: 'DB not available' });
    const userId = req.headers['x-user-id'] as string;
    if (!userId) return res.status(400).json({ error: 'Missing user context' });
    const { id } = req.params;
    const existing = await prisma.skill.findFirst({ where: { id: parseInt(id), userId } });
    if (!existing) return res.status(404).json({ error: 'Skill not found' });
    const updated = await prisma.skill.update({ where: { id: parseInt(id) }, data: req.body });
    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteSkill = async (req: Request, res: Response) => {
  try {
    const prisma = await getPrisma();
    if (!prisma) return res.status(503).json({ error: 'DB not available' });
    const userId = req.headers['x-user-id'] as string;
    if (!userId) return res.status(400).json({ error: 'Missing user context' });
    const { id } = req.params;
    const existing = await prisma.skill.findFirst({ where: { id: parseInt(id), userId } });
    if (!existing) return res.status(404).json({ error: 'Skill not found' });
    await prisma.skill.delete({ where: { id: parseInt(id) } });
    res.status(204).send();
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const replaceSkillsForUser = async (req: Request, res: Response) => {
  try {
    const prisma = await getPrisma();
    if (!prisma) return res.status(503).json({ error: 'DB not available' });
    const userId = req.headers['x-user-id'] as string;
    if (!userId) return res.status(400).json({ error: 'Missing user context' });

    const items = Array.isArray(req.body) ? req.body : [];
    await prisma.skill.deleteMany({ where: { userId } });

    if (items.length) {
      const data = items.map((it: any) => {
        const { id, userId: _ignoredUserId, createdAt, updatedAt, ...rest } = it || {};
        return { ...rest, userId };
      });
      await prisma.skill.createMany({ data });
    }

    const fresh = await prisma.skill.findMany({ where: { userId }, orderBy: { id: 'asc' } });
    return res.json(fresh);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};
