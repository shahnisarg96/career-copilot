import { Express, Request, Response } from 'express';
import { config } from '../config/index.js';
import { createServiceProxy } from '../utils/proxy.js';

/**
 * Sets up application routes for all portfolio microservices.
 * @param app - The Express application instance.
 */
export function setupRoutes(app: Express) {
  /**
   * Health check route.
   */
  app.get('/health', (_: Request, res: Response) => {
    res.json({ status: 'UP' });
  });

  // Public routes (no auth required)
  app.use('/auth', createServiceProxy(config.AUTH_SERVICE_URL, { '^/auth': '/auth' }));
  
  // Portfolio section routes (public)
  app.use('/intro', createServiceProxy(config.INTRO_SERVICE_URL, { '^/intro': '/intro' }));
  app.use('/about', createServiceProxy(config.ABOUT_SERVICE_URL, { '^/about': '/about' }));
  app.use('/experience', createServiceProxy(config.EXPERIENCE_SERVICE_URL, { '^/experience': '/experience' }));
  app.use('/projects', createServiceProxy(config.PROJECTS_SERVICE_URL, { '^/projects': '/projects' }));
  app.use('/skills', createServiceProxy(config.SKILLS_SERVICE_URL, { '^/skills': '/skills' }));
  app.use('/certificates', createServiceProxy(config.CERTIFICATES_SERVICE_URL, { '^/certificates': '/certificates' }));
  app.use('/education', createServiceProxy(config.EDUCATION_SERVICE_URL, { '^/education': '/education' }));
  app.use('/portfolio', createServiceProxy(config.PORTFOLIO_SERVICE_URL, { '^/portfolio': '/portfolio' }));
  app.use('/contact', createServiceProxy(config.CONTACT_SERVICE_URL, { '^/contact': '/contact' }));
  
  // AI service route
  app.use('/ai', createServiceProxy(config.AI_SERVICE_URL, { '^/ai': '/ai' }));

  // Admin routes (JWT required via app.ts middleware)
  app.use('/admin/intro', createServiceProxy(config.INTRO_SERVICE_URL, { '^/admin/intro': '/intro' }));
  app.use('/admin/about', createServiceProxy(config.ABOUT_SERVICE_URL, { '^/admin/about': '/about' }));
  app.use('/admin/experience', createServiceProxy(config.EXPERIENCE_SERVICE_URL, { '^/admin/experience': '/experience' }));
  app.use('/admin/projects', createServiceProxy(config.PROJECTS_SERVICE_URL, { '^/admin/projects': '/projects' }));
  app.use('/admin/skills', createServiceProxy(config.SKILLS_SERVICE_URL, { '^/admin/skills': '/skills' }));
  app.use('/admin/certificates', createServiceProxy(config.CERTIFICATES_SERVICE_URL, { '^/admin/certificates': '/certificates' }));

  // Services that already expose admin subroutes
  app.use('/admin/education', createServiceProxy(config.EDUCATION_SERVICE_URL, { '^/admin/education': '/education/admin' }));
  app.use('/admin/contact', createServiceProxy(config.CONTACT_SERVICE_URL, { '^/admin/contact': '/contact/admin' }));

  // Portfolio service owns portfolio admin routes at /admin/portfolio/*
  app.use('/admin/portfolio', createServiceProxy(config.PORTFOLIO_SERVICE_URL, { '^/admin/portfolio': '/admin/portfolio' }));
}
