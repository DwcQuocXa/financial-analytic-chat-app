import { Message } from './Message';

export interface Channel {
    name: string;
    messages: Message[];
}
