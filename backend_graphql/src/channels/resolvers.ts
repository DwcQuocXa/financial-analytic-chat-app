// data.ts
import { promises as fs } from 'fs';
import path from 'path';
import { getAllReportMetadata, insertNarrativesIntoDatabase } from '../services/integration/mongodb.service';
import { fetchFinancialData } from '../services/integration/alphaVantage.service';
import { transformStructuredDataToNarrative } from '../services/integration/langchain.service';
import { Message } from '../models/Message';


interface Channel {
    name: string;
    messages: Message[];
}
// In-memory array to hold channels - this would ideally be in a database
export const channels: Channel[] = [
    { name: 'general', messages: [] },
    { name: 'random', messages: [] },
];

// Define the resolvers for the GraphQL operations
export const resolvers = {
    Query: {
        getChannels: async () => {
            const reportMetadata = await getAllReportMetadata();
            // Create channels based on report metadata
            reportMetadata.map((metadata) => metadata.ticker).forEach((ticker) => {
                if (!channels.find((channel) => channel.name === ticker)) {
                    channels.push({ name: ticker, messages: [] });
                }
            });
            // Return only the names of the channels
            return channels.map((channel) => channel.name);
        },
    },
    Mutation: {
        createChannel: async (_: any, { name }: any) => {
            const existingChannel = channels.find((c) => c.name === name);
            if (existingChannel) {
                throw new Error('Channel name already exists');
            } else {
                try {
                    const functionTypes = ['OVERVIEW', 'INCOME_STATEMENT', 'BALANCE_SHEET', 'CASH_FLOW', 'EARNINGS'];
                    const financialData: any = {};
                    for (const type of functionTypes) {
                        financialData[type] = await fetchFinancialData(type, name);
                    }
                    // Write financial data to file system - Consider moving this to a more persistent storage in a real app
                    const channelDir = path.join(__dirname, '../../dummyData', name);
                    await fs.mkdir(channelDir, { recursive: true });
                    for (const [key, value] of Object.entries(financialData)) {
                        const fileName = `${key.toLowerCase()}.json`;
                        await fs.writeFile(path.join(channelDir, fileName), JSON.stringify(value, null, 2));
                    }
                    // Transform data to narrative and insert into database
                    const narrativeDocuments = await transformStructuredDataToNarrative(name);
                    await insertNarrativesIntoDatabase(narrativeDocuments, name);
                    // Add new channel
                    const newChannel = { name, messages: [] };
                    channels.push(newChannel);
                    return {
                        success: true,
                        message: 'Channel created successfully',
                        channel: newChannel,
                    };
                } catch (error) {
                    console.error('Error creating channel:', error);
                    return {
                        success: false,
                        message: 'Error creating channel',
                        channel: null,
                    };
                }
            }
        },
    },
};
