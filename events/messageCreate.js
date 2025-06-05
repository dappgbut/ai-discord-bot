const { Events } = require('discord.js');
const { chatWithLLMForUser, clearUserChatMemory } = require('../utils/individualLLMsystem');
const prefix = process.env.PREFIX; // AI chat prefix
const adminprefix = process.env.ADMINPREFIX; // Admin prefix
const adminuser = process.env.ADMINUSERID;
const botid = process.env.CLIENTID;

module.exports = {
    name: Events.MessageCreate,
    async execute(message) {
        if (message.author.bot || !(message.content.startsWith(adminprefix) || message.content.startsWith(prefix))) return;

		let arg;
		let commandName2;
		if (message.content.startsWith(prefix)) {
			arg = message.content.slice(prefix.length).trimStart(); // AI
			commandName2 = arg;
		}

		const args = message.content.slice(adminprefix.length).trim().split(/ +/); // Admin
		console.log(args);
		const commandName = args.shift().toLowerCase(); // Admin
        
	    if (commandName2) {
		    async function aicommandsend() {
		    	// const response = await chatWithLLM(commandName)
		    	// message.reply(response)
				const userid = message.author.id;
				const model = 'deepseek-ai/DeepSeek-V3-0324';
				const response = await chatWithLLMForUser(userid, commandName2, model);
				message.reply(response)
		    }
		    console.log(commandName2);
		    aicommandsend();
	    } 
		if (commandName === 'echo') {
        	if (!args.length) {
            	return message.reply('You need to provide some text to echo!');
        	}
        	const textToEcho = args.join(' ');
        	message.channel.send(textToEcho);

    	} else if (commandName === 'clrmsg') {
	
			if (!message.author.id == adminuser) {
				message.reply({ content: 'You are not allowed to use this command!', flags: MessageFlags.Ephemeral });
			}

			let count = parseInt(args[0]);
	
			// Default to deleting 5 messages if no valid number is provided, or if the number is too small/large
			if (isNaN(count) || count <= 0) {
				count = 5; // Default number of bot messages to delete
			} else if (count > 25) { // Set a reasonable upper limit to prevent accidental mass deletion or API abuse
				count = 25;
				message.channel.send(`The number of messages to delete has been capped at 25.`).catch(console.error);
			}
	
			try {
				// Fetch messages from the channel. Fetch a bit more than 'count' to ensure we find enough bot messages.
				const fetchedMessages = await message.channel.messages.fetch({ limit: Math.min(100, count * 2 + 10) }); 
	
				// Filter for messages sent by THIS bot
				const botMessagesToDelete = fetchedMessages.filter(msg => msg.author.id === botid).first(count);
				// .first(count) gets the 'count' most recent messages from the filtered collection
	
				if (!botMessagesToDelete || botMessagesToDelete.length === 0) {
					return message.reply('No recent messages from me found to delete.').catch(console.error);
				}
	
				let deletedCount = 0;
	
				// Option 1: Iterative Deletion (safer for messages older than 14 days, handles errors per message)
				for (const msgToDelete of botMessagesToDelete) {
					try {
						await msgToDelete.delete(); 
						deletedCount++;
						// Optional: Add a small delay to avoid rate limits if deleting many, though less critical for small counts
						await new Promise(resolve => setTimeout(resolve, 200));
					} catch (delError) {
						console.error(`Failed to delete message ${msgToDelete.id}:`, delError);
						// You could inform the user if a specific message couldn't be deleted, or just log it.
					}
				}
	
				/*
				// Option 2: Bulk Deletion (more efficient for many RECENT messages, but has limitations)
				// Note: bulkDelete CANNOT delete messages older than 14 days and requires 2-100 messages.
				// You would need to add an age check if using this.
				if (botMessagesToDelete.length >= 2) {
					const recentBotMessages = botMessagesToDelete.filter(m => (Date.now() - m.createdTimestamp) < (14 * 24 * 60 * 60 * 1000 - 10000)); // Check if younger than ~14 days
					if (recentBotMessages.length > 0) {
						const result = await message.channel.bulkDelete(recentBotMessages, true); // true to filter out old messages automatically
						deletedCount = result.size;
					} else {
						 message.channel.send("Found bot messages, but they are older than 14 days and cannot be bulk deleted. Try deleting fewer or I'll attempt one by one if implemented.").catch(console.error);
						 // Here you could fall back to iterative deletion for the remaining older messages if desired.
					}
				} else if (botMessagesToDelete.length === 1) {
					try {
						await botMessagesToDelete[0].delete();
						deletedCount = 1;
					} catch (delError) {
						console.error(`Failed to delete message ${botMessagesToDelete[0].id}:`, delError);
					}
				}
				*/
	
	
				if (deletedCount > 0) {
					const replyMsg = await message.channel.send(`Successfully deleted ${deletedCount} of my message(s).`);
					// Optionally, delete this confirmation message after a few seconds
					setTimeout(() => replyMsg.delete().catch(console.error), 5000);
				} else {
					message.reply('Could not delete any of my messages. They might have been deleted already or an error occurred.').catch(console.error);
				}
	
				// Optionally, delete the user's command message
				if (message.deletable) {
					message.delete().catch(console.error);
				}
	
			} catch (error) {
				console.error('Error trying to delete bot messages:', error);
				message.reply('An error occurred while trying to delete my messages.').catch(console.error);
			}


		} else if (commandName === 'clrmsgbyid') {

			if (!message.author.id == adminuser) {
				message.reply({ content: 'You are not allowed to use this command!', flags: MessageFlags.Ephemeral });
			}

			if (args.length === 0) {
				return message.reply('Please provide at least one message ID to delete. Usage: `!delbotid <messageId1> [messageId2] ...`').catch(console.error);
			}

			const messageIdsToDelete = args; // Args directly contains the IDs
			let successfullyDeletedCount = 0;
			let failedToDeleteCount = 0;
			const notFoundIds = [];
			const notBotMessageIds = [];

			const statusMessages = [];

			for (const id of messageIdsToDelete) {
				// Validate if the ID looks like a Discord Snowflake ID (a string of numbers)
				if (!/^\d+$/.test(id)) {
					statusMessages.push(`Skipped: '${id}' is not a valid message ID format.`);
					failedToDeleteCount++;
					continue;
				}

				try {
					const msgToDelete = await message.channel.messages.fetch(id); // [17]

					if (msgToDelete) {
						// IMPORTANT: Verify the message was sent by THE BOT
						if (msgToDelete.author.id === botid) {
							await msgToDelete.delete(); // [3]
							successfullyDeletedCount++;
							// statusMessages.push(`Successfully deleted message ${id}.`);
						} else {
							notBotMessageIds.push(id);
							failedToDeleteCount++;
							// statusMessages.push(`Skipped: Message ${id} was not sent by me.`);
						}
					} else {
						// This 'else' might not be reached if fetch throws an error for not found.
						// The catch block handles 'Unknown Message' errors.
						notFoundIds.push(id);
						failedToDeleteCount++;
					}
				} catch (error) {
					failedToDeleteCount++;
					if (error.code === 10008) { // Unknown Message
						notFoundIds.push(id);
						// statusMessages.push(`Failed to delete ${id}: Message not found.`);
					} else {
						console.error(`Failed to delete message ${id}:`, error);
						// statusMessages.push(`Failed to delete ${id}: An unexpected error occurred.`);
					}
				}
			}

			let replyMessageContent = "";
			if (successfullyDeletedCount > 0) {
				replyMessageContent += `Successfully deleted ${successfullyDeletedCount} of my message(s).\n`;
			}
			if (notBotMessageIds.length > 0) {
				replyMessageContent += `Skipped ${notBotMessageIds.length} message(s) because they were not sent by me: ${notBotMessageIds.join(', ')}\n`;
			}
			if (notFoundIds.length > 0) {
				replyMessageContent += `Could not find ${notFoundIds.length} message(s): ${notFoundIds.join(', ')}\n`;
			}
			if (failedToDeleteCount > 0 && successfullyDeletedCount === 0 && notBotMessageIds.length === 0 && notFoundIds.length === 0) {
				// This handles cases where IDs were invalid format or other unclassified errors happened.
				replyMessageContent += `Failed to process ${failedToDeleteCount} provided ID(s) for other reasons.\n`;
			}


			if (replyMessageContent === "") {
				replyMessageContent = "No valid message IDs provided or no matching messages found to delete.";
			}

			const replyMsg = await message.channel.send(replyMessageContent.trim()).catch(console.error);
			if (replyMsg) {
				setTimeout(() => replyMsg.delete().catch(console.error), 10000); // Delete confirmation after 10 seconds
			}


			// Optionally, delete the user's command message
			// if (message.deletable) {
			// 	message.delete().catch(console.error);
			// }
		}
    },
    
};