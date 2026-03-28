# Prisma Learning Docs (Beginner to Practical)

This folder is a step-by-step Prisma course tailored to your current project setup:

- Node.js (ESM)
- PostgreSQL (local)
- Prisma config file: `prisma.config.ts`
- Generated client path: `generated/prisma/client.ts`

## Learning Path

1. [01 - What Is Prisma?](./01-what-is-prisma.md)
2. [02 - Setup and Local PostgreSQL Connection](./02-setup-and-local-postgres-connection.md)
3. [03 - First Model and First Migration](./03-first-model-and-first-migration.md)
4. [04 - CRUD with Prisma Client](./04-crud-with-prisma-client.md)
5. [05 - Relations (One-to-Many)](./05-relations-one-to-many.md)
6. [06 - Common Errors and Fixes](./06-common-errors-and-fixes.md)
7. [07 - Next Steps and Mini Project](./07-next-steps-and-mini-project.md)

## How to Use This Folder

- Read files in order.
- Run commands as you read.
- Make small edits and test immediately.
- Keep `npx prisma studio` open while learning.

## Quick Start Commands

```bash
npx prisma generate
npx prisma migrate dev --name init
npx prisma studio
```

If a command fails, check lesson 06.
