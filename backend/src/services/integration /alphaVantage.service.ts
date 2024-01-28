import axios from 'axios';

const ALPHA_VANTAGE_API_KEY = process.env.ALPHA_VANTAGE_API_KEY;
const BASE_URL = 'https://www.alphavantage.co/query';

const fetchAlphaVantageFundamentalData = async (functionType: string, ticker: string): Promise<any> => {
    try {
        const response = await axios.get(
            `${BASE_URL}?function=${functionType}&symbol=${ticker}&apikey=${ALPHA_VANTAGE_API_KEY}`,
        );

        // Check for 'Information' property in response data
        if (response.data && response.data['Information']) {
            throw new Error(`Error from Alpha Vantage API: ${response.data['Information']}`);
        }

        if (response.status === 200 && response.data) {
            return response.data;
        } else {
            throw new Error(`Failed to fetch ${functionType} data`);
        }
    } catch (error) {
        if (error instanceof Error) {
            console.error(`Alpha Vantage API Error: ${error.message}`);
            throw error; // Re-throw the error to be handled by the caller
        } else {
            console.error(`An unknown error occurred`);
            throw new Error('An unknown error occurred in fetching data');
        }
    }
};

export const getCompanyOverview = async (ticker: string): Promise<any> => {
    return fetchAlphaVantageFundamentalData('OVERVIEW', ticker);
};

export const getIncomeStatement = async (ticker: string): Promise<any> => {
    return fetchAlphaVantageFundamentalData('INCOME_STATEMENT', ticker);
};

export const getBalanceSheet = async (ticker: string): Promise<any> => {
    return fetchAlphaVantageFundamentalData('BALANCE_SHEET', ticker);
};

export const getCashFlow = async (ticker: string): Promise<any> => {
    return fetchAlphaVantageFundamentalData('CASH_FLOW', ticker);
};

export const getEarnings = async (ticker: string): Promise<any> => {
    return fetchAlphaVantageFundamentalData('EARNINGS', ticker);
};

export const fetchFinancialData = async (type: string, ticker: string): Promise<any> => {
    return fetchAlphaVantageFundamentalData(type, ticker);
};
