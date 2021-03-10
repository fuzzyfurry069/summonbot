const config = require(`../config`);
const prefix = config.prefix;


module.exports = class {
    constructor(client) {
        this.client = client;
    }

    async run () {

        const client = this.client;

            await client.logger.log('Ready to summon members!', "ready");
            await client.logger.log(`Starting up for ${client.guilds.cache.reduce((a, g) => a + g.memberCount, 0)} roleplayers!`, "ready");
        
            const activities = [
                {
                    'text': `${prefix}help`,
                    'type': 'PLAYING',
                },
                {
                    'text': 'my admins!',
                    'type': 'LISTENING',
                },
                {
                    'text': `v${config.version}`,
                    'type': 'PLAYING',
                },
            ];
        setInterval(function() {
            const activity = activities[Math.floor(Math.random() * activities.length)];
            client.user.setActivity(activity.text, { type: activity.type });
        }, 20000);
    };
};