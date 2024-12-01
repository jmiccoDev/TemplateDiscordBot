const {Events, ActivityType} = require('discord.js');
const {DEV_MODE, activity} = require('../../src/discord-config.json');

module.exports = {
    name: Events.ClientReady, once: true, execute(client) {
        if (DEV_MODE) {
            client.user.setActivity("Dev Mode", {type: ActivityType.Watching});
        } else {
            const {name, type} = activity;
            client.user.setActivity(name, {type: ActivityType[type]});
        }
        console.log(`Logged in as ${client.user.tag}. Ready!`);
    },
};