"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs = __importStar(require("fs"));
const path_1 = __importDefault(require("path"));
const discord_js_1 = require("discord.js");
const config_json_1 = require("./config.json");
class MyClient extends discord_js_1.Client {
    constructor() {
        super({ intents: [discord_js_1.GatewayIntentBits.Guilds] });
        this.commands = new discord_js_1.Collection();
    }
    registerCommands() {
        const foldersPath = path_1.default.join(__dirname, 'commands');
        const commandFolders = fs.readdirSync(foldersPath);
        for (const folder of commandFolders) {
            const commandsPath = path_1.default.join(foldersPath, folder);
            const commandFiles = fs.readdirSync(commandsPath).filter((file) => file.endsWith('.ts'));
            for (const file of commandFiles) {
                const filePath = path_1.default.join(commandsPath, file);
                const command = require(filePath).default;
                if ('data' in command && 'execute' in command) {
                    this.commands.set(command.data.name, command);
                }
                else {
                    console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
                }
            }
        }
    }
    async start() {
        this.registerCommands();
        this.once('ready', () => {
            console.log('Ready!');
        });
        this.on('interactionCreate', async (interaction) => {
            if (!interaction.isCommand())
                return;
            const command = this.commands.get(interaction.commandName);
            if (!command)
                return;
            try {
                await command.execute(interaction);
            }
            catch (error) {
                console.error(error);
                const errorMessage = 'There was an error while executing this command!';
                if (interaction.replied || interaction.deferred) {
                    await interaction.followUp({ content: errorMessage, ephemeral: true });
                }
                else {
                    await interaction.reply({ content: errorMessage, ephemeral: true });
                }
            }
        });
        await this.login(config_json_1.token);
    }
}
const client = new MyClient();
client.start();
