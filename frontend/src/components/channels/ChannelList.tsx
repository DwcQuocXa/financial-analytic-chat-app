import React, { useState, useEffect } from 'react';
import List from '@mui/material/List';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';

import ChannelListItem from './ChannelListItem';
import { fetchChannels, createChannel } from '../../services/channel.service';

interface ChannelListProps {
    onSelectChannel: (channel: string) => void;
    selectedChannel: string | null;
}

const ChannelList = ({ onSelectChannel, selectedChannel }: ChannelListProps) => {
    const [channels, setChannels] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    useEffect(() => {
        fetchChannels().then((result) => setChannels(result));
    }, []);

    const handleCreateChannel = async () => {
        const newChannelName = prompt('Enter new channel name (It has to be ticker of a company like IBM, AAPL, ...):');
        if (newChannelName) {
            setIsLoading(true);
            await createChannel(newChannelName);
            setChannels((prev) => [...prev, newChannelName]);
            setIsLoading(false);
        }
    };

    return (
        <div>
            <List component="nav">
                <Typography variant="h6" sx={{ padding: 2 }}>
                    Channels
                </Typography>
                {channels.map((channel) => (
                    <ChannelListItem
                        key={channel}
                        channel={channel}
                        onSelectChannel={onSelectChannel}
                        selected={selectedChannel === channel}
                    />
                ))}
            </List>
            {isLoading ? (
                <CircularProgress sx={{ margin: 2 }} />
            ) : (
                <Button variant="contained" color="primary" onClick={handleCreateChannel} sx={{ margin: 2 }}>
                    Create Channel
                </Button>
            )}
        </div>
    );
};

export default ChannelList;
