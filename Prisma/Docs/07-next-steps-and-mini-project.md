# 07 - Next Steps and Mini Project

Now build a tiny blog backend script with Prisma.

## Goal

Implement these operations in `index.js`:

- Create user
- Create two posts for that user
- List all posts with author
- Update one post to published
- Delete one post

## Suggested Implementation Plan

1. Initialize `PrismaClient`.
2. Create one user with nested posts.
3. Query `post.findMany({ include: { author: true } })`.
4. Update one post using `post.update`.
5. Delete one post using `post.delete`.
6. Print output after each step.

## Stretch Tasks

- Add `createdAt` and `updatedAt` fields to both models.
- Add a unique constraint on post title if needed.
- Add filtering:

```js
await prisma.post.findMany({
    where: { published: true },
});
```

## Practice Loop

- Edit schema
- Run migration
- Run script
- Inspect in Studio

Repeat until the flow feels natural.
