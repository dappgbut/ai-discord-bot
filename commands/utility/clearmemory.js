const { SlashCommandBuilder } = require('discord.js');
const { clearChatMemory } = require('../../utils/aillm');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('clearmemory')
		.setDescription('Clear the ai chat memory'),
	async execute(interaction) {
		clearChatMemory();
        await interaction.reply('Chat memory cleared!')
	},
};