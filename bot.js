require('dotenv').config(); // Load environment variables from .env
const {
    Client, // Client to interact with
    GatewayIntentBits, // Permissions
    Events
} = require('discord.js'); // Library to facilitate communication with the Discord API https://discord.js.org/docs/packages/discord.js/14.26.4
require("./checkInventory.js");
const axios = require('axios');
const { checkCS2InventoryChanges } = require('./checkInventory')

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] }); // Create client with message permissions

const token = process.env.TOKEN; // Token externalized so people don't pretend to be us

let index = 0;
const mapOfUsersToSteamIds = {};


// const sortOrder = {
//     'Battle-Scarred': 0,
//     'Well-Worn': 1,
//     'Field-Tested': 2,
//     'Minimal Wear': 3,
//     'Factory New': 4,
// }




client.on(Events.ClientReady, () => {
    console.log(`Logged in as ${client.user.tag}`);
});

// Events.event or 'eventName' are valid
client.on('messageCreate', async message => {
    if (message.content === '!help') {
        message.reply('Commands:\n!help - Show this message\n!price - Get the current price of an item');
    }

    if (message.content.startsWith('!price ')) {
        const item = message.content.split('!price ')[1]; // Get the item name
        const searchResults = await searchByItemName(item);
        console.log(searchResults);

        let items = [];
        for (const result of searchResults) {
            console.log(result);
            const price = await getPrice(result.hash_name);
            const quality = result.hash_name.match(/\(([^)]+)\)/);
            // strResponse += result.hash_name + " - " + price + '\n';
            items.push({ 'name': result.hash_name, 'price': price, 'quality': quality });
        }


        // items.sort((a, b) => {
        //     const priorityA = sortOrder[a.quality];
        //     const priorityB = sortOrder[b.quality];

        //     return priorityA - priorityB;
        // });

        let strResponse = "";
        for (const skin of items) {
            strResponse += skin.name + " - " + skin.price + '\n';
        }
        if(strResponse.length === 0){
            strResponse = "No results found.";
        }
        message.reply(strResponse); // Reply with the price
    }
});

const searchByItemName = async (item) => {

    console.log(`Fetching full hash name for input: ${item}`);
    try {
        const response = await axios.get(`https://steamcommunity.com/market/search/render?appid=730&norender=1&start=0&count=5&query=${item}`);
        if (response.data.success && response.data.results.length != 0) {
            console.log(`Got hash name ${response.data.results[0].hash_name}`);
            return response.data.results;
        } else {
            return [];
        }
    } catch (error) {
        console.error('fuck:', error);
        return 'fuck';
    }
}

async function getPrice(item) {
    if (item == null) return 'Failed to retrieve price';
    console.log(`Fetching price for item: ${item}`);
    try {
        const response = await axios.get(`https://steamcommunity.com/market/priceoverview/?country=CA&currency=20&appid=730&market_hash_name=${item}`);
        console.log('API response:', response.data);
        if (response.data.success) {
            return response.data.lowest_price || response.data.median_price || 'Price not available';
        } else {
            return 'Failed to retrieve price';
        }
    } catch (error) {
        if(error.status === 429) console.log('Rate limited while price checking.');
        else console.error('Error fetching price:', error);

        return 'Error fetching price';
    }
}


const checkTheBoysNewItemsPrices = async () => {
    const name = Object.keys(mapOfUsersToSteamIds)[index];
    const steamId = Object.values(mapOfUsersToSteamIds)[index];
    index++;
    if (index > Object.keys(mapOfUsersToSteamIds).length - 1) index = 0;
    console.log(`Checking steam inventory for ${name} at ${new Date().toISOString()}`);
    const obj = await checkCS2InventoryChanges(steamId);
    let str = "";


    for (const item of obj.added) {
        const price = await getPrice(item.name);
        str += `${item.name} -> ${price}\n`;
    }
    if (str.length > 0) {
        str = `${name} just got these items, which can currently sell for these prices: \n${str}`;
        sendMessage(str);
    }

}


const sendMessage = async (str) => {
    const channel = client.channels.cache.get(process.env.channelId);
    try {
        await channel.send(str);
    } catch (err) {
        if (err?.rawError?.code !== 50006)
            console.log(err);
    }
}

const initMapOfSteamIds = () => {
    const users = process.env.users.split(",");
    const steamIds = process.env.steamIds.split(",");
    for (const id in users) {
        mapOfUsersToSteamIds[users[id]] = steamIds[id];
    }
    return;
}

client.login(token);
initMapOfSteamIds();
checkTheBoysNewItemsPrices();
sendMessage(null);
setInterval(checkTheBoysNewItemsPrices, 15 * 1000) // every 15s, check someones account