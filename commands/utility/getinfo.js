const { SlashCommandBuilder, EmbedBuilder, InteractionContextType } = require('discord.js');
const { fetch } = require('undici');

module.exports = {
    category: 'utility',
    data: new SlashCommandBuilder()
        .setName('getinfo')
        .setDescription(`Get user's information by username! (must be exact)`)
        .setContexts(InteractionContextType.Guild, InteractionContextType.BotDM, InteractionContextType.PrivateChannel)
        .addStringOption(option =>
            option.setName('username')
                .setDescription(`The user's username (searching display name may return inaccurate results)`)
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

            // finding username from api call
            const searchData = await searchResponse.json();

            if(!searchData.data || searchData.data.length === 0) {
                return await interaction.editReply({
                    content: "Couldn't fetch user data. Possibly invalid username",
                    ephemeral: true
                });
            }
            
            let userCheck = null;

            for(let user of searchData.data) {
               if(user.name.trim() == input){
                userCheck = user;
                break;
               }
            }

            if(!userCheck){
                return await interaction.editReply({
                    content: "Unable to find user, search is case sensitive."
                });
            }

            // get userid
            const userId = userCheck.id;

            // headshot api call
            const userCall = await fetch(`https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${userId}&size=50x50&format=Png&isCircular=false`);
            const userData = await userCall.json();

            if(!userData.data) {
                return await interaction.editReply({
                    content: "Couldn't turn username into userid.",
                    epheremal: true
                })
            }

            // userinfo api call
            const userInfoCall = await fetch(`https://users.roblox.com/v1/users/${userId}`);
            const userInfoData = await userInfoCall.json();

            // rap api call
            const userRapCall = await fetch(`https://api.rolimons.com/players/v1/playerinfo/${userId}`);
            const userRapData = await userRapCall.json();

            const joinDate = new Date(userInfoData.created)
            const imageUrl = userData.data[0].imageUrl;

            const embed = new EmbedBuilder()
                .setTitle(`${userCheck.name}'s Information`)
                .setImage(imageUrl)
                .setDescription(`
                    Display: ${userCheck.displayName}
                    Join Date: ${joinDate.getMonth() + 1}/${joinDate.getDate()}/${joinDate.getFullYear()}
                    RAP: ${userRapData.rap} (if null inventory may be private)
                    `);

            return await interaction.editReply({ embeds: [embed] });
        } catch (error) {
            console.error(error);
            await interaction.editReply({
                content: "Couldn't reach ROBLOX API.",
                ephemeral: true
            });
        }
    },
};
