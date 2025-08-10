const { SlashCommandBuilder, TextInputComponent } = require('discord.js');
const { command } = require('../../../config/permission.json');
const { checkEmoji, crossEmoji, linkLogs } = require('../../../config/config.json');
const { guildId, registeredRole, nonRegisteredRole } = require('../../../config/config.json');
const User = require('../../../database/models/userSchema.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('unlink')
		.setDescription('Unlink player and delete player data.')
		.addStringOption(option =>
			option.setName('user-id')
				.setDescription('Player Discord ID')
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

        const userId = interaction.options.getString('user-id');

        const isValidFormat = /^\d{17,20}$/.test(userId);
        if (!isValidFormat) {
            return interaction.editReply(`${crossEmoji} Provide a Valid User ID.`);
        }

        const user = await User.findOne({ discordId: userId });
        if (user) {
            await User.deleteOne({ discordId: userId });

            const guild = await interaction.client.guilds.fetch(guildId);
            const member = await guild.members.fetch(userId);
            const channel = await interaction.client.channels.fetch(linkLogs);
            
            if (member) {
            await member.roles.remove(registeredRole);
            await member.roles.add(nonRegisteredRole);
            await member.setNickname(null);
            }

            await interaction.editReply(`${checkEmoji} \`${userId}\` has been Successfully Unlinked.`);

            channel.send(`\`${userId}\` has been successfully unlinked *by ${interaction.user}* ${checkEmoji}`);
        } else {
            await interaction.editReply(`${crossEmoji} \`${userId}\` is not linked.`);
        }

	},
};