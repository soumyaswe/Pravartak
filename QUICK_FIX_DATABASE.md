# Quick Fix: Database Connection Error

## The Problem
Your application is trying to connect to PostgreSQL at `localhost:5432`, but the database server is not running.

## Solution Options (Choose One)

### Option 1: Use a Free Cloud Database (Fastest - Recommended) ⚡

This is the quickest solution - no installation required!

#### Using Neon (Free Tier)

1. **Sign up for Neon** (free): https://neon.tech
2. **Create a new project**
3. **Copy the connection string** (it looks like this):
   ```
   postgresql://user:password@ep-xxx.region.aws.neon.tech/dbname?sslmode=require
   ```
4. **Create or update your `.env` file** in the project root:
   ```env
   DATABASE_URL="your_neon_connection_string_here"
   ```
5. **Run migrations:**
   ```bash
   npx prisma generate
   npx prisma migrate dev
   ```

#### Using Supabase (Free Tier)

1. **Sign up for Supabase**: https://supabase.com
2. **Create a new project**
3. **Go to Settings > Database**
4. **Copy the connection string** (use the "Connection string" tab, "URI" format)
5. **Add to your `.env` file** as shown above
6. **Run migrations** as shown above

---

### Option 2: Install Docker Desktop (For Local Database)

1. **Download Docker Desktop**: https://www.docker.com/products/docker-desktop
2. **Install and start Docker Desktop**
3. **Run the setup script:**
   ```powershell
   .\scripts\setup-database.ps1
   ```
   Or manually:
   ```bash
   docker compose up -d
   ```
4. **Create `.env` file** with:
   ```env
   DATABASE_URL="postgresql://pravartak_user:pravartak_password@localhost:5432/pravartak"
   ```
5. **Run migrations:**
   ```bash
   npx prisma generate
   npx prisma migrate dev
   ```

---

### Option 3: Install PostgreSQL Locally

1. **Download PostgreSQL**: https://www.postgresql.org/download/windows/
2. **Install PostgreSQL** (remember the password you set!)
3. **Create a database:**
   - Open pgAdmin or use command line:
   ```sql
   CREATE DATABASE pravartak;
   ```
4. **Create `.env` file** with:
   ```env
   DATABASE_URL="postgresql://your_username:your_password@localhost:5432/pravartak"
   ```
   Replace `your_username` and `your_password` with your PostgreSQL credentials.
5. **Run migrations:**
   ```bash
   npx prisma generate
   npx prisma migrate dev
   ```

---

## After Setup

Once your database is configured:

1. **Restart your development server:**
   ```bash
   npm run dev
   ```

2. **Verify the connection works** - the errors should be gone!

3. **Optional: View your database:**
   ```bash
   npx prisma studio
   ```

---

## Need Help?

- Check `DATABASE_SETUP.md` for detailed instructions
- Verify your `.env` file is in the project root
- Make sure your `DATABASE_URL` is properly quoted
- Check that your database server is running (if using local PostgreSQL)

