import axiosInstance from './base.service';

export const fetchChannels = async () => {
    const response = await axiosInstance.get('/channels');
    if (response.status === 200) {
        return response.data;
    } else {
        throw new Error('Failed to fetch channels');
    }
};

export const createChannel = async (channelName: string) => {
    const response = await axiosInstance.post('/channels', { name: channelName });
    if (response.status === 200) {
        return response.data;
    } else {
        throw new Error('Failed to create channel');
    }
};
