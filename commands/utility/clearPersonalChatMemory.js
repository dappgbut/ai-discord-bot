const { SlashCommandBuilder } = require('discord.js');
const { clearUserChatMemory } = require('../../utils/individualLLMsystem');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('clearchatmemory')
        .setDescription('Clear your personal chat memory with the ai'),
    async execute(interaction) {
        const userid = interaction.user.id
        const memory = clearUserChatMemory(userid);
        if (memory == 'error') {
            await interaction.reply("No chat history found to clear.")
        } else {
            await interaction.reply('Self chat memory cleared!')
        }
    },
};