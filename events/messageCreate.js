const { Events } = require('discord.js');
const { chatWithLLM } = require('../utils/aillm');
const prefix = process.env.PREFIX;

module.exports = {
    name: Events.MessageCreate,
    async execute(message) {
        if (message.author.bot || !message.content.startsWith(prefix)) return;
	    const args = message.content.slice(prefix.length).trimStart();
        const commandName = args;

	    if (commandName) {
		    async function aicommandsend() {
		    	const response = await chatWithLLM(commandName)
		    	message.reply(response)
		    }
		    console.log(commandName);
		    aicommandsend();
	    }
    },
    
};