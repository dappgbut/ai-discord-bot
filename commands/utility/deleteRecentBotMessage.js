const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('deletemsg')
        .setDescription('Deletes the last bot message or interaction triggered by you in this channel.'),
    async execute(interaction) {
        const user = interaction.user;
        const channel = interaction.channel;

        if (!channel.isTextBased()) {
            return interaction.reply({ content: 'This command can only be used in text channels.', ephemeral: true });
        }

        try {
            // Fetch the last 50 messages in the channel. You might need to adjust the limit.
            const messages = await channel.messages.fetch({ limit: 50 });

            // Filter messages to find the target message
            const userBotInteractions = messages.filter(msg => {
                // Check if the message is from the bot
                if (msg.author.id !== interaction.client.user.id) {
                    return false;
                }

                // Check for interaction responses (slash commands, buttons, select menus)
                if (msg.interaction && msg.interaction.user.id === user.id) {
                    return true;
                }

                // Check for messages replying to the user
                if (msg.reference && msg.reference.messageId) {
                    const repliedToMessage = messages.get(msg.reference.messageId);
                    if (repliedToMessage && repliedToMessage.author.id === user.id) {
                        return true;
                    }
                }
                return false;
            });

            if (userBotInteractions.size > 0) {
                // Get the most recent one (messages are typically sorted newest to oldest by fetch)
                const messageToDelete = userBotInteractions.first();

                if (messageToDelete) {
                    await messageToDelete.delete();
                    await interaction.reply({ content: 'Successfully deleted the last bot interaction/message triggered by you.', ephemeral: true });
                } else {
                    await interaction.reply({ content: 'Could not find a recent bot message or interaction triggered by you to delete.', ephemeral: true });
                }
            } else {
                await interaction.reply({ content: 'No recent bot messages or interactions triggered by you found in the last 50 messages.', ephemeral: true });
            }

        } catch (error) {
            console.error('Error deleting bot message:', error);
            // It's good practice to defer the reply if the operation might take time.
            if (interaction.deferred || interaction.replied) {
                await interaction.editReply({ content: 'An error occurred while trying to delete the message.', ephemeral: true });
            } else {
                await interaction.reply({ content: 'An error occurred while trying to delete the message.', ephemeral: true });
            }
        }
    },
};