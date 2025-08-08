const { SlashCommandBuilder } = require('discord.js');
const getPlayerProfile = require('../../../services/pikaApi.js');
const { checkEmoji, crossEmoji } = require('../../../config/config.json');
const { generateCode, storeCode } = require('../../../utils/codeManager.js');
const User = require('../../../database/models/userSchema.js');
const { registeredRole, nonRegisteredRole, guildId } = require('../../../config/config.json');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('link')
		.setDescription('Links you discord account with your in-game name.')
		.addStringOption(option =>
			option.setName('ign')
				.setDescription('In-Game Name')
				.setRequired(true)),
	async execute(interaction) {
        await interaction.deferReply();

		const IGN = interaction.options.getString('ign');

        const { data, error } = await getPlayerProfile(IGN);
        if (error === 'not_found_in_database') {
            await interaction.editReply(`<:crosser:${crossEmoji}> Please enter a valid in-game name.` );
            return;
        } else if (error !== null) {
            await interaction.editReply(`<:crosser:${crossEmoji}> There was an error during linking process.` );
            return;
        }
		
		const user = await User.findOne({ ign: data.username });
		if (user) {
			if (user.ign.toLowerCase() === data.username.toLowerCase()) {
				await interaction.editReply(`<:crosser:${crossEmoji}> \`${IGN}\` is already linked to <@${user.discordId}>` );
				return;
			}
		}	

		const code = generateCode();
		storeCode(code, interaction.user.id, data.username, interaction, interaction.client);

		await interaction.editReply(`🔒 Your verification code is: \`${code}\`\n` +
    `Go to \`play.pika-network.net\` and type: \`/msg RankedGuildWars =link ${code}\``);

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