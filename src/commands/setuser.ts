import { SlashCommandBuilder } from '@discordjs/builders';
import {
  CommandInteraction,
  ChannelType,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuInteraction,
} from 'discord.js';
import { Command } from '../types/Command';

// 사용자 ID와 채널 ID를 저장할 Map
const userMap = new Map<string, { baekjoonId: string; channelId: string }>();

// 임시로 사용자 ID를 저장할 Map
const tempUserIds = new Map<string, string>();

const command: Command = {
  data: new SlashCommandBuilder()
    .setName('setuser')
    .setDescription('백준 온라인 저지 사용자 ID와 알림을 받을 채널을 설정합니다.')
    .addStringOption((option) =>
      option.setName('user_id').setDescription('백준 온라인 저지 사용자 ID').setRequired(true),
    ) as SlashCommandBuilder,
  async execute(interaction: CommandInteraction) {
    const userId = interaction.options.get('user_id')?.value as string;
    if (!userId) {
      await interaction.reply('사용자 ID를 입력해주세요.');
      return;
    }

    // 임시로 사용자 ID 저장
    tempUserIds.set(interaction.user.id, userId);

    // 채널 선택 메뉴 생성
    const selectMenu = new StringSelectMenuBuilder()
      .setCustomId('channel-select')
      .setPlaceholder('알림을 받을 채널을 선택하세요')
      .addOptions(
        interaction.guild?.channels.cache
          .filter((channel) => channel.type === ChannelType.GuildText)
          .map((channel) => ({
            label: channel.name,
            description: `#${channel.name}`,
            value: channel.id,
          })) || [],
      );

    const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(selectMenu);

    await interaction.reply({
      content: '알림을 받을 채널을 선택해주세요.',
      components: [row],
      ephemeral: true,
    });

    // 채널 선택 이벤트 리스너
    const collector = interaction.channel?.createMessageComponentCollector({
      time: 60000, // 1분
    });

    collector?.on('collect', async (i: StringSelectMenuInteraction) => {
      if (i.customId === 'channel-select' && i.user.id === interaction.user.id) {
        const selectedChannelId = i.values[0];
        const baekjoonId = tempUserIds.get(i.user.id);

        if (!baekjoonId) {
          await i.update({ content: '오류가 발생했습니다. 다시 시도해주세요.', components: [] });
          return;
        }

        // 사용자 ID와 채널 ID 저장
        userMap.set(i.user.id, {
          baekjoonId,
          channelId: selectedChannelId,
        });

        // 임시 저장된 사용자 ID 삭제
        tempUserIds.delete(i.user.id);

        await i.update({
          content: `백준 온라인 저지 사용자 ID가 ${baekjoonId}로 설정되었습니다.\n알림은 <#${selectedChannelId}> 채널로 전송됩니다.`,
          components: [],
        });
      }
    });

    collector?.on('end', () => {
      // 타임아웃 시 임시 저장된 사용자 ID 삭제
      tempUserIds.delete(interaction.user.id);
    });
  },
};

export default command;
export { userMap };
