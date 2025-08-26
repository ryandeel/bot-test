const { SlashCommandBuilder, ApplicationIntegrationType, InteractionContextType } = require('discord.js');
const { fetch } = require('undici');

module.exports = {
    category: 'utility',
    data: new SlashCommandBuilder()
        .setName('joindate')
        .setDescription(`Checks the user's join date by userid!`)
        .setContexts(InteractionContextType.Guild, InteractionContextType.BotDM, InteractionContextType.PrivateChannel)
        .addIntegerOption(option =>
            option.setName('userid')
                .setDescription(`The user's profile ID.`)
                .setRequired(true)
                .setMinValue(1)
        ),
    async execute(interaction) {
        const input = interaction.options.getInteger('userid');
        await interaction.deferReply();

        try {
            const response = await fetch(`https://users.roblox.com/v1/users/${input}`)
            const data = await response.json();

            if(!data.created) {
                return await interaction.editReply({
                    content: "Couldn't fetch user data. Possibly invalid user ID.",
                    ephemeral: true
                });
            }

            const date = await new Date(data.created)

            await interaction.editReply(`User "${data.displayName}" (${data.name}) joined ROBLOX on ${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}.`)
        } catch (error) {
            console.error(error);
            await interaction.editReply({
                content: "Couldn't reach ROBLOX API.",
                ephemeral: true
        });
        }
    },
};