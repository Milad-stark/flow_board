# Docker Setup and Testing Guide

## Prerequisites

Make sure Docker and Docker Compose are installed on your system.

### Check Docker Installation

```bash
docker --version
docker compose version
```

## Starting the Services

### 1. Build and Start All Services

```bash
docker compose up --build -d
```

This command will:
- Build the frontend (React + Vite)
- Build the backend (Spring Boot)
- Start PostgreSQL database
- Start all services in detached mode

### 2. Check Service Status

```bash
docker compose ps
```

You should see all three services running:
- `flowboard-postgres` (PostgreSQL)
- `flowboard-backend` (Spring Boot API)
- `flowboard-frontend` (React Frontend)

## Testing Services

### Test Database

```bash
# Check if PostgreSQL is ready
docker exec flowboard-postgres pg_isready -U flowboard_user -d flowboard

# Connect to database
docker exec -it flowboard-postgres psql -U flowboard_user -d flowboard

# List tables
\dt
```

### Test Backend API

```bash
# Test health endpoint (should return 401 - unauthorized, which is expected)
curl http://localhost:8080/api/auth/me

# Test register endpoint (should return 400 - bad request without data)
curl -X POST http://localhost:8080/api/auth/register

# Register a new user
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123","fullName":"Test User"}'

# Login
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@flowboard.com","password":"admin123"}'
```

### Test Frontend

Open your browser and navigate to:
```
http://localhost:80
```

The frontend should load and display the application.

## Viewing Logs

### All Services
```bash
docker compose logs -f
```

### Specific Service
```bash
# Backend logs
docker compose logs -f backend

# Frontend logs
docker compose logs -f frontend

# Database logs
docker compose logs -f postgres
```

## Stopping Services

```bash
# Stop services (keeps data)
docker compose down

# Stop and remove volumes (deletes data)
docker compose down -v
```

## Troubleshooting

### Services Not Starting

1. Check if ports are already in use:
```bash
# Windows
netstat -ano | findstr :8080
netstat -ano | findstr :80
netstat -ano | findstr :5432

# Linux/Mac
lsof -i :8080
lsof -i :80
lsof -i :5432
```

2. Check Docker logs:
```bash
docker compose logs
```

### Backend Connection Issues

If backend can't connect to database:
1. Make sure PostgreSQL container is healthy:
```bash
docker compose ps
```

2. Check database connection from backend:
```bash
docker exec flowboard-backend ping postgres
```

### Frontend Not Loading

1. Check if frontend container is running:
```bash
docker ps | grep flowboard-frontend
```

2. Check nginx logs:
```bash
docker compose logs frontend
```

3. Verify build was successful:
```bash
docker compose logs frontend | grep "build"
```

### Rebuild Everything

If you need to rebuild from scratch:
```bash
docker compose down -v
docker compose build --no-cache
docker compose up -d
```

## Quick Test Script

On Windows, run:
```bash
test-services.bat
```

On Linux/Mac, run:
```bash
chmod +x test-services.sh
./test-services.sh
```

## Default Credentials

- **Email**: admin@flowboard.com
- **Password**: admin123

## Service URLs

- **Frontend**: http://localhost:80
- **Backend API**: http://localhost:8080/api
- **PostgreSQL**: localhost:5432
  - Database: flowboard
  - User: flowboard_user
  - Password: flowboard_pass

