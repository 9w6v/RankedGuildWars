require('dotenv').config();
const mineflayer = require('mineflayer');
const botConfig = require('../config/botConfig.js');

let bot;

function createBot() {
    bot = mineflayer.createBot({
        host: botConfig.host,
        port: botConfig.port,
        username: botConfig.username,
        auth: botConfig.auth,
        version: botConfig.version,
    })

    bot.on('message', (jsonMessage) => {
        const msg = jsonMessage.toString();
        if (msg.includes('rebooting')) {
        console.log(`[RankedGuildWars] ${msg}`);
        }
    });



    bot.once('spawn', async () => {
        console.log('[RankedGuildWars] Bot Spawned');

        await sleep(2000);
        bot.chat(`/login ${process.env.BOT_PASSWORD}`);
        console.log("[RankedGuildWars] Logged in.");
        
        await sleep(2000);
        bot.setQuickBarSlot(4);
        bot.activateItem();
      

    })

    bot.on('windowOpen', async (window) => {
        if (!window.title) return;

        if (window.title.includes('Server Selector')) {
            console.log('[RankedGuildWars] Opened Server Selecter Menu');
            const bedItem = window.slots.find((item) => item && item.name === 'bed');
            if (!bedItem) return;
            
            bot.clickWindow(bedItem.slot, 0, 0);
            console.log('[RankedGuildWars] Joined Bedwars Lobby');
            await sleep(2000);
            goToFirstLobby();
        } else if (window.title.includes('Lobby Selector')) {
            console.log('[RankedGuildWars] Opened Lobby Selecter Menu');
            await sleep(2000);

            for (const item of window.slots) {
                if (!item) continue;

                const rawName = item?.nbt?.value?.display?.value?.Name?.value || '';
                const itemName = stripMinecraftColors(rawName);
                if (itemName == 'BedWars Lobby #1') {
                    await bot.clickWindow(item.slot, 0, 0);
                    console.log('[RankedGuildWars] Joined Bedwars Lobby #1');
                    await sleep(2000);
                    break;
                }
            }
        }
    });

    function goToFirstLobby() {
        bot.setQuickBarSlot(6);
        bot.activateItem();
    }

    bot.on('end', (reason) => {
        console.log(`[RankedGuildWars] Disconnected. Reason: ${reason}.\nRetrying in 5 seconds...`);
        setTimeout(() => {
            createBot();
        }, 5000);
    })

    bot.on('kicked', (reason, loggedIn) => {
        console.log(`[RankedGuildWars] Kicked. Reason: ${reason}. (${loggedIn})\nReconnecting in 5 seconds...`);
        setTimeout(() => {
            createBot();
        }, 5000);
    })

    bot.on('error', (error) => {
        console.log(`[RankedGuildWars] An Error Occured. Error: ${error}`);
    })

    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    const stripMinecraftColors = (text) => text.replace(/§[0-9a-fk-or]/gi, '');

}


module.exports = { createBot };