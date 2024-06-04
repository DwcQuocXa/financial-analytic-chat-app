// data.ts
import {
    createConversationalChain,
} from '../services/integration/langchain.service';
import { channels } from '../channels/resolvers';
import { MessageSender } from '../models/MessageSender';
import { Message } from '../models/Message';

// Define the resolvers for the GraphQL operations
export const resolvers = {
    Query: {
        getChannelMessages: async (_: any, { channelName }: any) => {
            console.log('channelName:', channelName);

            const channel = channels.find((c) => c.name === channelName);
            if (channel) {
                return channel.messages;
            } else {
                throw new Error('Channel not found');
            }
        },
    },

    Mutation: {
        postNewMessage: async (_: any, { channelName, content }: any) => {
            const channel = channels.find((c) => c.name === channelName);

            if (channel) {
                // Assuming Message ID and conversion of Date to String are handled elsewhere
                const userMessage: Message = { sender: MessageSender.USER, content, time: new Date() };
                channel.messages.push(userMessage);

                let newMessage: Message;
                try {
                    if (channelName === 'general' || channelName === 'random') {
                        newMessage = {
                            sender: MessageSender.GPT,
                            content: 'There is no chatbot in this channel. Please create a new channel with the name of the channel is company ticker. Have a great day!!!',
                            time: new Date(),
                        };
                    } else {
                        const chain = await createConversationalChain();
                        const response = await chain.invoke({
                            question: `About ${channelName} and the relevant information, ${content}`,
                            channelName,
                        });

                        newMessage = { sender: MessageSender.GPT, content: response.result, time: new Date() };
                    }

                    channel.messages.push(newMessage);
                    return newMessage;
                } catch (error) {
                    console.error('Error handling message:', error);
                    throw new Error('Error generating response');
                }
            } else {
                throw new Error('Channel not found');
            }
        },
    },
};
