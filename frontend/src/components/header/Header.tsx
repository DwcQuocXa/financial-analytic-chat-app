import React from 'react';
import { AppBar, Toolbar, Typography, IconButton } from '@mui/material';
import ChatIcon from '@mui/icons-material/Chat';

const Header = () => {
    return (
        <AppBar position="static" sx={{ bgcolor: 'primary.main' }}>
            <Toolbar>
                <IconButton edge="start" color="inherit" aria-label="chat">
                    <ChatIcon />
                </IconButton>
                <Typography variant="h6" sx={{ flexGrow: 1 }}>
                    Analyze the Fundamentals
                </Typography>
            </Toolbar>
        </AppBar>
    );
};

export default Header;
