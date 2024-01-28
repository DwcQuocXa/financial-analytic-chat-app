import { Router } from 'express';
import { createChannel, getChannels } from '../controllers/channelController';

const channelRoutes = Router();

channelRoutes.get('/channels', getChannels);
channelRoutes.post('/channels', createChannel);

export default channelRoutes;
