// api.ts
import axios from 'axios';

const API_BASE_URL = 'http://localhost:4000';

export const fetchChannels = async () => {
    return await axios.get(`${API_BASE_URL}/channels`);
};

export const fetchMessages = async (channel: string) => {
    return await axios.get(`${API_BASE_URL}/messages/${channel}`);
};

export const postMessage = async (channel: string, message: string) => {
    return await axios.post(`${API_BASE_URL}/${channel}`, { text: message });
};
