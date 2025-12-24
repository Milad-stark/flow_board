#!/bin/bash

echo "========================================="
echo "FlowBoard Services Test Script"
echo "========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to test service
test_service() {
    local name=$1
    local url=$2
    local expected_status=$3
    
    echo -n "Testing $name... "
    response=$(curl -s -o /dev/null -w "%{http_code}" "$url" 2>/dev/null)
    
    if [ "$response" == "$expected_status" ] || [ "$response" == "200" ] || [ "$response" == "302" ]; then
        echo -e "${GREEN}✓ OK${NC} (HTTP $response)"
        return 0
    else
        echo -e "${RED}✗ FAILED${NC} (HTTP $response)"
        return 1
    fi
}

# Check if Docker is running
echo "Checking Docker..."
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}✗ Docker is not running!${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Docker is running${NC}"
echo ""

# Check if containers are running
echo "Checking containers..."
containers=("flowboard-postgres" "flowboard-backend" "flowboard-frontend")
all_running=true

for container in "${containers[@]}"; do
    if docker ps --format '{{.Names}}' | grep -q "^${container}$"; then
        echo -e "${GREEN}✓${NC} $container is running"
    else
        echo -e "${RED}✗${NC} $container is NOT running"
        all_running=false
    fi
done
echo ""

if [ "$all_running" = false ]; then
    echo -e "${YELLOW}Some containers are not running. Starting services...${NC}"
    docker compose up -d
    echo "Waiting for services to start..."
    sleep 10
fi

# Test PostgreSQL
echo "========================================="
echo "Testing PostgreSQL Database"
echo "========================================="
if docker exec flowboard-postgres pg_isready -U flowboard_user -d flowboard > /dev/null 2>&1; then
    echo -e "${GREEN}✓ PostgreSQL is ready${NC}"
else
    echo -e "${RED}✗ PostgreSQL is not ready${NC}"
fi
echo ""

# Test Backend API
echo "========================================="
echo "Testing Backend API"
echo "========================================="
test_service "Backend Health" "http://localhost:8080/api/auth/me" "401"
test_service "Backend Register Endpoint" "http://localhost:8080/api/auth/register" "400"
echo ""

# Test Frontend
echo "========================================="
echo "Testing Frontend"
echo "========================================="
test_service "Frontend" "http://localhost:80" "200"
echo ""

# Summary
echo "========================================="
echo "Test Summary"
echo "========================================="
echo ""
echo "Services Status:"
docker compose ps
echo ""
echo "To view logs:"
echo "  docker compose logs -f"
echo ""
echo "To stop services:"
echo "  docker compose down"
echo ""

