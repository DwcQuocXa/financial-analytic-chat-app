import { MessageSender } from './MessageSender';

export interface Message {
    time: Date;
    sender: MessageSender;
    content: string;
}
