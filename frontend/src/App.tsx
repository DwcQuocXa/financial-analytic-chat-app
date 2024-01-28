import React, { useState } from 'react';
import Box from '@mui/material/Box';

import ChannelList from './components/channels/ChannelList';
import MessageList from './components/messages/MessageList';
import Header from './components/header/Header';

const App = () => {
    const [selectedChannel, setSelectedChannel] = useState<string | null>(null);

    const handleChannelSelect = (channel: string) => {
        setSelectedChannel(channel);
    };

    return (
        <Box display="flex" height="100vh" flexDirection="column">
            <Header />
            <Box display="flex" flexGrow={1}>
                <Box width="20%" bgcolor="#e3f2fd">
                    <ChannelList onSelectChannel={handleChannelSelect} selectedChannel={selectedChannel} />
                </Box>
                <Box display="flex" flexGrow={1} justifyContent="center" alignItems="stretch">
                    <Box maxWidth="800px" width="100%" display="flex" flexDirection="column" flexGrow={1}>
                        <MessageList selectedChannel={selectedChannel} />
                    </Box>
                </Box>
            </Box>
        </Box>
    );
};

export default App;
