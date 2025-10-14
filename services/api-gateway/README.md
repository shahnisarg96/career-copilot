# API Gateway

API Gateway for the Portfolio Microservices Architecture. Single entry point for all client requests with routing, rate limiting, logging, and proxying to downstream services.

## Features

- **Centralized Routing:** Proxies requests to all portfolio microservices
- **Rate Limiting:** Configurable per-IP rate limiting
- **Request/Response Logging:** Logs all API traffic
- **Security:** Uses Helmet, CORS for enhanced security
- **Trace ID:** Unique trace ID for request traceability
- **Graceful Shutdown:** Handles SIGTERM/SIGINT safely

## Folder Structure

```
services/api-gateway/
├── package.json
├── tsconfig.json
├── .env.example
├── logs/
├── keys/
└── src/
    ├── app.ts
    ├── server.ts
    ├── config/
    │   └── index.ts
    ├── middlewares/
    │   ├── errorHandler.ts
    │   ├── rateLimiter.ts
    │   └── requestResponseLogger.ts
    ├── routes/
    │   └── index.ts
    └── utils/
        ├── logger.ts
        └── proxy.ts
```

## Environment Variables

Copy `.env.example` to `.env`:

```env
PORT=8080
REQUEST_TIMEOUT=10000
RATE_LIMIT_POINTS=10
RATE_LIMIT_DURATION=60
MAX_RETRIES=3

AUTH_SERVICE_URL=http://auth-service:8081/
INTRO_SERVICE_URL=http://intro-service:8082/
ABOUT_SERVICE_URL=http://about-service:8083/
EXPERIENCE_SERVICE_URL=http://experience-service:8084/
PROJECTS_SERVICE_URL=http://projects-service:8085/
SKILLS_SERVICE_URL=http://skills-service:8086/
CERTIFICATES_SERVICE_URL=http://certificates-service:8087/
EDUCATION_SERVICE_URL=http://education-service:8088/
CONTACT_SERVICE_URL=http://contact-service:8089/
PORTFOLIO_SERVICE_URL=http://portfolio-service:8090/
AI_SERVICE_URL=http://ai-service:8091/
```

## Running Locally

```bash
npm install
npm run dev
```

## Running with Docker

```bash
docker build -f ../../Dockerfile.template --build-arg SERVICE_NAME=api-gateway -t api-gateway:latest ../..
docker run -p 8080:8080 --env-file .env api-gateway:latest
```

## Docker Compose

The gateway is configured in the main `docker-compose.yml` and starts all dependent services automatically.

```bash
docker compose up -d --build api-gateway
```
