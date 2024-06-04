export const typeDefs = `#graphql
  type Channel {
    name: String!
    messages: [String]
  }

  type Query {
    getChannels: [String!]!
  }

  type Mutation {
    createChannel(name: String!): Channel!
  }
`;
