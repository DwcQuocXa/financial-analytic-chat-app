import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import channelRoutes from './routes/channelRoutes';
import messageRoutes from './routes/messageRoutes';

const app = express();

const port = process.env.PORT || 4000;

app.use(bodyParser.json());
app.use(cors());

app.get('/', (req, res) => {
    res.status(200).send('Ronaldo is the GOAT!!');
});

app.use(channelRoutes);
app.use(messageRoutes);

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

export default app;
