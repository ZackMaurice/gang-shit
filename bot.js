require('dotenv').config(); // Load environment variables from .env
const {
    Client, // Client to interact with
    GatewayIntentBits, // Permissions
    Events
} = require('discord.js'); // Library to facilitate communication with the Discord API https://discord.js.org/docs/packages/discord.js/14.26.4

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] }); // Create client with message permissions

const token = process.env.TOKEN; // Token externalized so people don't pretend to be us

client.on(Events.ClientReady, () => {
    console.log(`Logged in as ${client.user.tag}`);
});

// Events.event or 'eventName' are valid
client.on('messageCreate', message => {
    if (message.content === '!price') {
        message.reply('dreb hasnt written me yet');
    }
});

client.login(token);