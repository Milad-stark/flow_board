-- FlowBoard Database Initialization Script

-- Create database (if not exists)
-- Note: This is usually done by the PostgreSQL container initialization

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table is created by JPA, but we can add initial admin user
-- The application will create tables automatically via JPA

-- Optional: Create a default admin user (password: admin123)
-- Password hash for 'admin123' using BCrypt
INSERT INTO users (id, email, password, full_name, role, language, theme, created_at, updated_at)
VALUES (
    uuid_generate_v4(),
    'admin@flowboard.com',
    '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', -- admin123
    'Admin User',
    'ADMIN',
    'fa',
    'light',
    NOW(),
    NOW()
) ON CONFLICT (email) DO NOTHING;

