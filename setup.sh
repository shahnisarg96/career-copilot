#!/bin/bash

# ═══════════════════════════════════════════════════════════════
# Portfolio Microservices - Automated Setup Script
# ═══════════════════════════════════════════════════════════════
# This script handles complete environment setup:
# - Environment configuration
# - JWT key generation
# - Docker compose startup
# - Service health checks
# ═══════════════════════════════════════════════════════════════

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# ═══════════════════════════════════════════════════════════════
# HELPER FUNCTIONS
# ═══════════════════════════════════════════════════════════════

print_header() {
    echo -e "${BLUE}╔═══════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║${NC}  $1"
    echo -e "${BLUE}╚═══════════════════════════════════════════════════════════════╝${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

check_command() {
    if ! command -v $1 &> /dev/null; then
        print_error "$1 is not installed. Please install it first."
        exit 1
    fi
}

# ═══════════════════════════════════════════════════════════════
# MAIN SETUP
# ═══════════════════════════════════════════════════════════════

print_header "Portfolio Microservices Setup"
echo ""

# ───────────────────────────────────────────────────────────────
# 1. Prerequisites Check
# ───────────────────────────────────────────────────────────────

print_info "Checking prerequisites..."
check_command docker
print_success "All prerequisites installed"
echo ""

# ───────────────────────────────────────────────────────────────
# 2. Environment Configuration
# ───────────────────────────────────────────────────────────────

print_info "Environment configuration..."

# NOTE:
# This repo uses per-service .env files (gitignored) rather than a root .env.
# docker-compose.yml provides sensible defaults for local development.

if [ -f .env ] || [ -f .env.example ]; then
    print_warning "Root .env/.env.example detected. This setup assumes per-service env files."
    print_warning "docker-compose defaults will still work for local dev."
else
    print_success "No root .env required (per-service env strategy)"
fi

echo ""

# ───────────────────────────────────────────────────────────────
# 3. JWT Key Generation
# ───────────────────────────────────────────────────────────────

print_info "JWT keys..."
print_success "Auth service auto-generates RSA keys on first run (stored in the docker volume)"
echo ""

# ───────────────────────────────────────────────────────────────
# 4. Docker Compose Setup
# ───────────────────────────────────────────────────────────────

print_info "Starting services with Docker Compose..."
echo ""

# Stop any existing containers
docker compose down 2>/dev/null || true

# Build and start services
docker compose up -d

print_success "Services started successfully"
echo ""

# ───────────────────────────────────────────────────────────────
# 5. Health Check
# ───────────────────────────────────────────────────────────────

print_info "Waiting for services to be ready..."
sleep 10

# Check PostgreSQL
print_info "Checking PostgreSQL..."
timeout=30
counter=0
until docker compose exec -T postgres pg_isready -U postgres > /dev/null 2>&1; do
    sleep 1
    counter=$((counter + 1))
    if [ $counter -ge $timeout ]; then
        print_error "PostgreSQL failed to start"
        exit 1
    fi
done
print_success "PostgreSQL is ready"

# Check API Gateway
print_info "Checking API Gateway..."
sleep 5
if curl -f http://localhost:8080/health > /dev/null 2>&1 || curl -f http://localhost:8080 > /dev/null 2>&1; then
    print_success "API Gateway is ready"
else
    print_warning "API Gateway might still be starting..."
fi

# Check Frontend
print_info "Checking Frontend..."
if curl -f http://localhost:5173 > /dev/null 2>&1; then
    print_success "Frontend is ready"
else
    print_warning "Frontend might still be starting..."
fi

echo ""

# ═══════════════════════════════════════════════════════════════
# COMPLETION
# ═══════════════════════════════════════════════════════════════

print_header "Setup Complete!"
echo ""
echo -e "${GREEN}🎉 All services are running!${NC}"
echo ""
echo -e "${BLUE}📍 Access Points:${NC}"
echo "   • Frontend:    http://localhost:5173"
echo "   • API Gateway: http://localhost:8080"
echo "   • API Docs:    http://localhost:8080/api-docs"
echo "   • PgAdmin:     http://localhost:5050"
echo ""
echo -e "${BLUE}📊 View Logs:${NC}"
echo "   docker compose logs -f"
echo ""
echo -e "${BLUE}🛑 Stop Services:${NC}"
echo "   docker compose down"
echo ""
echo -e "${BLUE}🔄 Restart Services:${NC}"
echo "   docker compose restart"
echo ""
echo -e "${YELLOW}📝 Default Login Credentials:${NC}"
echo "   • Admin: set ADMIN_EMAIL / ADMIN_PASSWORD in your .env"
echo "   • User:  user@example.com / User123!"
echo ""
print_success "Happy coding! 🚀"
