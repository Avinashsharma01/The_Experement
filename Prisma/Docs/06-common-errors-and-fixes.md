# 06 - Common Errors and Fixes

## 1) P1001: Cannot reach database server

Cause:

- PostgreSQL service is not running.
- Host/port is wrong.

Fix:

- Start PostgreSQL service.
- Confirm connection string host and port.

## 2) Authentication failed

Cause:

- Username/password mismatch.

Fix:

- Verify credentials by logging into pgAdmin or psql.
- Update `.env` DATABASE_URL.

## 3) Database does not exist

Cause:

- DB name in URL is wrong.

Fix:

- Create DB or fix DB name in URL.

## 4) Env variable not loaded

Cause:

- Prisma cannot read `.env`.

Fix:

- Ensure `import "dotenv/config";` exists in `prisma.config.ts`.

## 5) Prisma client seems outdated

Cause:

- Schema changed but client not regenerated.

Fix:

```bash
npx prisma generate
```

## 6) Migration mismatch or drift

Fix sequence:

```bash
npx prisma migrate status
npx prisma migrate dev --name fix-schema
```

Use reset only in local development when needed:

```bash
npx prisma migrate reset
```

Warning: reset deletes data.
