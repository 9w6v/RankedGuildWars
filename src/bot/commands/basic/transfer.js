const { SlashCommandBuilder } = require('discord.js');
const { command } = require('../../../config/permission.json');
const User = require('../../../database/models/userSchema.js');
const { checkEmoji, crossEmoji, linkLogs }  = require('../../../config/config.json');
const { registeredRole, nonRegisteredRole, guildId } = require('../../../config/config.json');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('transfer')
		.setDescription('Transfer a user\' player data to another user')
		.addStringOption(option =>
			option.setName('from')
				.setDescription('The user ID of the user you want to transfer from')
				.setRequired(true))
		.addUserOption(option =>
			option.setName('to')
				.setDescription('The user you want to transfer to')
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

		const fromId = interaction.options.getString('from');
		const to = interaction.options.getMember('to');

		const fromData = await User.findOne({ discordId: fromId });
		const toData = await User.findOne({ discordId: to.id })

		const guild = await interaction.client.guilds.fetch(guildId);
		
		let from;
		try {
			from = await guild.members.fetch(fromId);
		} catch {
			from = null; 
		}

		if (!fromData) {
			return interaction.reply(`${crossEmoji} The User ID \`${fromId}\` is not linked.`);
		}

		if (toData) {
			return interaction.reply(`${crossEmoji} The User ${to} is Registered`)
		}

		try {
			fromData.discordId = to.id;
			await fromData.save();

			await to.roles.add(registeredRole);
			await to.roles.remove(nonRegisteredRole);
			await to.setNickname(fromData.ign);

			if (from) {
				await from.roles.remove(registeredRole);
				await from.roles.add(nonRegisteredRole);
				await from.setNickname(null);
			}

			await interaction.editReply(`${checkEmoji} Player data has been successfully transferred from \`${fromId}\` to ${to}`);

			channel.send(`${to} has successfully got his data transferred from \`${fromId}\` *by ${member}* ${checkEmoji}`);
		} catch (e) {
			console.log(e);
		}

	}
};