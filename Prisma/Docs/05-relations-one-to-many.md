# 05 - Relations (One-to-Many)

Your schema already defines this relation:

- One `User` has many `Post` records.
- Each `Post` belongs to one `User`.

## Relation Fields in Your Models

`User` has:

- `posts Post[]`

`Post` has:

- `author User @relation(fields: [authorId], references: [id])`
- `authorId Int`

## Create User with Posts in One Query

```js
const result = await prisma.user.create({
    data: {
        email: "bob@example.com",
        name: "Bob",
        posts: {
            create: [{ title: "Post 1" }, { title: "Post 2", published: true }],
        },
    },
    include: { posts: true },
});

console.log(result);
```

## Read Posts with Author Data

```js
const posts = await prisma.post.findMany({
    include: { author: true },
});
```

## Read User with Posts

```js
const user = await prisma.user.findUnique({
    where: { email: "bob@example.com" },
    include: { posts: true },
});
```

This is a core pattern you will use in APIs.
