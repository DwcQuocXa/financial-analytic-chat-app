import { Router } from 'express';
import { getChannelMessages, postNewMessage } from '../controllers/messageController';

const messageRoutes = Router();

messageRoutes.get('/messages/:channel', getChannelMessages);
messageRoutes.post('/messages/:channel', postNewMessage);

export default messageRoutes;
