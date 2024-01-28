import React, { useState } from 'react';
import { TextField, Button, Grid } from '@mui/material';

interface MessageInputProps {
    selectedChannel: string | null;
    onSendMessage: (message: string) => void;
    isBotResponding: boolean;
}

const MessageInput = ({ selectedChannel, onSendMessage, isBotResponding }: MessageInputProps) => {
    const [newMessage, setNewMessage] = useState('');

    const handleSendMessage = () => {
        if (newMessage.trim() !== '' && selectedChannel) {
            onSendMessage(newMessage);
            setNewMessage('');
        }
    };

    return (
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
                    disabled={!newMessage.trim() || isBotResponding}
                >
                    Submit
                </Button>
            </Grid>
        </Grid>
    );
};

export default MessageInput;
