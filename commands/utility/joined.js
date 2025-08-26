const { SlashCommandBuilder, ApplicationIntegrationType, InteractionContextType } = require('discord.js');
const { fetch } = require('undici');

module.exports = {
    category: 'utility',
    data: new SlashCommandBuilder()
        .setName('joined')
        .setDescription(`Checks the user's join date by username!`)
        .setContexts(InteractionContextType.Guild, InteractionContextType.BotDM, InteractionContextType.PrivateChannel)
        .addStringOption(option =>
            option.setName('username')
                .setDescription(`The user's display/name (note display name may not return who you're looking for)`)
                .setRequired(true)
                .setMinLength(3)
                .setMaxLength(20)
        ),
    async execute(interaction) {
        const input = interaction.options.getString('username');
        await interaction.deferReply();

         try {
            const searchResponse = await fetch(`https://users.roblox.com/v1/users/search?keyword=${encodeURIComponent(input)}`);

            if (!searchResponse.ok) {
                if (searchResponse.status === 429) {
                    await interaction.editReply({
                        content: "Rate limited by Roblox API. (note it is about 1-2 minutes).",
                        ephemeral: true
                    });
                    return;
                }
                throw new Error(`API responded with status: ${searchResponse.status}`);
            }

            const searchData = await searchResponse.json();

            if(!searchData.data || searchData.data.length === 0) {
                return await interaction.editReply({
                    content: "Couldn't fetch user data. Possibly invalid username",
                    ephemeral: true
                });
            }

            const userId = searchData.data[0].id;

            const userCall = await fetch(`https://users.roblox.com/v1/users/${userId}`);
            const userData = await userCall.json();

            if(!userData.created) {
                return await interaction.editReply({
                    content: "Couldn't turn username into userid.",
                    epheremal: true
                })
            }

            const date = new Date(userData.created)

            return await interaction.editReply(`User "${userData.displayName}" (${userData.name}) joined ROBLOX on ${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}.`)
        } catch (error) {
            console.error(error);
            await interaction.editReply({
                content: "Couldn't reach ROBLOX API.",
                ephemeral: true
        });
        }
    },
};
