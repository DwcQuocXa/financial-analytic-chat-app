import axiosInstance from './base.service';

export const fetchMessages = async (channel: string) => {
    const response = await axiosInstance.get(`/messages/${channel}`);
    if (response.status === 200) {
        return response.data;
    } else {
        throw new Error(`Failed to fetch messages for channel ${channel}`);
    }
};

export const postMessage = async (channel: string, message: string) => {
    const response = await axiosInstance.post(`/messages/${channel}`, { text: message });
    if (response.status === 200) {
        return response.data;
    } else {
        throw new Error(`Failed to post message to channel ${channel}`);
    }
};
