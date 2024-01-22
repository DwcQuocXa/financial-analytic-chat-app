import React, { useState, useEffect } from 'react';
import { Grid, List, ListItem, Button, Box, ListItemText, TextField } from '@mui/material';
import { fetchMessages, postMessage } from '../api';

interface ChatPanelProps {
    selectedChannel: string | null;
}

interface Message {
    text: string;
}


const ChatPanel: React.FC<ChatPanelProps> = ({ selectedChannel }) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');

    useEffect(() => {
        setNewMessage('');
        if (selectedChannel) {
            fetchMessages(selectedChannel)
                .then(response => setMessages(response.data))
                .catch(error => console.error('Failed to fetch messages:', error));
        } else {
            setMessages([]);
        }
    }, [selectedChannel]);

    const handleSendMessage = async () => {
        if (newMessage.trim() !== '' && selectedChannel) {
            try {
                await postMessage(selectedChannel, newMessage);
                setMessages(prevMessages => [...prevMessages, { text: newMessage }]);
                setNewMessage('');
            } catch (error) {
                console.error('Failed to send message:', error);
            }
        }
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', paddingRight: 2, paddingLeft: 2 }}>
            <List sx={{ overflowY: 'auto', flexGrow: 1 }}>
                {messages.map((message, index) => (
                    <ListItem
                        key={index}
                        sx={{
                            backgroundColor: '#e0f7fa',
                            borderRadius: '10px',
                            padding: '8px',
                            marginY: '4px',
                            alignSelf: 'flex-end',
                            display: 'flex',
                            maxWidth: 'fit-content'
                        }}
                    >
                        <ListItemText primary={message.text} />
                    </ListItem>
                ))}
            </List>
            {selectedChannel && (
                <Box sx={{ borderTop: 1, borderColor: 'divider', padding: 2 }}>
                    <Grid container spacing={2} alignItems="center">
                        <Grid item xs>
                            <TextField
                                fullWidth
                                label="Write a message"
                                variant="outlined"
                                multiline
                                maxRows={4}
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        handleSendMessage();
                                    }
                                }}
                            />
                        </Grid>
                        <Grid item>
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={handleSendMessage}
                                disabled={!newMessage.trim()}
                            >
                                Submit
                            </Button>
                        </Grid>
                    </Grid>
                </Box>
            )}
        </Box>
    );
};

export default ChatPanel;
