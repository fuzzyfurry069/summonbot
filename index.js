const util = require(`util`);
const fs = require(`fs`);
const readdir = util.promisify(fs.readdir);
const config = require(`./config`);

const Bot = require(`./base/Bot`);
client = new Bot;


const init = async () => {

    const directories = await readdir("./commands/");
	client.logger.log(`Loading a total of ${directories.length} categories.`, "log");
	directories.forEach(async (dir) => {
		const commands = await readdir("./commands/"+dir+"/");
		commands.filter((cmd) => cmd.split(".").pop() === "js").forEach((cmd) => {
			const response = client.loadCommand("./commands/"+dir, cmd);
			if(response){
				client.logger.log(response, "error");
			}
        });
        client.logger.log(`Loading a total of ${commands.length} commands in ${dir}.`, 'ready');
    });
    
    const evtFiles = await readdir("./events/");
	client.logger.log(`Loading a total of ${evtFiles.length} events.`, "log");
	evtFiles.forEach((file) => {
		const eventName = file.split(".")[0];
		client.logger.log(`Loading Event: ${eventName}`, "ready");
		const event = new (require(`./events/${file}`))(client);
		client.on(eventName, (...args) => event.run(...args));
		delete require.cache[require.resolve(`./events/${file}`)];
    });

    
    client.login(config.token);
}

init();

client.on("disconnect", () => client.logger.log("Bot is disconnecting...", "warn"))
      .on("reconnecting", () => client.logger.log("Bot reconnecting...", "log"))
      .on("error", (e) => client.logger.log(e, "error"))
      .on("warn", (info) => client.logger.log(info, "warn"));
    
process.on("unhandledRejection", (err) => {
    console.error(err);
});