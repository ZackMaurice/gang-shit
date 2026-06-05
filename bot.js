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
        const price = await getPrice(item);

        console.log(price);

        message.reply(price); // Reply with the price
    }
});

async function getPrice(item) {
    console.log(`Fetching price for item: ${item}`);
    try {
        const response = await axios.get(`https://steamcommunity.com/market/priceoverview/?country=CA&currency=20&appid=730&market_hash_name=${item}`);
        console.log('API response:', response.data);
        if (response.data.success) {
            return response.data.lowest_price || 'Price not available';
        } else {
            return 'Failed to retrieve price';
        }
    } catch(error) {
        console.error('Error fetching price:', error);
        return 'Error fetching price';
    }
}

client.login(token);