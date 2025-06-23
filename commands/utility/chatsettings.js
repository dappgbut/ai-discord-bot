const { Client, SlashCommandBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

// Path to your settings file
const settingsPath = path.join(__dirname, '..', '..', 'userSettings.json');

// Function to read user settings
const readSettings = () => {
    if (!fs.existsSync(settingsPath)) {
        return {};
    }
    const data = fs.readFileSync(settingsPath, 'utf8');
    return JSON.parse(data);
};

// Function to write user settings
const writeSettings = (settings) => {
    fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2));
};

module.exports = {
    data: new SlashCommandBuilder()
        .setName('chatsettings')
        .setDescription('Settings for your personal chat with the AI')
        .addStringOption(option =>
            option.setName('model')
                .setDescription('Choose your preferred AI model')
                .setRequired(true)
                .addChoices(
                    { name: 'DeepSeek V3 0324', value: 'deepseek-ai/DeepSeek-V3-0324' },
                    { name: 'DeepSeek R1 0528', value: 'deepseek-ai/DeepSeek-R1-0528' }
                )),
    async execute(interaction) {
        const userId = interaction.user.id;
        const choice = interaction.options.getString('model');

        const settings = readSettings();
        settings[userId] = { aiModel: choice };
        writeSettings(settings);

        await interaction.reply({ content: `Your preferred AI Model has been set to: **${choice}**`, ephemeral: true });	
    },
};