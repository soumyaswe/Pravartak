# Database Setup Guide

This guide will help you set up the PostgreSQL database for local development.

## Quick Start with Docker Compose (Recommended)

The easiest way to run PostgreSQL locally is using Docker Compose.

### Prerequisites
- Docker Desktop installed and running
- Docker Compose installed (comes with Docker Desktop)

### Steps

1. **Start the PostgreSQL database:**
   ```bash
   docker-compose up -d
   ```

2. **Verify the database is running:**
   ```bash
   docker-compose ps
   ```
   You should see the `pravartak-postgres` container running.

3. **Create your `.env` file:**
   ```bash
   cp .env.example .env
   ```
   
   The default connection string in `.env.example` is already configured for the Docker Compose setup:
   ```
   DATABASE_URL="postgresql://pravartak_user:pravartak_password@localhost:5432/pravartak"
   ```

4. **Run database migrations:**
   ```bash
   npx prisma generate
   npx prisma migrate dev
   ```

5. **Verify the connection:**
   ```bash
   npx prisma studio
   ```
   This will open Prisma Studio in your browser where you can view and manage your database.

### Stop the Database

To stop the database:
```bash
docker-compose down
```

To stop and remove all data (fresh start):
```bash
docker-compose down -v
```

## Alternative: Using a Cloud Database

If you prefer not to run PostgreSQL locally, you can use a free cloud database:

### Option 1: Neon (Recommended for Free Tier)

1. Sign up at [neon.tech](https://neon.tech)
2. Create a new project
3. Copy the connection string
4. Add it to your `.env` file:
   ```
   DATABASE_URL="postgresql://user:password@ep-xxx.region.aws.neon.tech/dbname?sslmode=require"
   ```

### Option 2: Supabase

1. Sign up at [supabase.com](https://supabase.com)
2. Create a new project
3. Go to Settings > Database
4. Copy the connection string
5. Add it to your `.env` file

### Option 3: Local PostgreSQL Installation

If you have PostgreSQL installed locally:

1. Create a database:
   ```bash
   createdb pravartak
   ```

2. Update your `.env` file:
   ```
   DATABASE_URL="postgresql://your_username:your_password@localhost:5432/pravartak"
   ```

## Troubleshooting

### Error: "Can't reach database server at localhost:5432"

**Solution 1:** Make sure Docker Compose is running:
```bash
docker-compose up -d
```

**Solution 2:** Check if PostgreSQL is running on port 5432:
```bash
# Windows PowerShell
netstat -an | findstr 5432

# Or check Docker containers
docker ps
```

**Solution 3:** If you have a local PostgreSQL installation conflicting, either:
- Stop your local PostgreSQL service, or
- Change the port in `docker-compose.yml` to something else (e.g., 5433) and update your `.env` accordingly

### Error: "Database connection failed"

1. Verify your `DATABASE_URL` in `.env` is correct
2. Check that the database container is healthy:
   ```bash
   docker-compose ps
   ```
3. Check container logs:
   ```bash
   docker-compose logs postgres
   ```

### Reset Database

To completely reset your database:

```bash
# Stop and remove containers and volumes
docker-compose down -v

# Start fresh
docker-compose up -d

# Run migrations again
npx prisma migrate dev
```

## Database Connection Details (Docker Compose)

- **Host:** localhost
- **Port:** 5432
- **Database:** pravartak
- **Username:** pravartak_user
- **Password:** pravartak_password

**⚠️ Security Note:** These credentials are for local development only. Never use them in production!

