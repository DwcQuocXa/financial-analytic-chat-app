import { Request, Response } from 'express';
import { channels } from './channelController';
import { MessageSender } from '../models/MessageSender';
import { createConversationalChain } from '../services/integration /langchain.service';

export const getChannelMessages = (req: Request, res: Response) => {
    const channel = channels.find((c) => c.name === req.params.channel);
    if (channel) {
        res.json(channel.messages);
    } else {
        res.status(404).send('Channel not found');
    }
};

export const postNewMessage = async (req: Request, res: Response) => {
    const channelName = req.params.channel;
    const userMessage = req.body.text;

    const channel = channels.find((c) => c.name === channelName);

    if (channel) {
        channel.messages.push({ sender: MessageSender.USER, content: userMessage, time: new Date() });

        try {
            const chain = await createConversationalChain();

            const response = await chain.invoke({
                question: `About ${channelName} and the relevant information, ${userMessage}`,
                channelName,
            });

            const newMessage = { sender: MessageSender.GPT, content: response.result, time: new Date() };

            channel.messages.push(newMessage);

            res.status(200).json(newMessage);
        } catch (error) {
            console.error('Error handling message:', error);
            res.status(500).send('Error generating response');
        }
    } else {
        res.status(404).send('Channel not found');
    }
};
