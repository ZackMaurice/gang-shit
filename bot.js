require("dotenv").config(); // Load environment variables from .env
const {
  Client, // Client to interact with
  GatewayIntentBits, // Permissions
  Events,
} = require("discord.js"); // Library to facilitate communication with the Discord API https://discord.js.org/docs/packages/discord.js/14.26.4

const axios = require("axios");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
}); // Create client with message permissions

const token = process.env.TOKEN; // Token externalized so people don't pretend to be us

const searchCache = new Map(); // Cache for search results

client.on(Events.ClientReady, () => {
  console.log(`Logged in as ${client.user.tag}`);
});

// Events.event or 'eventName' are valid
client.on("messageCreate", async (message) => {
    if (message.author.bot) return; // Ignore messages from bots
  if (message.content === "!help") {
    return message.reply(
      "Commands:\n!help - Show this message\n!price <skin name> - Get the current price of an item\n !select <number> - Select an item from matches",
    );
  } else if (message.content.startsWith("!price")) {
    const item = message.content.slice(7).trim(); // Get the item name

    if (!item) {
      return message.reply(
        "Please specify an item name. Usage: !price <item name>",
      );
    }

    const matches = await searchItem(item); // Search for items matching the query

    if (matches.length === 0) {
      return message.reply("No items found matching that name.");
    }

    const exactMatch = matches.find(
      (skin) => skin.hash_name.toLowerCase() === item.toLowerCase(),
    );

    if (exactMatch) {
      const price = await getPrice(exactMatch.hash_name);
      return message.reply(price); // Reply with the price
    }

    const topMatches = matches.slice(0, 10); // Get top 10 matches

    // Cache the search results for the user
    searchCache.set(message.author.id, topMatches);

    let reply = "Did you mean:\n";
    topMatches.forEach((match, index) => {
      reply += `${index + 1}. ${match.hash_name}\n`;
    });

    reply += "Please type !select <number> to choose an item.";

    return message.reply(reply); // Reply with the price
  }

  if (message.content.startsWith("!select")) {
    const choice = parseInt(message.content.split(' ')[1]); // Get the selected number
    if (isNaN(choice)) {
      return message.reply(
        "Please specify a valid number. Usage: !select <number>",
      );
    }
  
  const matches = searchCache.get(message.author.id); // Get cached search results for the user
  if (!matches) {
    return message.reply(
      "No active search found. Please use !price <item name> to search for items first.",
    );
  }
  if (choice < 1 || choice > matches.length) {
    return message.reply(
      `Please select a number between 1 and ${matches.length}.`,
    );
  }
  const selectedItem = matches[choice - 1]; // Get the selected item
  const price = await getPrice(selectedItem.hash_name);
  return message.reply(price); // Reply with the price
    }
});

async function getPrice(item) {
  console.log(`Fetching price for item: ${item}`);
  try {
    const encodedItem = encodeURIComponent(item); // Encode the item name for URL
    const response = await axios.get(
      `https://steamcommunity.com/market/priceoverview/?country=CA&currency=20&appid=730&market_hash_name=${encodedItem}`,
    );
    console.log("API response:", response.data);
    if (response.data.success) {
      return `
            Item: ${item}
            Lowest Price: ${response.data.lowest_price || "N/A"}
            Median Price: ${response.data.median_price || "N/A"}
            Volume: ${response.data.volume || "N/A"}
            `;
    } else {
      return "Item Not Found";
    }
  } catch (error) {
    console.error("Error fetching price:", error);
    return "Error fetching price";
  }
}

async function searchItem(query) {
  try {
    const response = await axios.get(
      `https://steamcommunity.com/market/search/render/?query=${encodeURIComponent(query)}&appid=730&norender=1`,
    );
    return response.data.results || [];
  } catch (error) {
    console.error("Error searching for item:", error);
    return [];
  }
}

client.login(token);
