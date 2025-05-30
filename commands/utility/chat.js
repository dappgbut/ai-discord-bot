const {SlashCommandBuilder} = require('discord.js');
const { chatWithLLM } = require('../../utils/aillm');
module.exports = {
	data: new SlashCommandBuilder()
		.setName('chat')
		.setDescription('Chatty-Chatty with your own maid')
        .addStringOption(option =>
		option.setName('input')
			.setDescription('Input your message here')
            .setRequired(true)),
	async execute(interaction) {
		await interaction.deferReply();
	    const prompt = interaction.options.getString('input');
	    const response = await chatWithLLM(prompt);
	    await interaction.editReply(
			`**${interaction.member.displayName}:** ${prompt}\n\n**Maid:** ${response}`
		);
	},
};