import dotenv from 'dotenv';
import { Request, Response } from 'express';
import { randomBytes } from 'crypto';
import { prisma } from '@dissertation/prisma-client';

dotenv.config();

const normalizeBaseUrl = (value: string) => value.replace(/\/+$/, '');

// Prefer explicit config, else infer from request (supports reverse proxies/ingress)
const getFrontendBaseUrl = (req: Request): string => {
  const configured = (process.env.FRONTEND_URL || '').trim();
  if (configured) return normalizeBaseUrl(configured);

  const origin = (req.get('origin') || '').trim();
  if (origin) return normalizeBaseUrl(origin);

  const forwardedProto = (req.get('x-forwarded-proto') || '').split(',')[0]?.trim();
  const forwardedHost = (req.get('x-forwarded-host') || '').split(',')[0]?.trim();
  const host = (forwardedHost || req.get('host') || '').split(',')[0]?.trim();
  const proto = forwardedProto || req.protocol || 'http';

  if (host) return `${proto}://${host}`;
  return 'http://localhost:5173';
};

const buildPublicUrl = (req: Request, slug: string | null | undefined): string | null => {
  if (!slug) return null;
  return `${getFrontendBaseUrl(req)}/p/${slug}`;
};

// Generate a unique slug
const generateSlug = async (name: string): Promise<string> => {
  const baseSlug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  
  let slug = baseSlug;
  let attempts = 0;
  
  while (attempts < 10) {
    const existing = await prisma.portfolio.findUnique({ where: { publicSlug: slug } });
    if (!existing) return slug;
    
    // Add random suffix if slug exists
    const suffix = randomBytes(3).toString('hex');
    slug = `${baseSlug}-${suffix}`;
    attempts++;
  }
  
  // Fallback to completely random slug
  return randomBytes(8).toString('hex');
};

export const getPortfolioStatus = async (req: Request, res: Response) => {
  try {
    const rawUserId = (req.params as any)?.userId;
    if (rawUserId === undefined || rawUserId === null || rawUserId === '') {
      return res.status(400).json({ error: 'userId is required' });
    }
    const userId = String(rawUserId);

    let portfolio = await prisma.portfolio.findUnique({ where: { userId } });
    if (!portfolio) {
      portfolio = await prisma.portfolio.create({ 
        data: { userId, isPublished: false } 
      });
    }
    res.json({ 
      isPublished: portfolio.isPublished,
      publicSlug: portfolio.publicSlug,
      publicUrl: buildPublicUrl(req, portfolio.publicSlug)
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const publishPortfolio = async (req: Request, res: Response) => {
  try {
    const { userId: rawUserId, isPublished } = req.body as {
      userId?: string | number;
      isPublished?: boolean 
    };
    if (rawUserId === undefined || rawUserId === null || rawUserId === '' || typeof isPublished !== 'boolean') {
      return res.status(400).json({ 
        error: 'userId and isPublished are required' 
      });
    }

    const userId = String(rawUserId);

    let publicSlug: string | null = null;
    if (isPublished) {
      const existing = await prisma.portfolio.findUnique({ where: { userId } });
      if (existing?.publicSlug) {
        publicSlug = existing.publicSlug;
      } else {
        const intro = await prisma.intro.findFirst({
          where: { userId },
          select: { name: true },
        });

        const userName = intro?.name || 'portfolio';
        publicSlug = await generateSlug(userName);
      }
    }

    const portfolio = await prisma.portfolio.upsert({
      where: { userId },
      update: { isPublished, publicSlug },
      create: { userId, isPublished, publicSlug },
    });
    
    res.json({ 
      success: true, 
      isPublished: portfolio?.isPublished || false,
      publicSlug: portfolio?.publicSlug || null,
      publicUrl: buildPublicUrl(req, portfolio?.publicSlug)
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getPortfolioBySlug = async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    if (!slug) {
      return res.status(400).json({ error: 'slug is required' });
    }
    const portfolio = await prisma.portfolio.findUnique({ 
      where: { publicSlug: slug }
    });
    
    if (!portfolio || !portfolio.isPublished) {
      return res.status(404).json({ error: 'Portfolio not found or not published' });
    }
    
    res.json({ userId: portfolio.userId, isPublished: portfolio.isPublished });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
