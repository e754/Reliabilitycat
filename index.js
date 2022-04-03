const fs = require('node:fs');
const { Client, Collection, Intents } = require('discord.js');
const { token } = require('./config.json');
const { MessageActionRow, MessageButton } = require('discord.js');
const { InteractionResponseTypes } = require('discord.js/src/util/Constants');
const wait = require('node:timers/promises').setTimeout;
const client = new Client({ intents: [Intents.FLAGS.GUILDS] });
function getRandomArbitrary(min, max) {
    return Math.random() * (max - min) + min;
}
global.article=0;
global.articlepresent=false;
client.commands = new Collection();
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	client.commands.set(command.data.name, command);
}


const eventFiles = fs.readdirSync('./events').filter(file => file.endsWith('.js'));




for (const file of eventFiles) {
	const event = require(`./events/${file}`);
	if (event.once) {
		client.once(event.name, (...args) => event.execute(...args));
	} else {
		client.on(event.name, (...args) => event.execute(...args));
	}
}

client.on('interactionCreate', async interaction => {        // slash commands

	if(interaction.isCommand())
	{
		                          // choose random article
		const command = client.commands.get(interaction.commandName);
	
		if (!command) return;
	
		try {
			await command.execute(interaction);
		} catch (error) {
			console.error(error);
			await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
		}
	} 
	else if(interaction.isButton())
	{
		const filter = i => (i.customId === 'yes'||i.customId==='no');

		const collector = interaction.channel.createMessageComponentCollector({ filter, time: 15000 });    //button stuff
		collector.on('collect', async i => {
			try {
				if (i.customId === 'yes') {
					await i.deferUpdate();
					if(global.curr.reliable)
					{
						await i.editReply({ content: ':white_check_mark: You got it! \n '+global.curr.why, components: [],embed:[] });
					}
					else
					{
						await i.editReply({ content: ':x: You bozo.\n'+ global.curr.why, components: [],embed:[] });
					}
					global.articlepresent=false;
				}
				else if(i.customId==='no') {
					await i.deferUpdate();
					await wait(2000);
					if(!global.curr.reliable)
					{
						await i.editReply({ content: ':white_check_mark: You got it! \n '+global.curr.why, components: [],embed:[] });
					}
					else
					{
						await i.editReply({ content: ':x: You bozo. \n '+global.curr.why, components: [],embed:[] });
					}
					global.articlepresent=false;
				}
			}	catch {}
		});
		
		collector.on('end', collected => console.log(`Collected ${collected.size} items`));
	}
	else return;
});





client.login(token);