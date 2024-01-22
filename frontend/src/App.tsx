import React, { useState } from 'react';
import Box from '@mui/material/Box';
import NavigationPanel from './components/NavigationPanel';
import ChatPanel from './components/ChatPanel';

const App: React.FC = () => {
    const [selectedChannel, setSelectedChannel] = useState<string | null>(null);

    const handleChannelSelect = (channel: string) => {
        setSelectedChannel(channel);
    };

    return (
        <Box display="flex" height="100vh">
            <Box width="20%" bgcolor="lightgrey">
                <NavigationPanel onSelectChannel={handleChannelSelect} selectedChannel={selectedChannel} />
            </Box>
            <Box width="80%" height="100%">
                <ChatPanel selectedChannel={selectedChannel} />
            </Box>
        </Box>
    );
};

export default App;
