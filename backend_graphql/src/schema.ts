import { makeExecutableSchema } from '@graphql-tools/schema';
import { typeDefs as channelTypeDefs } from './channels/type';
import { resolvers as channelResolvers } from './channels/resolvers';
import { typeDefs as messageTypeDefs } from './messages/type';
import { resolvers as messageResolvers } from './messages/resolvers';
import { mergeResolvers } from '@graphql-tools/merge';

// Combine type definitions
const typeDefs = [channelTypeDefs, messageTypeDefs];

// Merge resolvers properly
const resolvers = mergeResolvers([channelResolvers, messageResolvers]);

// Create the executable schema
const schema = makeExecutableSchema({
    typeDefs,
    resolvers,
});

export default schema;
