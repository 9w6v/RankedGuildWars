const { SlashCommandBuilder } = require('discord.js');
const getPlayerProfile = require('../../../services/pikaApi.js');
const { checkEmoji, crossEmoji } = require('../../config/config.js');
const { generateCode, storeCode } = require('../../../utils/codeManager.js');
const User = require('../../../database/userSchema.js');
const { registeredRole, nonRegisteredRole, guildId } = require('../../../config/config.json');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('link')
		.setDescription('Links you discord account with your in-game name.')
		.addStringOption(option =>
			option.setName('IGN')
				.setDescription('In-Game Name')
				.setRequired(true)),
	async execute(interaction) {
        await interaction.deferReply();

		const IGN = interaction.options.getString('IGN');
        const { data, error } = await getPlayerProfile(IGN);

        if (error === 'not_found_in_database') {
            await interaction.editReply(`<:crosser:${crossEmoji}> Please enter a valid in-game name.` );
            return;
        } else if (error !== null) {
            await interaction.editReply(`<:crosser:${crossEmoji}> There was an error during linking process.` );
            return;
        }

		const code = generateCode();
		storeCode(code, interaction.user.id, IGN, interaction, interaction.client);

		await interaction.editReply(`🔒 Your verification code is: \`${code}\`\n` +
    `Go to Minecraft and type: \`/msg RankedGuildWars =link ${code}\``);

	},
};

async function completeLinkingProcess(info, ign) {
	try {
		const { interaction, client, discordId } = info;

		const guild = await client.guilds.fetch(guildId);
		const member = await guild.members.fetch(discordId);

		await member.roles.add(registeredRole);
		await member.roles.remove(nonRegisteredRole);
		await member.setNickname(ign);

		await User.create({
			discordId: discordId,
			ign: ign,
		});

		await interaction.editReply(`<:ticker:${checkEmoji}> You have successfully linked your Discord and Minecraft accounts.`)
	} catch (e) {
		console.error('❌ Linking error in link.js:', e);
	}
}

module.exports.completeLinkingProcess = completeLinkingProcess;