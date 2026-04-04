# Vercel Deployment Guide

## Prerequisites
1. A GitHub repository containing this codebase.
2. A PostgreSQL database (e.g., Supabase, Vercel Postgres, Neon, or Render).
3. A Vercel Account.

## Setup Steps

### 1. Database Setup
Create your Postgres database and obtain the connection string. It should look like:
`postgresql://user:password@host:port/db?schema=public`

### 2. Vercel Project Creation
- Go to your Vercel Dashboard.
- Click **Add New...** -> **Project**.
- Import your GitHub repository.
- Ensure the Framework Preset is set to **Next.js**.

### 3. Environment Variables
In the "Environment Variables" section before deploying (or in Project Settings), add the following:

- `DATABASE_URL`: Your PostgreSQL connection string.
- `NEXTAUTH_SECRET`: A secure random string. (You can generate one using `openssl rand -base64 32`).
- `NEXTAUTH_URL`: `https://your-production-domain.vercel.app` (The URL where the app will be accessed).

### 4. Build & Deployment
Vercel automatically handles the build command `next build`.
However, because we use Prisma, ensure that your `package.json` contains a `postinstall` script to generate the Prisma client during Vercel's build process:
```json
"scripts": {
  "postinstall": "prisma generate"
}
```
*(If it's not present, add it to your `package.json` and push).*

### 5. Database Migration on Production
Upon the first deployment, the database schema needs to be initialized. In your Vercel project's settings, you can temporarily add `npx prisma db push && ` before your build command, or run `npx prisma migrate deploy` if using migrations.

Since we also need initial users, you can run the seed script locally pointed at your production `DATABASE_URL`, or temporarily set the Vercel Build Command to:
`npx prisma db push && npm run build`
And manually create the first user in the database or run the seed script using a one-off dyno or connecting from your local machine.
