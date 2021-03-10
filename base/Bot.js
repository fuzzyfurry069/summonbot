const { MessageEmbed } = require(`discord.js`);
const { Player } = require(`discord-player`);
const {Client, Collection } = require(`discord.js`);
const path = require(`path`);
const config = require(`../config`);

class Bot extends Client {
    constructor (options) {
		super(options);
		this.config = require("../config"); // Load the config file
		this.customEmojis = config.emoji; // load the bot's emojis
		this.commands = new Collection(); // Creates new commands collection
        this.aliases = new Collection(); // Creates new command aliases collection
		this.logger = require(`../helpers/logger`); //Load the Logger file
    };
	
    loadCommand (commandPath, commandName) {
        try {
            const props = new (require(`.${commandPath}${path.sep}${commandName}`))(this);
            props.conf.location = commandPath;
            if (props.init){
                props.init(this);
            }
            this.commands.set(props.help.name, props);
            props.help.aliases.forEach((alias) => {
                this.aliases.set(alias, props.help.name);
            });
            return false;
        } catch (e) {
            return `Unable to load command ${commandName}: ${e}`;
        };
    };

    async unloadCommand (commandPath, commandName) {
        let command;
        if(this.commands.has(commandName)) {
            command = this.commands.get(commandName);
        }
        else if(this.aliases.has(commandName)) {
            command = this.commands.get(this.aliases.get(commandName));
        }
        if(!command){
            return(`The command \`${commandName}\` doesn't seem to exist.`)
        }
        if(command.shutdown) {
            await command.shutdown(this);
        }
		delete require.cache[require.resolve(`.${commandPath}${path.sep}${commandName}.js`)];
		this.logger.log(`Unloading Command: ${commandName}.`, "warn");
        return false;
    }

    async resolveUser(search){
		let user = null;
		if(!search || typeof search !== "string") return;
		// Try ID search
		if(search.match(/^<@!?(\d+)>$/)){
			const id = search.match(/^<@!?(\d+)>$/)[1];
			user = this.users.fetch(id).catch(() => {});
			if(user) return user;
		}
		// Try username search
		if(search.match(/^!?(\w+)#(\d+)$/)){
			const username = search.match(/^!?(\w+)#(\d+)$/)[0];
			const discriminator = search.match(/^!?(\w+)#(\d+)$/)[1];
			user = this.users.find((u) => u.username === username && u.discriminator === discriminator);
			if(user) return user;
		}
		user = await this.users.fetch(search).catch(() => {});
		return user;
	}

	async resolveMember(search, guild){
		let member = null;
		if(!search || typeof search !== "string") return;
		// Try ID search
		if(search.match(/^<@!?(\d+)>$/)){
			const id = search.match(/^<@!?(\d+)>$/)[1];
			member = await guild.members.fetch(id).catch(() => {});
			if(member) return member;
		}
		// Try username search
		if(search.match(/^!?(\w+)#(\d+)$/)){
			guild = await guild.fetch();
			member = guild.members.cache.find((m) => m.user.tag === search);
			if(member) return member;
		}
		member = await guild.members.fetch(search).catch(() => {});
		return member;
	}

	async resolveRole(search, guild){
		let role = null;
		if(!search || typeof search !== "string") return;
		// Try ID search
		if(search.match(/^<@&!?(\d+)>$/)){
			const id = search.match(/^<@&!?(\d+)>$/)[1];
			role = guild.roles.cache.get(id);
			if(role) return role;
		}
		// Try name search
		role = guild.roles.cache.find((r) => search === r.name);
		if(role) return role;
		role = guild.roles.cache.get(search);
		return role;
	}

    randomNum(max, min) {
        return Math.floor(Math.random() * (max - min)) + min;
    }
}

module.exports = Bot;