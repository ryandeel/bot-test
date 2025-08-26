// run this to see if theres any extra hiding little commands

const { REST, Routes } = require('discord.js');
const { clientId, token } = require('./config.json');

const rest = new REST().setToken(token);

(async () => {
    try {
        console.log('Fetching global application commands...');

        const commands = await rest.get(
            Routes.applicationCommands(clientId)
        );

        console.log('Global commands retrieved successfully:');
        console.log(JSON.stringify(commands, null, 2));
    } catch (error) {
        console.error('Error fetching commands:', error);
    }
})();