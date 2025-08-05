require('dotenv').config();
const mineflayer = require('mineflayer');
const botConfig = require('../config/botConfig.js');

let bot;
let reconnectTries = 0;

function createBot() {
    bot = mineflayer.createBot({
        host: botConfig.host,
        port: botConfig.port,
        username: botConfig.username,
        auth: botConfig.auth,
        version: botConfig.version,
    })



    bot.once('spawn', async () => {
        console.log('[RankedGuildWars] Bot Spawned');

        console.log("[RankedGuildWars] Sending Login...");
        bot.chat(`/login ${process.env.BOT_PASSWORD}`);

    setTimeout(() => goToBedwars(), 3000);
    })

    bot.on('end', () => {
        console.log('[RankedGuildWars] Disconnected. Retrying in 5 seconds...');
        setTimeout(() => {
            createBot();
        }, 5000);
    })

    bot.on('kicked', (reason) => {
        console.log(`[RankedGuildWars] Kicked. Reason: ${reason}`);
        reconnect();
    })

    bot.on('error', (error) => {
        console.log(`[RankedGuildWars] An Error Occured. Error: ${error}`);
    })

    bot.on('windowOpen', (window) => {
        if (!window.title) return;

        if (window.title.includes('Server Selector')) {
            const bedItem = window.slots.find((item) => item && item.name === 'bed');
            if (!bedItem) return;

            console.log('[RankedGuildWars] Clicking Bedwars...');
            bot.clickWindow(bedItem.slot, 0, 0);
            goToFirstLobby();
        } else if (window.title.includes('Lobby Selector')) {
            // const bedItem = window.slots.find((item) => item && item.displayName && item.displayName.includes('#1') && item.displayName.includes('Bed') );
            // if (!bedItem) {
            //     console.log(`[RankedGuildWars] Couldn't find the Bedwars Lobby #1`)
            //     return;
            // }

            console.log('[RankedGuildWars] Selecting Bedwars Lobby #1...');
            bot.clickWindow(10, 0, 0);
            console.log('[RankedGuildWars] Connected to Bedwars Lobby #1');
        }
    })


    function goToBedwars() {
        bot.setQuickBarSlot(4);
        bot.activateItem();
        console.log(`[RankedGuildWars] Opened Game Selector.`);
    }

    function goToFirstLobby() {
        bot.setQuickBarSlot(6);
        bot.activateItem();
        console.log(`[RankedGuildWars] Opened Lobby Selector.`);
    }


    setInterval(() => goToFirstLobby(), 60 * 1000);
}

createBot();

module.exports = { createBot };