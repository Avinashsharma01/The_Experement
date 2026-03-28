# 03 - First Model and First Migration

You already have models `User` and `Post` in `prisma/schema.prisma`.

## Step 1: Create the Initial Migration

```bash
npx prisma migrate dev --name init
```

What this does:

- Creates SQL migration files in `prisma/migrations`.
- Applies migration to your local PostgreSQL database.
- Regenerates Prisma Client.

## Step 2: Open Prisma Studio

```bash
npx prisma studio
```

You should see `User` and `Post` tables.

## Step 3: Make a Small Schema Change

Try adding a created time to `User`:

```prisma
model User {
  id        Int      @id @default(autoincrement())
  email     String   @unique
  name      String?
  posts     Post[]
  createdAt DateTime @default(now())
}
```

Then run:

```bash
npx prisma migrate dev --name add-user-created-at
```

## Rule to Remember

Any schema change should be followed by migration.
