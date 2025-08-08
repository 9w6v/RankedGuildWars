const { getCodeInfo, deleteCode, isCodeExpired } = require('../utils/codeManager.js');
const { completeLinkingProcess } = require('../bot/commands/basic/link.js');


function initLinkingListener(bot) {
    bot.on('message', (jsonMessage) => {
        const msg = jsonMessage.toString().trim();

        const privateMsgMatch = msg.match(/^(.+?)\s*▶▶\s*You:\s*=link\s*(\d{6})$/);
        const publicMsgMatch = msg.match(/^(?:<(?<rank>VIP|Elite|Titan|Champion)>\s)?(?<ign>\w+)\s<(?<level>\d{1,3})>\s›\s=link\s(?<code>\d{6})$/);

        if (privateMsgMatch) {
            const ign = privateMsgMatch[1];
            const code = privateMsgMatch[2];

            handleLinkRequest(ign, code, bot);
        } else if (publicMsgMatch) {
            const {ign, code} = publicMsgMatch.groups;

            handleLinkRequest(ign, code, bot);
        }
    });
}
async function handleLinkRequest(ign, code, bot) {
    const info = getCodeInfo(code);

    if (!info || isCodeExpired(code)) {
        bot.chat(`/msg ${ign} That code is invalid or has expired!`);
        return;
    }

    if (info.ign.toLowerCase() !== ign.toLowerCase()) {
        bot.chat(`/msg ${ign} This code doesn't belongs to your in-game name.`);
        return;
    }

    try {
        await completeLinkingProcess(info, ign);

        bot.chat(`/msg ${ign} You have successfully linked your Discord account with your Minecraft account.`);
        deleteCode(code);
    } catch (e) {
        console.error('Linking error:', e);
        bot.chat(`/msg ${ign} An internal error occurred. Please try again later.`);
    }
    
}

module.exports = { initLinkingListener };