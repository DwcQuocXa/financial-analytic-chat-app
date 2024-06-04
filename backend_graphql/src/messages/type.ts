export const typeDefs = `#graphql
  enum MessageSender {
  USER
  GPT
}

type Message {
  time: String!
  sender: MessageSender!
  content: String!
}

  type Query {
  getChannelMessages(channelName: String!): [Message!]!
}

  type Mutation {
  postNewMessage(channelName: String!, content: String!): Message!
}
`;
