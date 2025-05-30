require('dotenv').config();
const { chatWithLLM } = require('./utils/aillm');
const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, Events, GatewayIntentBits } = require('discord.js');
const token = process.env.BOTTOKEN;
const prefix = process.env.PREFIX;

// Create a new client instance
const client = new Client({ intents: [
	GatewayIntentBits.Guilds,
	GatewayIntentBits.GuildMessages,
	GatewayIntentBits.MessageContent
] });

client.commands = new Collection();

const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
	const commandsPath = path.join(foldersPath, folder);
	const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file);
		const command = require(filePath);
		// Set a new item in the Collection with the key as the command name and the value as the exported module
		if ('data' in command && 'execute' in command) {
			client.commands.set(command.data.name, command);
		} else {
			console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
		}
	}
}

const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
	const filePath = path.join(eventsPath, file);
	const event = require(filePath);
	if (event.once) {
		client.once(event.name, (...args) => event.execute(...args));
	} else {
		client.on(event.name, (...args) => event.execute(...args));
	}
}

// Chat by mentioning the bot
client.on('messageCreate', async message => {
    if (message.author.bot || !message.content.startsWith(prefix)) return;
	const args = message.content.slice(prefix.length).trimStart();
    const commandName = args; // Get the first element (command) and remove it from args, also lowercasing it
    // --- COMMAND HANDLING ---

    // Example: Ping command
    //if (commandName === 'ping') {
    //    const timeTaken = Date.now() - message.createdTimestamp;
    //    message.reply(`Pong! Latency is ${timeTaken}ms. API Latency is ${Math.round(client.ws.ping)}ms.`);
    //}
    //// Example: Echo command
    //else if (commandName === 'echo') {
    //    if (!args.length) {
    //        return message.reply('You need to provide some text to echo!');
    //    }
    //    const textToEcho = args.join(' ');
    //    message.channel.send(textToEcho);
    //}

	if (commandName) {
		async function aicommandsend() {
			const response = await chatWithLLM(commandName)
			message.reply(response)
		}
		console.log(commandName);
		aicommandsend();
	}

});

client.login(token);