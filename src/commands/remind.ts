import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction } from 'discord.js';
import { BaekjoonService } from '../services/baekjoon';

export const data = new SlashCommandBuilder()
  .setName('remind')
  .setDescription('백준 온라인 저지 사용자의 일주일 전 제출 기록을 보여줍니다.')
  .addStringOption((option) =>
    option.setName('user_id').setDescription('백준 온라인 저지 사용자 ID').setRequired(true),
  );

export async function execute(interaction: CommandInteraction) {
  await interaction.deferReply();

  const userId = interaction.options.get('user_id')?.value as string;
  if (!userId) {
    await interaction.editReply('사용자 ID를 입력해주세요.');
    return;
  }

  try {
    const stats = await BaekjoonService.getUserSubmissions(userId);

    if (Object.keys(stats).length === 0) {
      await interaction.editReply('일주일 전 제출 기록이 없습니다.');
      return;
    }

    let message = `**${userId}** 님의 일주일 전 제출 기록입니다:\n\n`;

    for (const [problemId, results] of Object.entries(stats)) {
      message += `**문제 ${problemId}**\n`;
      for (const [result, count] of Object.entries(results)) {
        message += `- ${result}: ${count}회\n`;
      }
      message += '\n';
    }

    await interaction.editReply(message);
  } catch (error) {
    console.error('Error fetching submissions:', error);
    await interaction.editReply('제출 기록을 가져오는 중 오류가 발생했습니다.');
  }
}
