const { Events } = require('discord.js');
const { chatWithLLMForUser, clearUserChatMemory } = require('../utils/individualLLMsystem');
const prefix = process.env.PREFIX;

module.exports = {
    name: Events.MessageCreate,
    async execute(message) {
        if (message.author.bot || !message.content.startsWith(prefix)) return;
	    const args = message.content.slice(prefix.length).trimStart();
        const commandName = args;

	    if (commandName) {
		    async function aicommandsend() {
		    	// const response = await chatWithLLM(commandName)
		    	// message.reply(response)
				const userid = message.author.id;
				const model = 'deepseek-ai/DeepSeek-V3-0324';
				const response = await chatWithLLMForUser(userid, commandName, model);
				message.reply(response)
		    }
		    console.log(commandName);
		    aicommandsend();
	    }
    },
    
};