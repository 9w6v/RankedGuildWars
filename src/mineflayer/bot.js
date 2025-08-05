require('dotenv').config();
const mineflayer = require('mineflayer');
const { pathfinder, Movements, goals } = require('mineflayer-pathfinder');
const { Vec3 } = require('vec3');
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

    bot.loadPlugin(pathfinder);

    let loginTimeout;

    bot.once('spawn', async () => {
        console.log('[RankedGuildWars] Bot Spawned');

        loginTimeout = setTimeout(() => {
            console.log("[RankedGuildWars] Sending Login...");
            bot.chat(`/login ${process.env.BOT_PASSWORD}`)
        })

    setTimeout(() => goToBedwars(), 6000);
    })

    bot.on('end', () => {
        console.log('[RankedGuildWars] Disconnected. Retrying in 5 seconds...');
        reconnect();
    })

    bot.on('kicked', (reason) => {
        console.log(`[RankedGuildWars] Kicked. Reason: ${reason}`);
        reconnect();
    })

    bot.on('error', (error) => {
        console.log(`[RankedGuildWars] An Error Occured. Error: ${error}`);
    })

    bot.on('windowOpen', (window) => {
        handleWindowClick(window);
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

    async function handleWindowClick(window) {
        if (!window.title) return;

        if (window.title.includes('Server Selector')) {
            const bedItem = window.slots.find((item) => item && item.name === 'bed');
            if (!bedItem) return;

            console.log('[RankedGuildWars] Clicking Bedwars...');
            bot.clickWindow(bedItem.slot, 0, 0);
            await sleep(6000);
            goToFirstLobby();
        } else if (window.title.includes('Lobby Selector')) {
            const bedItem = window.slots.find((item) => item && item.name === 'bed' && item.displayName.includes('#1'));
            if (!bedItem) return;

            console.log('[RankedGuildWars] Selecting Bedwars Lobby #1...');
            bot.clickWindow(bedItem.slot, 0, 0);
        }
    }

    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    function reconnect() {
        if (reconnectTries >= 5) {
            console.log(`[RankedGuildWars] Too many reconnect attempts. Exiting...`)
            process.exit(1);
        }

        setTimeout(() => {
            reconnectTries++;
            console.log(`[RankedGuildWars] Reconnecting... (${reconnectTries})`)
            createBot();
        }, 5000);
    }

}

createBot();

module.exports = { createBot };