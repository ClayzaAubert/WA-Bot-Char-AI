const axios = require("axios");

const CharID = "CharID";
const ChatID = "ChatID";
const ApiKey = "Apikey https://api.maelyn.my.id";

async function MealynAPI(query) {
    try {
        const apiUrl = `https://api.maelyn.my.id/api/cai-chat?q=${encodeURIComponent(query)}&charid=${CharID}&chatid=${CharID}&apikey=${ApiKey}`;
        const response = await axios.get(apiUrl, {
            headers: {
                'Content-Type': 'application/json'
            }
        });

        return response.data.result.candidates[0].raw_content;
    } catch (error) {
        console.error("API Call Error:", error);
        throw error;
    }
}

module.exports = MealynAPI
