import React, { useEffect, useState } from 'react';
import { Grid, List, ListItem, ListItemText, Avatar } from '@mui/material';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import AndroidIcon from '@mui/icons-material/Android';

import { fetchMessages, postMessage } from '../../services/message.service';
import { Message } from '../../models/Message';
import { MessageSender } from '../../models/MessageSender';
import MessageInput from './MessageInput';

interface MessageListProps {
    selectedChannel: string | null;
}

const MessageList = ({ selectedChannel }: MessageListProps) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [isBotResponding, setIsBotResponding] = useState(false);

    useEffect(() => {
        if (selectedChannel) {
            fetchMessages(selectedChannel).then((result) => setMessages(result));
        } else {
            setMessages([]);
        }
    }, [selectedChannel]);

    const handleSendMessage = async (newMessage: string) => {
        if (selectedChannel) {
            setMessages((prevMessages) => [
                ...prevMessages,
                { content: newMessage, sender: MessageSender.USER, time: new Date() },
            ]);
            setIsBotResponding(true);
            const newGPTMessage = await postMessage(selectedChannel, newMessage);
            setMessages((prevMessages) => [...prevMessages, { ...newGPTMessage }]);
            setIsBotResponding(false);
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <List sx={{ overflowY: 'auto', flexGrow: 1 }}>
                {messages.map((message: any, index: any) => (
                    <ListItem
                        key={index}
                        sx={{
                            display: 'flex',
                            justifyContent: message.sender === MessageSender.USER ? 'flex-end' : 'flex-start',
                            paddingY: '4px',
                            paddingX: 0,
                        }}
                    >
                        <Grid container wrap="nowrap" alignItems="center">
                            <Grid item sx={{ marginRight: 2 }}>
                                <Avatar>
                                    {message.sender === MessageSender.USER ? <AccountCircleIcon /> : <AndroidIcon />}
                                </Avatar>
                            </Grid>
                            <Grid
                                item
                                sx={{
                                    backgroundColor: message.sender === MessageSender.USER ? '#e0f7fa' : '#f0e0fa',
                                    borderRadius: '10px',
                                    padding: '8px',
                                    maxWidth: 'fit-content',
                                }}
                            >
                                <ListItemText
                                    primary={message.content}
                                    secondary={message.sender === MessageSender.USER ? 'User' : 'Bot'}
                                />
                            </Grid>
                        </Grid>
                    </ListItem>
                ))}
            </List>
            {isBotResponding && (
                <Grid container justifyContent="center" alignItems="center" sx={{ padding: 2 }}>
                    <ListItemText primary="ChatBot is responding..." />
                </Grid>
            )}
            {selectedChannel && (
                <MessageInput
                    selectedChannel={selectedChannel}
                    onSendMessage={handleSendMessage}
                    isBotResponding={isBotResponding}
                />
            )}
        </div>
    );
};

export default MessageList;
