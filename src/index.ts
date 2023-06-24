import * as fs from 'fs';
import path from 'path';
import { Client, Collection, GatewayIntentBits, Interaction } from 'discord.js';
import { token } from './config.json';

class MyClient extends Client {
	public commands: Collection<string, any>; // Adjust the type or interface for your command structure

	constructor() {
		super({ intents: [GatewayIntentBits.Guilds] });
		this.commands = new Collection();
	}

	private registerCommands() {
		const foldersPath = path.join(__dirname, 'commands');
		const commandFolders = fs.readdirSync(foldersPath);

		for (const folder of commandFolders) {
			const commandsPath = path.join(foldersPath, folder);
			const commandFiles = fs.readdirSync(commandsPath).filter((file: string) => file.endsWith('.ts'));
			for (const file of commandFiles) {
				const filePath = path.join(commandsPath, file);
				const command = require(filePath).default;
				if ('data' in command && 'execute' in command) {
					this.commands.set(command.data.name, command);
				} else {
					console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
				}
			}
		}
	}

	public async start() {
		this.registerCommands();

		this.once('ready', () => {
			console.log('Ready!');
		});

		this.on('interactionCreate', async (interaction: Interaction) => {
			if (!interaction.isCommand()) return;

			const command = this.commands.get(interaction.commandName);

			if (!command) return;

			try {
				await command.execute(interaction);
			} catch (error) {
				console.error(error);
				const errorMessage = 'There was an error while executing this command!';
				if (interaction.replied || interaction.deferred) {
					await interaction.followUp({ content: errorMessage, ephemeral: true });
				} else {
					await interaction.reply({ content: errorMessage, ephemeral: true });
				}
			}
		});

		await this.login(token);
	}
}

const client = new MyClient();
client.start();
