import axios from 'axios';

const BASE_URL = 'https://www.alphavantage.co/query';

const fetchAlphaVantageFundamentalData = async (functionType: string, ticker: string): Promise<any> => {
    const url = `${BASE_URL}?function=${functionType}&symbol=${ticker}&apikey=${process.env.ALPHA_VANTAGE_API_KEY}`;

    try {
        const { data, status } = await axios.get(url);

        if (status !== 200 || !data) {
            throw new Error(`Failed to fetch ${functionType} data with status code: ${status}`);
        }
        if (data['Information']) {
            throw new Error(`Error from Alpha Vantage API: ${data['Information']}`);
        }
        if (Object.keys(data).length === 0) {
            throw new Error(`No data found for ${functionType}`);
        }

        return data;
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred in fetching data';
        console.error(`Alpha Vantage API Error: ${errorMessage}`);
        throw new Error(errorMessage);
    }
};

export const fetchFinancialData = async (type: string, ticker: string): Promise<any> => {
    return fetchAlphaVantageFundamentalData(type, ticker);
};
