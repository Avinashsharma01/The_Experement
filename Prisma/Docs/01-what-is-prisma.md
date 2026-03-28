# 01 - What Is Prisma?

Prisma is an ORM + toolkit that helps you work with your database in a type-safe way.

Instead of writing raw SQL for every operation, you define your data models in `prisma/schema.prisma`, then Prisma generates a client for querying data.

## Core Prisma Concepts

- `schema.prisma`: Your database models and datasource.
- `Prisma Client`: Auto-generated query API for JavaScript/TypeScript.
- `Migration`: Versioned database changes tracked in files.
- `Studio`: Visual GUI to browse/edit database rows.

## Prisma Workflow (High Level)

1. Define or update models in `schema.prisma`.
2. Run `prisma migrate dev` to create/apply migration.
3. Run `prisma generate` to refresh client.
4. Use Prisma Client in code.

## Why Beginners Like Prisma

- Easy model-based approach.
- Strong autocomplete/type safety.
- Fast iteration using migrations + Studio.
- Works well with PostgreSQL.

Move to lesson 02 to connect local PostgreSQL.
