const { SlashCommandBuilder } = require('discord.js');
const getPlayerProfile = require('../../services/pikaApi.js');
const { checkEmoji, crossEmoji } = require('../../config/config.js');

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


	},
};