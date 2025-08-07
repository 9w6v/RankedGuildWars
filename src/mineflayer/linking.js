const { getBot } = require('./bot.js');
const { getCodeInfo, deleteCode, isCodeExpired } = require('../utils/codeManager.js');
const { completeLinkingProcess } = require('../bot/commands/basic/link.js');

const bot = getBot();

if (!bot) {
    console.log('Bot is not initialized!');
    return;
}

bot.on('message', (jsonMessage) => {
    const msg = jsonMessage.toString();

    const privateMsgMatch = msg.match(/^(.+?) ▶▶ You: =link (\d{6})$/);
    const publicMsgMatch = msg.match(/^(?:<(?<rank>VIP|Elite|Titan|Champion)>\s)?(?<ign>\w+)\s<(?<level>\d{1,3})>\s›\s=link\s(?<code>\d{6})$/);

    if (privateMsgMatch) {
        const ign = privateMsgMatch[1];
        const code = privateMsgMatch[2];

        handleLinkRequest(ign, code);
    } else if (publicMsgMatch) {
        const {ign, code} = publicMsgMatch.groups;

        handleLinkRequest(ign, code);
    }
});

async function handleLinkRequest(ign, code) {
    const info = getCodeInfo(code);

    if (!info || isCodeExpired(code)) {
        bot.chat(`/msg ${ign} That code is invalid or has expired!`);
        return;
    }

    if (info.ign.toLowerCase() !== ign.toLowerCase()) {
        bot.chat(`/msg ${ign} This code doesn't belongs to your IGN`);
        return;
    }

    try {
        await completeLinkingProcess(info, ign);

        bot.chat(`/msg ${ign} You have successfully linked your discord account with your Minecraft account.`);
        deleteCode(code);
    } catch (e) {
        console.error('Linking error:', e);
        bot.chat(`/msg ${ign} An internal error occurred. Please try again later.`);
    }
    
}

