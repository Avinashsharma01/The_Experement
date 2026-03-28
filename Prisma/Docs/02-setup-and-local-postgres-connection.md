# 02 - Setup and Local PostgreSQL Connection

This project already uses PostgreSQL.

Your `.env` currently has:

```env
DATABASE_URL="postgresql://postgres:root@localhost:5432/prisma_learning"
```

## Understand the Connection String

Format:

```txt
postgresql://USERNAME:PASSWORD@HOST:PORT/DATABASE?schema=public
```

Example:

```txt
postgresql://postgres:root@localhost:5432/prisma_learning?schema=public
```

## Verify PostgreSQL Is Running

- On Windows, open Services and confirm PostgreSQL service is running.
- Or use pgAdmin and connect to localhost.

## Verify Database Exists

In pgAdmin or psql, ensure database `prisma_learning` exists.

If not, create it:

```sql
CREATE DATABASE prisma_learning;
```

## Verify Prisma Can Read DATABASE_URL

Your `prisma.config.ts` already has:

```ts
import "dotenv/config";
```

That is required in this config style, so Prisma can load `.env`.

## Test Connection

Run these commands from project root:

```bash
npx prisma validate
npx prisma db pull
```

- If both succeed, connection is working.
- If they fail, go to lesson 06.
