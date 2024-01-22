import React, { useState, useEffect } from 'react';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import { fetchChannels } from '../api';

const NavigationPanel: React.FC<{ onSelectChannel: (channel: string) => void, selectedChannel: string | null }> = ({ onSelectChannel, selectedChannel }) => {
    const [channels, setChannels] = useState<string[]>([]);

    useEffect(() => {
        const loadChannels = async () => {
            try {
                const response = await fetchChannels();
                setChannels(response.data);
            } catch (error) {
                console.error('Failed to fetch channels:', error);
            }
        };

        loadChannels();
    }, []);

    return (
        <List component="nav">
            <Typography variant="h6" sx={{ padding: 2 }}>Channels</Typography>
            {channels.map(channel => (
                <ListItem
                    button
                    key={channel}
                    onClick={() => onSelectChannel(channel)}
                    selected={selectedChannel === channel}
                    sx={{ bgcolor: selectedChannel === channel ? 'primary.main' : 'inherit' }}
                >
                    <ListItemText primary={channel} />
                </ListItem>
            ))}
        </List>
    );
};

export default NavigationPanel;
