import { SlashCommandBuilder, CommandInteraction } from 'discord.js';

const userCommand = {
  data: new SlashCommandBuilder()
    .setName('user')
    .setDescription('Provides information about the user.'),
  async execute(interaction: CommandInteraction) {
    const guild = interaction.guild;
    if (!guild) {
      await interaction.reply('This command can only be used in a guild.');
      return;
    }
    const member = await guild.members.fetch(interaction.user.id);
    const joinedAt = member?.joinedAt;
    const username = interaction.user.username;
    await interaction.reply(
      `This command was run by ${username}, who joined on ${joinedAt ? joinedAt.toString() : 'an unknown date'}.`
    );
  },
};

export default userCommand;
