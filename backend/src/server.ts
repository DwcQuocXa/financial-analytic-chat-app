import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import { Channel } from './models/Channel';

const app = express();
const port = process.env.PORT || 4000;

app.use(bodyParser.json());
app.use(cors());

const channels: Channel[] = [
    { name: 'general', messages: [] },
    { name: 'random', messages: [] }
];

// GET channels
app.get('/channels', (req, res) => {
    res.json(channels.map(channel => channel.name));
});

// GET channel's messages
app.get('/messages/:channel', (req, res) => {
    const channel = channels.find(c => c.name === req.params.channel);
    if (channel) {
        res.json(channel.messages);
    } else {
        res.status(404).send('Channel not found');
    }
});

// POST new message
app.post('/:channel', (req, res) => {
    const channel = channels.find(c => c.name === req.params.channel);
    if (channel) {
        channel.messages.push({ text: req.body.text });
        res.status(201).send('Message added');
    } else {
        res.status(404).send('Channel not found');
    }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
