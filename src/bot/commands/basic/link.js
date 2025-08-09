const { SlashCommandBuilder } = require('discord.js');
const getPlayerProfile = require('../../../services/pikaApi.js');
const { command } = require('../../../config/permission.json');
const { checkEmoji, crossEmoji, linkLogs }  = require('../../../config/config.json');
const { generateCode, storeCode } = require('../../../utils/codeManager.js');
const User = require('../../../database/models/userSchema.js');
const { registeredRole, nonRegisteredRole, guildId } = require('../../../config/config.json');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('link')
		.setDescription('Links your Discord account with your Minecraft account.')
		.addStringOption(option =>
			option.setName('ign')
				.setDescription('In-Game Name')
				.setRequired(true)),
	async execute(interaction) {
        await interaction.deferReply();

		const commandName = interaction.commandName;
        const member = interaction.member; 
        const allowedRoles = command[commandName];

        if (!allowedRoles) {
            return interaction.editReply(`${crossEmoji} This command is not configured for permission checks.`);
        }

        if (allowedRoles.includes('everyone')) {
            
        } else {
            const hasPermission = allowedRoles.some(roleId =>
                member.roles.cache.has(roleId)
            );

            if (!hasPermission) {
                return interaction.editReply(`${crossEmoji} You do not have permission to use this command.`);
            }
        }

		const IGN = interaction.options.getString('ign');

		const ignRegex = /^[a-zA-Z0-9_]{3,16}$/;
		if (!ignRegex.test(IGN)) {
			return interaction.editReply(`${crossEmoji} Please enter a valid Minecraft in-game name.`);
		}

        const { data, error } = await getPlayerProfile(IGN);
        if (error === 'not_found_in_database') {
            await interaction.editReply(`${crossEmoji} Please enter a valid in-game name.` );
            return;
        } else if (error !== null) {
            await interaction.editReply(`${crossEmoji} Please enter a valid in-game name.` );
            return;
        }
		
		const user = await User.findOne({ ign: data.username });
		if (user) {
			if (user.ign.toLowerCase() === data.username.toLowerCase()) {
				const channel = await interaction.client.channels.fetch(linkLogs);

				if (user.discordId === member.id) {
					await interaction.editReply(`${crossEmoji} You are already linked to \`${IGN}\`` );
				} else {
					await interaction.editReply(`${crossEmoji} \`${IGN}\` is already linked to <@${user.discordId}>` );
					channel.send(`${interaction.user} failed to link to \`${data.username}\` as it's already linked to \`${user.discordId}\` ${crossEmoji}`);
				}
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

		const user = await User.findOne({ discordId: discordId });

		const guild = await client.guilds.fetch(guildId);
		const member = await guild.members.fetch(discordId);
		const channel = await client.channels.fetch(linkLogs);


		if (user) {
			const nickname = member.nickname || member.user.username;

			await member.setNickname(ign);
			user.ign = ign;
			user.save();

			channel.send(`<@${discordId}> has successfully relinked: \`${nickname}\` → \`${ign}\` ${checkEmoji}`);
		} else {
			await member.roles.add(registeredRole);
			await member.roles.remove(nonRegisteredRole);
			await member.setNickname(ign);

			await User.create({
				discordId: discordId,
				ign: ign,
			});

			channel.send(`<@${discordId}>  has successfully linked to \`${ign}\` ${checkEmoji}`);
		}

		await interaction.editReply(`${checkEmoji} You have successfully linked your Discord account with \`${ign}\``);
	} catch (e) {
		console.error('❌ Linking error in link.js:', e);
	}
}

module.exports.completeLinkingProcess = completeLinkingProcess;