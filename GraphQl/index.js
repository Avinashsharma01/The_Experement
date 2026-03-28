import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';

// 1. Define the SCHEMA — what data is available
const typeDefs = `
  type User {
    id: ID!
    name: String!
    email: String!
    age: Int
  }

  type Book{
    id: ID!
    title: String!
    author: String!
    year: Int
    genre: String
  }

  type Query {
    hello: String
    users: [User!]!
    user(id: ID!): User
  }

  type Query {
    books: [Book!]!
    book(id: ID!): Book
    booksByGenre(genre: String!): [Book!]!
  }
`;



// 2. Some fake data
const users = [
  { id: "1", name: "Avinash", email: "avinash@example.com", age: 25 },
  { id: "2", name: "Priya", email: "priya@example.com", age: 28 },
  { id: "3", name: "Rahul", email: "rahul@example.com", age: 22 },
];

const books = [
  { id: "1", title: "The Great Gatsby", author: "F. Scott Fitzgerald", year: 1925, genre: "Classic" },
  { id: "2", title: "To Kill a Mockingbird", author: "Harper Lee", year: 1960, genre: "Classic" },
    { id: "3", title: "1984", author: "George Orwell", year: 1949, genre: "Dystopian" },
    { id: "4", title: "The Catcher in the Rye", author: "J.D. Salinger", year: 1951, genre: "Classic" },
    { id: "5", title: "Brave New World", author: "Aldous Huxley", year: 1932, genre: "Dystopian" },
];


// 3. Define RESOLVERS — how to fetch the data
const resolvers = {
  Query: {
    hello: () => "Hello from GraphQL! 🚀",
    users: () => users,
    user: (_, { id }) => users.find(u => u.id === id),
    books: () => books,
    book: (_, { id }) => books.find(b => b.id === id),
    booksByGenre: (_, { genre }) => books.filter(b => b.genre === genre),
  },    
};

// 4. Start the server
const server = new ApolloServer({ typeDefs, resolvers });
const { url } = await startStandaloneServer(server, { listen: { port: 4000 } });
console.log(`🚀 Server ready at ${url}`);