import { REST, Routes, PermissionFlagsBits } from 'discord.js';
import { config } from 'dotenv';
import { commands } from './commands';

config();

const commandsToRegister = commands.map((command) => command.data.toJSON());

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN!);

// 실제로 필요한 권한만 설정
const permissions = [
  PermissionFlagsBits.SendMessages,
  PermissionFlagsBits.ViewChannel,
  PermissionFlagsBits.EmbedLinks,
];

(async () => {
  try {
    console.log('Started refreshing application (/) commands.');

    await rest.put(Routes.applicationCommands(process.env.CLIENT_ID!), {
      body: commandsToRegister,
    });

    console.log('Successfully reloaded application (/) commands.');

    // 봇 초대 링크 생성
    const permissionInteger = permissions.reduce((a, b) => Number(a) | Number(b), 0);
    const inviteLink = `https://discord.com/api/oauth2/authorize?client_id=${process.env.CLIENT_ID}&permissions=${permissionInteger}&scope=bot%20applications.commands`;
    console.log(`\n봇 초대 링크: ${inviteLink}`);
  } catch (error) {
    console.error(error);
  }
})();
