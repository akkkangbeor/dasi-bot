import { Client, Collection, GatewayIntentBits, Events } from 'discord.js';
import { config } from 'dotenv';
import { commands } from './commands';
import { Command } from './types/Command';

config();

// Client 타입을 확장하여 commands 속성을 추가
declare module 'discord.js' {
  interface Client {
    commands: Collection<string, Command>;
  }
}

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildPresences,
  ],
});

// 명령어 컬렉션 초기화
client.commands = new Collection<string, Command>();

// 명령어 등록
for (const command of commands) {
  if ('data' in command && 'execute' in command) {
    client.commands.set(command.data.name, command);
  }
}

// 준비 완료 이벤트
client.once(Events.ClientReady, () => {
  console.log('봇이 준비되었습니다!');
});

// 명령어 처리 이벤트
client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const command = client.commands.get(interaction.commandName);

  if (!command) {
    console.error(`${interaction.commandName} 명령어를 찾을 수 없습니다.`);
    return;
  }

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(error);
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({
        content: '명령어 실행 중 오류가 발생했습니다!',
        ephemeral: true,
      });
    } else {
      await interaction.reply({
        content: '명령어 실행 중 오류가 발생했습니다!',
        ephemeral: true,
      });
    }
  }
});

// 봇 로그인
client.login(process.env.DISCORD_TOKEN);
