const fs = require('fs');
const path = require('path');
const axios = require('axios');

// Snapshot file for storing last-known CS2 inventory
const SNAPSHOT_FILE = path.join(__dirname, 'cs2_inventory_snapshot.json');

// CS2 constants
const CS2_APP_ID = 730;
const CS2_CONTEXT_ID = 2;

const apiKey = process.env.steamApiKey;
/**
 * Fetch CS2 inventory for a user
 * @param {string} steamId - SteamID64 of the friend
 */
async function fetchCS2Inventory(steamId, oldInv) {
    const url = `https://steamcommunity.com/inventory/${steamId}/${CS2_APP_ID}/${CS2_CONTEXT_ID}`;
    let res = null;
    try {
        res = await axios.get(url, { params: { l: 'english' } });
    } catch (err) {
        if (err.status === 403) {
            console.log(`${steamId} inventory cannot be fetched due to 403`);
            return {};
        }else if(err.status === 429){
            console.log(`Rate limited fetching steam inventory.`);
            return oldInv;
        }
        else {
            throw err;
        }
    }

    if (!res.data || !res.data.assets) {
        console.log('Invalid CS2 inventory response');
        return oldInv;
    }

    const items = {};
    for (const asset of res.data.assets) {
        items[asset.assetid] = {
            assetid: asset.assetid,
            classid: asset.classid,
            instanceid: asset.instanceid,
            amount: Number(asset.amount)
        };
    }

    return items;
}

function loadSnapshot() {
    if (!fs.existsSync(SNAPSHOT_FILE)) return {};
    return JSON.parse(fs.readFileSync(SNAPSHOT_FILE, 'utf8'));
}

function saveSnapshot(snapshot) {
    fs.writeFileSync(SNAPSHOT_FILE, JSON.stringify(snapshot, null, 2));
}

async function added(oldInv, newInv) {
    const added = [];
    if (oldInv === undefined) oldInv = newInv;
    for (const id in newInv) {
        const item = newInv[id];
        if (!oldInv[id]) {
            const itemDetails = await getClassInfo(item.classid, item.instanceid);
            added.push({ name: itemDetails.market_hash_name });
        } else if (newInv[id].amount !== oldInv[id].amount) {
            const itemDetails = await getClassInfo(item.classid, item.instanceid);
            added.push({ name: itemDetails.market_hash_name });
        }
    }

    return { added };
}

/**
 * Main function: fetch CS2 inventory, compare, store
 */
async function checkCS2InventoryChanges(steamId) {
    const previous = loadSnapshot();
    const current = await fetchCS2Inventory(steamId, previous[steamId]);
    console.log(`${Object.keys(current).length} items in current inventory, ${Object.keys(previous[steamId] ?? {}).length} items in snapshot`)

    const diff = await added(previous[steamId], current);
    const snapshot = { ...previous };
    snapshot[steamId] = current;


    saveSnapshot(snapshot);

    return diff;
    // return null;
}


async function getClassInfo(classid, instanceid = 0) {
    const url = 'https://api.steampowered.com/ISteamEconomy/GetAssetClassInfo/v1/';

    const res = await axios.get(url, {
        params: {
            key: apiKey,
            appid: 730,
            class_count: 1,
            classid0: classid,
            instanceid0: instanceid,
            language: 'english'
        }
    });

    const result = res.data.result;
    const keyName = Object.keys(result).find(k => k !== 'success');

    return result[keyName];
}


module.exports = { checkCS2InventoryChanges };

