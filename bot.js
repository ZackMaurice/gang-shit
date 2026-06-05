require('dotenv').config(); // Load environment variables from .env
const {
    Client, // Client to interact with
    GatewayIntentBits, // Permissions
    Events
} = require('discord.js'); // Library to facilitate communication with the Discord API https://discord.js.org/docs/packages/discord.js/14.26.4

const axios = require('axios');

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] }); // Create client with message permissions

const token = process.env.TOKEN; // Token externalized so people don't pretend to be us

client.on(Events.ClientReady, () => {
    console.log(`Logged in as ${client.user.tag}`);
});

// Events.event or 'eventName' are valid
client.on('messageCreate', async message => {
    if(message.content === '!help') {
        message.reply('Commands:\n!help - Show this message\n!price - Get the current price of an item');
    }
    if (message.content.startsWith('!price')) {
        const item = message.content.split('!price ')[1]; // Get the item name
        const searchResults = await searchByItemName(item);
        console.log(searchResults);

        let strResponse = "";
        for(const result of searchResults){
            const price = await getPrice(result.hash_name);
            strResponse += result.hash_name + " - " + price + '\n';
        }

        // console.log(price);

        message.reply(strResponse); // Reply with the price
    }
});

const searchByItemName = async (item) => {
    
    console.log(`Fetching full hash name for input: ${item}`);
    try {
        const response = await axios.get(`https://steamcommunity.com/market/search/render?norender=1&start=0&count=5&query=${item}`);
        // console.log('API response:', response.data);
        if (response.data.success && response.data.results.length != 0) {
            console.log(`Got hash name ${response.data.results[0].hash_name}`);
            return response.data.results;
        } else {
            return 'Failed to retrieve item';
        }
    } catch(error) {
        console.error('fuck:', error);
        return 'fuck';
    }
}

async function getPrice(item) {
    console.log(`Fetching price for item: ${item}`);
    try {
        const response = await axios.get(`https://steamcommunity.com/market/priceoverview/?country=CA&currency=20&appid=730&market_hash_name=${item}`);
        console.log('API response:', response.data);
        if (response.data.success) {
            return response.data.median_price || 'Price not available';
        } else {
            return 'Failed to retrieve price';
        }
    } catch(error) {
        console.error('Error fetching price:', error);
        return 'Error fetching price';
    }
}

client.login(token);