# 04 - CRUD with Prisma Client

This project generates Prisma Client at:

- `generated/prisma/client.ts`

So your import should use that path.

## Minimal CRUD Example

Put this in `index.js`:

```js
import { PrismaClient } from "./generated/prisma/client";

const prisma = new PrismaClient();

async function main() {
    // CREATE
    const user = await prisma.user.create({
        data: {
            email: "alice@example.com",
            name: "Alice",
        },
    });

    // READ
    const users = await prisma.user.findMany();
    console.log("Users:", users);

    // UPDATE
    const updated = await prisma.user.update({
        where: { id: user.id },
        data: { name: "Alice Updated" },
    });
    console.log("Updated:", updated);

    // DELETE
    await prisma.user.delete({
        where: { id: user.id },
    });

    console.log("CRUD demo complete");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
```

Run:

```bash
node index.js
```

## Important

- `@unique` fields can be used in `where` for single-record operations.
- Always disconnect Prisma in scripts.
