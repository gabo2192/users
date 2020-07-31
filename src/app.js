require('dotenv').config();

const express = require('express');
const { ApolloServer } = require('apollo-server-express');
const mongoose = require('mongoose');

const { typeDefs } = require('./typeDefs');
const { resolvers } = require('./resolvers');

const getUser = require('./middleware/get-user');

const startServer = async () => {
  const app = express();

  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: ({ req, res }) => {
      const token = req.headers.authorization || '';

      const user = getUser(token);

      return { user, req, res };
    },
  });

  server.applyMiddleware({ app });

  await mongoose.connect(
    'mongodb+srv://admin:fuckko21@tykuns.i1zfs.mongodb.net/Users',
    { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false }
  );

  app.listen({ port: 4000 }, () => {
    console.log(`Server ready at http://localhost:4000${server.graphqlPath}`);
  });
};

startServer();
