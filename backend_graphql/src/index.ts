require('dotenv').config();

import { ApolloServer } from '@apollo/server';
import schema from './schema'; // Import the combined schema
import { startStandaloneServer } from '@apollo/server/standalone';

async function startServer() {
    const server = new ApolloServer({
        schema,
    });

    const { url } = await startStandaloneServer(server, {
        listen: { port: 4000 },
    });

    console.log(`🚀 Server ready at ${url}`);
}

startServer();
