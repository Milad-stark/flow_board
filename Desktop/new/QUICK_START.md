# Quick Start Guide - FlowBoard

## Step 1: Start Docker Services

Open a terminal in the project root directory and run:

```bash
docker compose up --build -d
```

This will:
- Build the frontend React application
- Build the backend Spring Boot application  
- Start PostgreSQL database
- Start all services

**Wait 1-2 minutes** for all services to start up completely.

## Step 2: Check Service Status

```bash
docker compose ps
```

You should see all three services with status "Up":
- ✅ flowboard-postgres
- ✅ flowboard-backend  
- ✅ flowboard-frontend

## Step 3: Test Each Service

### Test Database (PostgreSQL)

```bash
# Check if database is ready
docker exec flowboard-postgres pg_isready -U flowboard_user -d flowboard
```

Expected output: `flowboard-postgres:5432 - accepting connections`

### Test Backend API

```bash
# Test API endpoint (should return 401 - this is normal, means API is working)
curl http://localhost:8080/api/auth/me
```

Expected: HTTP 401 Unauthorized (this means the API is running!)

```bash
# Test register endpoint
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"test@example.com\",\"password\":\"test123\",\"fullName\":\"Test User\"}"
```

Expected: JSON response with token and user data

```bash
# Test login with default admin
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"admin@flowboard.com\",\"password\":\"admin123\"}"
```

Expected: JSON response with JWT token

### Test Frontend

Open your web browser and go to:
```
http://localhost
```

You should see the FlowBoard application interface.

## Step 4: View Logs (if needed)

If something doesn't work, check the logs:

```bash
# All services
docker compose logs -f

# Just backend
docker compose logs -f backend

# Just frontend  
docker compose logs -f frontend

# Just database
docker compose logs -f postgres
```

## Common Issues

### Port Already in Use

If you get port conflict errors:

**Windows:**
```cmd
netstat -ano | findstr :8080
netstat -ano | findstr :80
netstat -ano | findstr :5432
```

**Linux/Mac:**
```bash
lsof -i :8080
lsof -i :80
lsof -i :5432
```

Stop the process using the port or change ports in `docker-compose.yml`.

### Services Not Starting

1. Check Docker is running:
```bash
docker info
```

2. Rebuild everything:
```bash
docker compose down -v
docker compose build --no-cache
docker compose up -d
```

### Backend Can't Connect to Database

Wait a bit longer - PostgreSQL needs time to initialize. Check:
```bash
docker compose logs postgres
```

Look for: "database system is ready to accept connections"

## Stop Services

When you're done testing:

```bash
# Stop but keep data
docker compose down

# Stop and delete all data
docker compose down -v
```

## Success Indicators

✅ **Database**: `pg_isready` returns "accepting connections"
✅ **Backend**: `curl http://localhost:8080/api/auth/me` returns HTTP 401
✅ **Frontend**: Browser shows the application at http://localhost

## Next Steps

Once all services are running:
1. Open http://localhost in your browser
2. Login with: admin@flowboard.com / admin123
3. Start using the application!

