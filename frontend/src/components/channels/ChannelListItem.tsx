import React from 'react';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';

interface ChannelListItem {
    channel: string;
    onSelectChannel: (channel: string) => void;
    selected: boolean;
}

const ChannelListItem = ({ channel, onSelectChannel, selected }: ChannelListItem) => {
    return (
        <ListItem
            button
            onClick={() => onSelectChannel(channel)}
            selected={selected}
            sx={{ bgcolor: selected ? 'primary.main' : 'inherit' }}
        >
            <ListItemText primary={channel} />
        </ListItem>
    );
};

export default ChannelListItem;
