const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('delspecifiedmsg')
        .setDescription('Deletes a specified number of the last bot messages/interactions triggered by you.')
        .addIntegerOption(option =>
            option.setName('count')
                .setDescription('The number of bot messages to delete (default: 1, max: 5)')
                .setRequired(true)
                .setMinValue(1)
                .setMaxValue(5)), // It's good practice to set a max value
    async execute(interaction) {
        const user = interaction.user;
        const channel = interaction.channel;
        let count = interaction.options.getInteger('count') || 1; // Get the option, default to 1

        if (!channel.isTextBased()) {
            return interaction.reply({ content: 'This command can only be used in text channels.', ephemeral: true });
        }

        // Cap the count again here as a safeguard, even though SlashCommandBuilder has a max.
        // This is in case the builder's max changes or for extra safety.
        count = Math.min(count, 5); // Ensure it doesn't exceed your defined safe maximum

        try {
            // Defer the reply as deleting multiple messages might take a bit longer. [5, 6]
            await interaction.deferReply({ ephemeral: true });

            // Fetch more messages if we intend to delete more.
            // Consider the 'count' when deciding the limit. Add some buffer.
            const fetchLimit = Math.max(50, count * 10); // Fetch at least 50, or more if count is high
            const messages = await channel.messages.fetch({ limit: fetchLimit }); // [1, 18]

            const userBotInteractions = messages.filter(msg => {
                if (msg.author.id !== interaction.client.user.id) {
                    return false;
                }
                if (msg.interaction && msg.interaction.user.id === user.id) {
                    return true;
                }
                if (msg.reference && msg.reference.messageId) {
                    // A more robust check might involve fetching the replied-to message
                    // This simplified check assumes the bot replies directly.
                    const repliedToMessage = messages.get(msg.reference.messageId); // Try to get from fetched cache
                    if (repliedToMessage && repliedToMessage.author.id === user.id) {
                        return true;
                    }
                    // If not in cache, you might need an additional fetch for the referenced message,
                    // but be mindful of API calls. For simplicity, this example relies on it being in the initial fetch.
                }
                return false;
            });

            if (userBotInteractions.size === 0) {
                return interaction.editReply({ content: 'No recent bot messages or interactions triggered by you were found.' });
            }

            let deletedCount = 0;
            // Messages are typically sorted newest to oldest by 'fetch'.
            // We iterate through the filtered messages (which are already sorted newest first)
            // and delete them one by one up to the specified 'count'.
            for (const messageToDelete of userBotInteractions.values()) {
                if (deletedCount >= count) {
                    break; // Stop if we've deleted the requested number
                }
                try {
                    await messageToDelete.delete(); // [3]
                    deletedCount++;
                    // Adding a small delay can help avoid rate limits if deleting many messages,
                    // though for a small count (e.g., up to 5), it's often not strictly necessary.
                    // await new Promise(resolve => setTimeout(resolve, 250)); // Optional delay
                } catch (delError) {
                    console.error(`Failed to delete a message: ${messageToDelete.id}`, delError);
                    // Optionally inform the user if a specific message couldn't be deleted
                    // but continue trying to delete others.
                }
            }

            if (deletedCount > 0) {
                await interaction.editReply({ content: `Successfully deleted ${deletedCount} bot message(s) triggered by you.` });
            } else {
                await interaction.editReply({ content: 'Could not find any of your recent bot messages/interactions to delete, or failed to delete them.' });
            }

        } catch (error) {
            console.error('Error in delete-last-bot-replies command:', error);
            if (!interaction.replied && !interaction.deferred) {
                await interaction.reply({ content: 'An error occurred while trying to execute the command.', ephemeral: true });
            } else {
                await interaction.editReply({ content: 'An error occurred while trying to delete the messages.' });
            }
        }
    },
};