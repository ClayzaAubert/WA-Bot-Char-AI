const axios = require('axios');

const CHAR_ID = 'FRdKHnLG4JF6I14PexPWFvVyfrp-nZi6NFcoljmPPPM';
const CHAT_ID = 'b1b68569-031d-4a64-a8ad-0878cae0fd59';
const API_KEY = 'YOUR_APIKEY';
const BASE_URL = 'https://api.maelyn.my.id/api/cai-chat';

async function MealynAPI(query) {
    const apiUrl = `${BASE_URL}?q=${encodeURIComponent(query)}&charid=${CHAR_ID}&chatid=${CHAT_ID}&apikey=${API_KEY}`;

    try {
        const response = await axios.get(apiUrl, {
            headers: { 'Content-Type': 'application/json' },
        });

        return response.data.result.candidates[0].raw_content;
    } catch (error) {
        console.error('API Call Error:', error);
        throw error;
    }
}

module.exports = MaelynAPI
