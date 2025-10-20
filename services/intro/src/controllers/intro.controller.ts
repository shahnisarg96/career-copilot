import { Request, Response } from 'express';
import { prisma } from '@dissertation/prisma-client';

export const getIntros = async (req: Request, res: Response) => {
  try {
    const userId = (req.headers['x-user-id'] as string) || (req.query.userId as string);
    const where = userId ? { userId } : { userId: null };
    const items = await prisma.intro.findMany({ where, orderBy: { id: 'asc' } });
    res.json(items);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getIntroById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const item = await prisma.intro.findUnique({ where: { id: parseInt(id) } });
    if (!item) return res.status(404).json({ error: 'Intro not found' });
    res.json(item);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const createIntro = async (req: Request, res: Response) => {
  try {
    const userId = req.headers['x-user-id'] as string;
    if (!userId) return res.status(400).json({ error: 'Missing user context' });
    const created = await prisma.intro.create({ data: { ...req.body, userId } });
    res.status(201).json(created);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updateIntro = async (req: Request, res: Response) => {
  try {
    const userId = req.headers['x-user-id'] as string;
    if (!userId) return res.status(400).json({ error: 'Missing user context' });
    const { id } = req.params;
    const existing = await prisma.intro.findFirst({ where: { id: parseInt(id), userId } });
    if (!existing) return res.status(404).json({ error: 'Intro not found' });
    const updated = await prisma.intro.update({ where: { id: parseInt(id) }, data: req.body });
    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteIntro = async (req: Request, res: Response) => {
  try {
    const userId = req.headers['x-user-id'] as string;
    if (!userId) return res.status(400).json({ error: 'Missing user context' });
    const { id } = req.params;
    const existing = await prisma.intro.findFirst({ where: { id: parseInt(id), userId } });
    if (!existing) return res.status(404).json({ error: 'Intro not found' });
    await prisma.intro.delete({ where: { id: parseInt(id) } });
    res.status(204).send();
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const upsertIntroForUser = async (req: Request, res: Response) => {
  try {
    const userId = req.headers['x-user-id'] as string;
    if (!userId) return res.status(400).json({ error: 'Missing user context' });

    const body = Array.isArray(req.body) ? req.body[0] : req.body;
    if (!body || typeof body !== 'object') return res.status(400).json({ error: 'Invalid body' });

    const existing = await prisma.intro.findFirst({ where: { userId } });
    if (existing) {
      const updated = await prisma.intro.update({ where: { id: existing.id }, data: body });
      return res.json(updated);
    }

    const created = await prisma.intro.create({ data: { ...body, userId } });
    return res.status(201).json(created);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};
