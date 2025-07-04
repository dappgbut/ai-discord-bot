require('dotenv').config();
const { REST, Routes } = require('discord.js');
const token = process.env.BOTTOKEN;
const clientId = process.env.CLIENTID;
const guildId = process.env.TGUILDID;

const rest = new REST().setToken(token);

// for guild-based commands
rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: [] })
	.then(() => console.log('Successfully deleted all guild commands.'))
	.catch(console.error);

// for global commands
rest.put(Routes.applicationCommands(clientId), { body: [] })
	.then(() => console.log('Successfully deleted all application commands.'))
	.catch(console.error);