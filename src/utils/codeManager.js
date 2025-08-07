const codes = new Map();

function generateCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

function storeCode(code, discordId, ign, interaction, client) {
    codes.set(code, { discordId, ign, interaction, client, timestamp: Date.now() });
}

function getCodeInfo(code) {
    return codes.get(code);
}

function deleteCode(code) {
    codes.delete(code);
}

function isCodeExpired(code, maxAge = 5 * 60 * 1000) {
    const data = codes.get(code);
    if (!data) return true;
    return (Date.now() - data.timestamp > maxAge);
}

module.exports = {
    generateCode,
    storeCode,
    getCodeInfo,
    deleteCode,
    isCodeExpired,
};