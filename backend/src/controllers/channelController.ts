import { promises as fs } from 'fs';
import path from 'path';
import { Request, Response } from 'express';
import { Channel } from '../models/Channel';
import { fetchFinancialData } from '../services/integration /alphaVantage.service';
import { transformStructuredDataToNarrative } from '../services/integration /langchain.service';
import { getAllReportMetadata, insertNarrativesIntoDatabase } from '../services/integration /mongodb.service';

export const channels: Channel[] = [
    { name: 'general', messages: [] },
    { name: 'random', messages: [] },
];

export const getChannels = async (req: Request, res: Response) => {
    const reportMetadata = await getAllReportMetadata()

    reportMetadata.map((metadata) => metadata.ticker).forEach(ticker => {
        if (!channels.find(channel => channel.name === ticker)) {
            channels.push({ name: ticker, messages: [] });
        }
    });

    res.json(channels.map((channel) => channel.name));
};

export const createChannel = async (req: Request, res: Response) => {
    const channelName = req.body.name;
    const existingChannel = channels.find((c) => c.name === channelName);

    if (existingChannel) {
        res.status(400).send('Channel name already exists');
    } else {
        try {
            const functionTypes = ['OVERVIEW', 'INCOME_STATEMENT', 'BALANCE_SHEET', 'CASH_FLOW', 'EARNINGS'];

            const financialData: any = {};

            for (const type of functionTypes) {
                financialData[type] = await fetchFinancialData(type, channelName);
            }

            const channelDir = path.join(__dirname, '../../dummyData', channelName);
            await fs.mkdir(channelDir, { recursive: true });

            for (const [key, value] of Object.entries(financialData)) {
                const fileName = `${key.toLowerCase()}.json`;
                await fs.writeFile(path.join(channelDir, fileName), JSON.stringify(value, null, 2));
            }

            const narrativeDocuments = await transformStructuredDataToNarrative(channelName);
            await insertNarrativesIntoDatabase(narrativeDocuments, channelName);

            const newChannel = {
                name: channelName,
                messages: [],
            };

            channels.push(newChannel);
            res.status(200).send(newChannel);
        } catch (error) {
            console.error('Error createChannel:', error);
            res.status(500).send('Error createChannel');
        }
    }
};
