import { promises as fs } from 'fs';
import path from 'path';
import { Request, Response } from 'express';
import { Channel } from '../models/Channel';
import {
    fetchFinancialData,
} from '../services/integration /alphaVantage.service';

export const channels: Channel[] = [
    /*{ name: 'general', messages: [] },
    { name: 'random', messages: [] },*/
];

export const getChannels = (req: Request, res: Response) => {
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

            // Create a directory for the channel in dummyData
            const channelDir = path.join(__dirname, '../../dummyData', channelName);
            await fs.mkdir(channelDir, { recursive: true });

            // Save each data object to a separate JSON file
            for (const [key, value] of Object.entries(financialData)) {
                const fileName = `${key.toLowerCase()}.json`;
                await fs.writeFile(path.join(channelDir, fileName), JSON.stringify(value, null, 2));
            }

            // Create new channel with financial data
            const newChannel = {
                name: channelName,
                messages: [],
            };

            // Add the new channel to the channels array
            channels.push(newChannel);
            res.status(200).send(newChannel);
        } catch (error) {
            console.error('Error fetching data from Alpha Vantage:', error);
            res.status(500).send('Error fetching financial data');
        }
    }
};
