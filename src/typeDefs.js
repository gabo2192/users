const { gql } = require('apollo-server-express');

const typeDefs = gql`
  type User {
    _id: ID!
    email: String!
    firstName: String!
    lastName: String!
    role: String
  }

  type AuthData {
    userId: ID
    token: String!
    tokenExpiration: Int
  }
  type Query {
    login(email: String!, password: String!): AuthData!
    users: [User!]!
    me: User!
  }

  type Mutation {
    createUser(
      email: String!
      password: String
      firstName: String!
      lastName: String!
    ): User
    authFacebook(accessToken: String!): AuthData
    authGoogle(accessToken: String!): AuthData
  }
`;

module.exports = { typeDefs };
