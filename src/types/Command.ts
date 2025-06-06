import { CommandInteraction, SlashCommandBuilder } from 'discord.js';

export interface Command {
  data: SlashCommandBuilder | Omit<SlashCommandBuilder, 'addSubcommand' | 'addSubcommandGroup'>;
  execute: (interaction: CommandInteraction) => Promise<void>;
  [key: string]: unknown;
}
