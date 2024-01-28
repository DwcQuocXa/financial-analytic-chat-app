import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000';

const axiosInstance = axios.create({
    baseURL: API_BASE_URL,
});

axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        console.error('An API error occurred', error);
        return Promise.reject(error);
    },
);

export default axiosInstance;
