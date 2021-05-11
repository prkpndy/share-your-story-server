const { gql, GraphQLUpload } = require("apollo-server-koa");

const typeDefs = gql`
    scalar FileUpload

    type UserDetails {
        id: ID!
        name: String!
        occupation: String
        email: String
        website: String
    }

    type File {
        id: ID!
        path: String!
        fileName: String!
        mimeType: String!
    }

    type Query {
        getUserDetails(id: ID!): UserDetails!
        getUserProfilePicture(id: ID!): [File!]!
        hello: String!
    }

    type Mutation {
        addUser(name: String!, occupation: String, email: String, website: String): UserDetails!
        addProfilePicture(id:ID!, file: FileUpload!): File!
    }
`;

module.exports = typeDefs;