const { gql } = require('apollo-server-express');

const typeDefs = gql`
  enum PersonIdType {
    DNI
    CE
    PASSPORT
  }

  enum CompanyIdType {
    RUC
    RIF
    RUT
    NIT
  }

  type Address {
    address: String
    city: String
    country: String
    zipCode: String
  }

  type PersonId {
    type: PersonIdType
    number: Int
  }
  type CompanyId {
    type: PersonIdType
    number: Int
  }

  type Company {
    companyName: String
    companySlogan: String
    companyEmail: String
    companyAddress: Address
    companyId: CompanyId
    companyRating: Float
  }

  type User {
    _id: ID!
    email: String!
    firstName: String!
    lastName: String!
    role: String
    identification: PersonId
    address: Address
    phone: String
    linkedin: String
    company: Company
    rating: Int
  }

  input UserInput {
    email: String
    firstName: String
    lastName: String
    role: String
    identification: PersonId
    address: Address
    phone: String
    linkedin: String
    company: Company
    rating: Int
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
