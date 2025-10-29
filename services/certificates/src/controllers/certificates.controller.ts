import dotenv from 'dotenv';
import { Request, Response } from 'express';
import { prisma as sharedPrisma } from '@dissertation/prisma-client';

dotenv.config();

const prisma = sharedPrisma;
async function getPrisma() {
  return prisma;
}

export const getCertificates = async (req: Request, res: Response) => {
  try {
    const userId = (req.headers['x-user-id'] as string) || (req.query.userId as string);
    const where = userId ? { userId } : { userId: null };
    const prisma = await getPrisma();
    if (!prisma) return res.status(503).json({ error: 'DB not available' });
    const items = await prisma.certificate.findMany({ where, orderBy: { id: 'asc' } });
    res.json(items);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getCertificateById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const prisma = await getPrisma();
    if (!prisma) return res.status(503).json({ error: 'DB not available' });
    const item = await prisma.certificate.findUnique({ where: { id: parseInt(id) } });
    if (!item) return res.status(404).json({ error: 'Certificate not found' });
    res.json(item);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const createCertificate = async (req: Request, res: Response) => {
  try {
    const userId = req.headers['x-user-id'] as string;
    if (!userId) return res.status(400).json({ error: 'Missing user context' });
    const prisma = await getPrisma();
    if (!prisma) return res.status(503).json({ error: 'DB not available' });
    const created = await prisma.certificate.create({ data: { ...req.body, userId } });
    res.status(201).json(created);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updateCertificate = async (req: Request, res: Response) => {
  try {
    const userId = req.headers['x-user-id'] as string;
    if (!userId) return res.status(400).json({ error: 'Missing user context' });
    const { id } = req.params;
    const prisma = await getPrisma();
    if (!prisma) return res.status(503).json({ error: 'DB not available' });
    const existing = await prisma.certificate.findFirst({ where: { id: parseInt(id), userId } });
    if (!existing) return res.status(404).json({ error: 'Certificate not found' });
    const updated = await prisma.certificate.update({ where: { id: parseInt(id) }, data: req.body });
    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteCertificate = async (req: Request, res: Response) => {
  try {
    const userId = req.headers['x-user-id'] as string;
    if (!userId) return res.status(400).json({ error: 'Missing user context' });
    const { id } = req.params;
    const prisma = await getPrisma();
    if (!prisma) return res.status(503).json({ error: 'DB not available' });
    const existing = await prisma.certificate.findFirst({ where: { id: parseInt(id), userId } });
    if (!existing) return res.status(404).json({ error: 'Certificate not found' });
    await prisma.certificate.delete({ where: { id: parseInt(id) } });
    res.status(204).send();
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const replaceCertificatesForUser = async (req: Request, res: Response) => {
  try {
    const prisma = await getPrisma();
    if (!prisma) return res.status(503).json({ error: 'DB not available' });
    const userId = req.headers['x-user-id'] as string;
    if (!userId) return res.status(400).json({ error: 'Missing user context' });

    const items = Array.isArray(req.body) ? req.body : [];
    await prisma.certificate.deleteMany({ where: { userId } });

    if (items.length) {
      const data = items.map((it: any) => {
        const { id, userId: _ignoredUserId, createdAt, updatedAt, ...rest } = it || {};
        return { ...rest, userId };
      });
      await prisma.certificate.createMany({ data });
    }

    const fresh = await prisma.certificate.findMany({ where: { userId }, orderBy: { id: 'asc' } });
    return res.json(fresh);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};
