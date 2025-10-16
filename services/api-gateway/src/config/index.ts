import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

/**
 * Configuration object for the API Gateway.
 * Contains service URLs and gateway settings for portfolio microservices.
 */
export const config = {
  port: process.env.PORT || '8080',
  requestTimeout: process.env.REQUEST_TIMEOUT || '10000',
  points: parseInt(process.env.RATE_LIMIT_POINTS || '1000'),
  duration: parseInt(process.env.RATE_LIMIT_DURATION || '60'),
  maxRetries: parseInt(process.env.MAX_RETRIES || '3'),

  // Portfolio Microservices URLs
  AUTH_SERVICE_URL: process.env.AUTH_SERVICE_URL || 'http://auth-service:8081/',
  INTRO_SERVICE_URL: process.env.INTRO_SERVICE_URL || 'http://intro-service:8082/',
  ABOUT_SERVICE_URL: process.env.ABOUT_SERVICE_URL || 'http://about-service:8083/',
  EXPERIENCE_SERVICE_URL: process.env.EXPERIENCE_SERVICE_URL || 'http://experience-service:8084/',
  PROJECTS_SERVICE_URL: process.env.PROJECTS_SERVICE_URL || 'http://projects-service:8085/',
  SKILLS_SERVICE_URL: process.env.SKILLS_SERVICE_URL || 'http://skills-service:8086/',
  CERTIFICATES_SERVICE_URL: process.env.CERTIFICATES_SERVICE_URL || 'http://certificates-service:8087/',
  EDUCATION_SERVICE_URL: process.env.EDUCATION_SERVICE_URL || 'http://education-service:8088/',
  PORTFOLIO_SERVICE_URL: process.env.PORTFOLIO_SERVICE_URL || 'http://portfolio-service:8090/',
  CONTACT_SERVICE_URL: process.env.CONTACT_SERVICE_URL || 'http://contact-service:8089/',
  AI_SERVICE_URL: process.env.AI_SERVICE_URL || 'http://ai-service:8091/',
};
