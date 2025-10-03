# Portfolio Microservices Architecture

> **Production-ready microservices system with AI-powered portfolio generation, designed for Kubernetes deployment**

A comprehensive portfolio management system built with microservices architecture, featuring AI-powered portfolio generation, public/private portfolio publishing, and a complete admin dashboard.

## ✨ Key Features

- 🤖 **AI Portfolio Wizard** - Build your entire portfolio through natural conversation (OpenAI-powered)
- 🌐 **Public Portfolio Publishing** - Generate unique shareable URLs for your portfolio
- 🔐 **JWT Authentication** - Secure admin access with role-based permissions
- 📱 **Responsive Design** - Works seamlessly on desktop, tablet, and mobile
- 🚀 **Microservices Architecture** - 12+ independent, scalable services
- ☸️ **Kubernetes-Ready** - Services are independently deployable (shared schema managed centrally)
- 🐳 **Docker Compose** - One-command deployment for local development
- 📊 **Real-time Updates** - Live preview and instant data synchronization
- 🎨 **Modern UI** - React with Vite, smooth animations, gradient themes

## 🏗️ Architecture Overview

This repo is a **monorepo** with shared packages and independently deployable services. It uses:

- **Shared Prisma schema + client** in `packages/prisma-client`
- **Shared utilities** in `packages/common`
- **One DB sync + seed job** (`db-sync`) that applies the schema and seeds defaults for local/dev

### Services

- **API Gateway** (8080) - Routing, auth verification, rate limiting
- **Auth Service** (8081) - JWT authentication with RSA keys
- **Intro Service** (8082) - Personal introduction management
- **About Service** (8083) - About section management
- **Experience Service** (8084) - Work experience management
- **Projects Service** (8085) - Project portfolio management
- **Skills Service** (8086) - Skills and competencies management
- **Certificates Service** (8087) - Certifications management
- **Education Service** (8088) - Education history management
- **Contact Service** (8089) - Contact information management
- **Portfolio Service** (8090) - Portfolio aggregation & publishing
- **AI Service** (8091) - OpenAI-powered content generation
- **React Frontend** (5173) - User interface
- **PostgreSQL** (5433) - Shared database
- **PgAdmin** (5050) - Database management UI

## 📋 Prerequisites

- **Docker + Docker Compose v2** - Container orchestration (`docker compose`)
- **Node.js 22+** - For local development (matches Docker runtime)
- **Git** - Version control
- **OpenAI API Key** - Optional, for AI features (can use mock mode)

## 🚀 Quick Start (Automated Setup)

```bash
# Clone repository
git clone <your-repo-url>
cd Dissertation

# Run automated setup script (handles everything)
bash setup.sh
```

The setup script will:
1. ✅ Validate environment prerequisites
2. ✅ Start all services with Docker Compose
3. ✅ Run DB sync + seed (via `db-sync`)

## 🛠️ Manual Setup (Alternative)

### Start Services

```bash
docker compose up -d --build
```

### 4. Access Application

- **Frontend**: http://localhost:5173
- **API Gateway**: http://localhost:8080
- **PgAdmin**: http://localhost:5050 (admin@example.com / your_password)
- **API Docs**: http://localhost:8080/api-docs

## 🗄️ Database Architecture

### Current Pattern: **Shared schema managed centrally**

- Prisma schema lives in `packages/prisma-client/prisma/schema.prisma`
- Local/dev startup runs `db-sync` which:
	- resets DB (dev/demo),
	- applies schema (`prisma db push` by default),
	- seeds default users + public portfolio data (`packages/prisma-client/prisma/seed.mjs`)

### Migrations (how it works now)

- Migrations are centralized (if/when you create them) under `packages/prisma-client/prisma/migrations`.
- `db-sync` will automatically run `prisma migrate deploy` **if** that migrations folder exists and is non-empty.
- If there are no migrations yet, `db-sync` falls back to `prisma db push --force-reset --accept-data-loss` (local/dev convenience).
- Services do **not** run migrations or seed on startup. Only `db-sync` mutates the DB schema/data.

To start using migrations:

```bash
npm install
npm run prisma:migrate:dev -w @dissertation/prisma-client
```

**Database Setup:**
```
Single PostgreSQL Instance (shared for cost efficiency)
├── User table          → Auth Service
├── Intro table         → Intro Service  
├── About table         → About Service
├── Experience table    → Experience Service
├── Project table       → Projects Service
├── Skill table         → Skills Service
├── Certificate table   → Certificates Service
├── Education table     → Education Service
├── Contact table       → Contact Service
└── Portfolio table     → Portfolio Service
```

**Why This Pattern?**
- ✅ Each service independently deployed in K8s
- ✅ Shared Prisma schema/client via `packages/prisma-client`
- ✅ Service teams work autonomously
- ✅ Easy to scale to separate databases later
- ✅ Clean bounded contexts

**Migration to Separate Databases:** When traffic grows, simply update `DATABASE_URL` per service to point to separate PostgreSQL instances.

## 🔧 Development

### Local Development (Single Service)

```bash
npm install
cd services/auth
npm run dev
# Service runs on http://localhost:8081
```

### Database Operations (Central Prisma)

```bash
# Generate Prisma client (used by all services)
npm run prisma:generate

# Apply migrations (production-style)
npm run prisma:migrate
```

### Docker Development

```bash
# Start specific services
docker compose up postgres api-gateway auth-service

# Rebuild after code changes
docker compose build auth-service
docker compose up -d auth-service

# View logs
docker compose logs -f auth-service
```

## 🔐 Security Considerations

### Before Pushing to GitHub

1. ✅ All sensitive files are in `.gitignore`
2. ✅ Keys directory is excluded
3. ✅ `.env` files are excluded
4. ✅ Logs directory is excluded
5. ✅ Generated Prisma files are excluded

### What's NOT in Git

- `*.pem` and `*.key` files (JWT keys)
- `.env` files (environment variables)
- `logs/` directories
- `node_modules/`
- `dist/` and `build/` directories
- `prisma/generated/` directories
- Database volumes

### What IS in Git

- Source code
- `Dockerfile.template` and `Dockerfile.prisma`
- `docker-compose.yml`
- Configuration files

## 📦 Service Structure

Each service follows a similar structure:

```
services/{service}/
├── src/
│   ├── app.ts              # Express app setup
│   ├── server.ts           # Server entry point
│   ├── config/             # Configuration
│   ├── controllers/        # Request handlers
│   ├── middlewares/        # Express middlewares
│   ├── routes/             # API routes
│   └── utils/              # Utility functions
├── package.json
└── tsconfig.json
```

Database schema + Prisma client are centralized in `packages/prisma-client`.

## 📝 API Documentation

API documentation is available via Swagger UI:

- Swagger UI: http://localhost:8080/api-docs

## 🐛 Troubleshooting

### Port Conflicts

If ports are already in use, override the compose defaults (for example by exporting env vars or using a local `.env` with Docker Compose):

```env
POSTGRES_PORT=5434
GATEWAY_PORT=8081
```

### Database Connection Issues

```bash
# Reset database
docker compose down -v
docker compose up -d postgres
docker compose up -d
```

### Key Generation Issues

Ensure OpenSSL is installed:

```bash
# Windows (via Git Bash or WSL)
openssl version

# macOS (via Homebrew)
brew install openssl

# Linux
sudo apt-get install openssl
```

## 🔄 Updating Services

```bash
# Rebuild specific service
docker compose build auth-service
docker compose up -d auth-service

# Rebuild all services
docker compose build
docker compose up -d
```

## 🛑 Stopping Services

```bash
# Stop all services
docker compose down

# Stop and remove volumes (CAUTION: deletes data)
docker compose down -v

# Stop specific service
docker compose stop auth-service
```

## 📊 Monitoring

```bash
# View logs for all services
docker compose logs -f

# View logs for specific service
docker compose logs -f auth-service

# View resource usage
docker stats
```

## ☸️ Deployment Notes (Independent Services)

- Each service is deployable as its own container image (gateway, auth, each portfolio domain service, AI service).
- Services currently share a single PostgreSQL database/schema (managed centrally via `packages/prisma-client`).

Build a single service image using the shared template:

```bash
docker build -f Dockerfile.template --build-arg SERVICE_NAME=auth -t auth-service:latest .
```

For CI/CD, the simplest approach is to keep the monorepo and build/push one image per service. You only need to publish shared packages to a registry if you later split services into separate repos.

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly with `docker compose up`
4. Ensure all services start correctly
5. Submit a pull request

## 🎯 Key Functionalities

### AI Portfolio Wizard
- Conversational interface to build complete portfolio
- Automatically structures and saves data across all services
- Progress tracking through 8 portfolio sections
- Smart data extraction from natural language

### Public Portfolio Publishing
- Generate unique, shareable URLs: `/p/your-name-slug`
- Publish/unpublish with one click
- Public portfolios viewable without login
- Dynamic SEO-friendly titles

### Admin Dashboard
- Comprehensive portfolio management
- Real-time preview mode
- Section-by-section editing
- Bulk import/export capabilities

## 📁 Project Structure

```
Dissertation/
├── packages/
│   ├── common/                # Shared utilities
│   └── prisma-client/         # Shared Prisma schema + client + seed
│
├── services/
│   ├── api-gateway/           # API Gateway (8080)
│   ├── auth/                  # Authentication (8081)
│   ├── intro/                 # Intro (8082)
│   ├── about/                 # About (8083)
│   ├── experience/            # Experience (8084)
│   ├── projects/              # Projects (8085)
│   ├── skills/                # Skills (8086)
│   ├── certificates/          # Certificates (8087)
│   ├── education/             # Education (8088)
│   ├── contact/               # Contact (8089)
│   ├── portfolio/             # Portfolio aggregation (8090)
│   └── ai/                    # AI service (8091)
│
├── react-portfolio/           # Frontend (5173)
│   ├── src/
│   │   ├── pages/             # React pages
│   │   └── utils/             # API base config
│   └── Dockerfile             # Frontend container
│
├── docker-compose.yml         # Local development orchestration
├── .gitignore                # Git exclusions
├── setup.sh                  # Automated setup script
└── README.md                 # This file
```

**Key Points:**
- Services are deployable independently, but share common packages (`packages/*`) and currently share one DB.
- Prisma schema/seed are centralized; per-service Prisma folders are intentionally removed.
- For independent deployments, build/push one image per service from this monorepo.

## 🔐 Security Features

- JWT-based authentication with RSA key pairs
- Environment variable configuration for all secrets
- Protected API endpoints with token verification
- Rate limiting and request timeout protection
- Comprehensive .gitignore for sensitive files

## 🛠️ Tech Stack

**Frontend:**
- React 18 with Vite
- React Router for navigation
- TailwindCSS for styling
- React Icons

**Backend:**
- Node.js with Express
- TypeScript
- Prisma ORM
- PostgreSQL database
- JWT for authentication

**DevOps:**
- Docker & Docker Compose
- Multi-stage Docker builds
- Nginx for frontend serving

**AI Integration:**
- OpenAI GPT API
- Mock AI mode for testing

## 📄 Additional Documentation

- `setup.sh` - Automated Docker Compose startup + health checks

## 📝 Environment Variables

Configuration is managed through environment variables.
- `docker-compose.yml` provides sensible defaults for local development.
- Some services include a local `.env.example` (e.g. the AI service) if you want to run them outside Docker.

Key variables:
- `POSTGRES_PASSWORD` - Database password
- `OPENAI_API_KEY` - For AI features (optional, can use mock mode)
- `TOKEN_EXPIRY` - JWT token expiration time
- `DATABASE_URL` - PostgreSQL connection string

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add: Amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 🙏 Acknowledgments

- Built with Node.js, Express, React, and PostgreSQL
- Prisma ORM for elegant database management
- Docker for seamless containerization
- OpenAI for AI-powered features
- TailwindCSS for beautiful, responsive design
