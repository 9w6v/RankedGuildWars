const { SlashCommandBuilder } = require('discord.js');
const getPlayerProfile = require('../../../services/pikaApi.js');
const { command } = require('../../../config/permission.json');
const { checkEmoji, crossEmoji, linkLogs }  = require('../../../config/config.json');
const User = require('../../../database/models/userSchema.js');
const { registeredRole, nonRegisteredRole } = require('../../../config/config.json');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('forcelink')
		.setDescription('Force link a Minecraft account with a Discord account.')
        .addUserOption(option => 
            option.setName('user')
            .setDescription('The user to link')
            .setRequired(true)
        )
		.addStringOption(option =>
			option.setName('ign')
				.setDescription('In-Game Name')
				.setRequired(true)),
	async execute(interaction) {
        await interaction.deferReply();

        const commandName = interaction.commandName;
        const member = interaction.member; 
        const allowedRoles = command[commandName];

        const channel = await interaction.client.channels.fetch(linkLogs);

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

        const uzer = interaction.options.getMember('user');
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
				await interaction.editReply(`${crossEmoji} \`${IGN}\` is already linked to <@${user.discordId}>` );
                channel.send(`${uzer} failed to be force linked to \`${data.username}\` *by ${member}* as it is already linked to \`${user.discordId}\` ${crossEmoji}`);
				return;
			}
		}	

        const ign = data.username;

        try {
            const user = await User.findOne({ discordId: uzer.id });

            if (user) {
                const nickname = uzer.nickname || uzer.user.username;

                await uzer.setNickname(ign);
			    user.ign = ign;
			    user.save();

                channel.send(`${uzer} has been successfully force relinked: \`${nickname}\` → \`${ign}\` *by ${member}* ${checkEmoji}`);
            } else {

                await uzer.roles.add(registeredRole);
                await uzer.roles.remove(nonRegisteredRole);
                await uzer.setNickname(ign);
        
                await User.create({
                    discordId: uzer.id,
                    ign: ign,
                });

                channel.send(`${uzer} has been successfully force linked to \`${ign}\` *by ${member}* ${checkEmoji}`);
            }
        
            await interaction.editReply(`${checkEmoji} You have successfully linked ${uzer} with \`${ign}\``);
        } catch (e) {
                console.error('❌ Linking error in forcelink.js:', e);
        }

	},
};