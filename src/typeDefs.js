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

  input AddressInput {
    address: String
    city: String
    country: String
    zipCode: String
  }

  type PersonId {
    type: PersonIdType
    number: Int
  }
  input PersonIdInput {
    type: PersonIdType
    number: Int
  }

  type CompanyId {
    type: CompanyIdType
    number: Int
  }
  input CompanyIdInput {
    type: CompanyIdType
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
  input CompanyInput {
    companyName: String
    companySlogan: String
    companyEmail: String
    companyAddress: AddressInput
    companyId: CompanyIdInput
    companyRating: Float
  }

  type User {
    _id: ID!
    email: String!
    firstName: String!
    lastName: String!
    identification: PersonId
    address: Address
    role: String
    phone: String
    linkedin: String
    company: Company
    rating: Int
  }

  input UserInput {
    email: String
    firstName: String
    lastName: String
    identification: PersonIdInput
    address: AddressInput
    phone: String
    linkedin: String
    company: CompanyInput
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
    ): AuthData
    authFacebook(accessToken: String!): AuthData
    authGoogle(accessToken: String!): AuthData
    updateMe(userInput: UserInput): Boolean
    requestReset(email: String!): Boolean
    resetPassword(
      resetToken: String!
      password: String!
      confirmPassword: String!
    ): AuthData
    requestMailConfirmation: Boolean
    mailConfirmation(resetToken: String!): Boolean
  }
`;

module.exports = { typeDefs };
