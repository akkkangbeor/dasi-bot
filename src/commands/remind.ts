import { SlashCommandBuilder } from '@discordjs/builders';
import axios from 'axios';
import * as cheerio from 'cheerio';
import {
  ActionRowBuilder,
  CommandInteraction,
  EmbedBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuInteraction,
  StringSelectMenuOptionBuilder,
} from 'discord.js';
import { BaekjoonService } from '../services/baekjoon';

// 문제 제목을 가져오는 함수
async function getProblemTitle(problemId: string): Promise<string> {
  try {
    const response = await axios.get(`https://www.acmicpc.net/problem/${problemId}`, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      },
    });
    const $ = cheerio.load(response.data);
    const title = $('#problem_title').text().trim();
    return title || `문제 ${problemId}`;
  } catch (error) {
    console.error(`Error fetching problem title for ${problemId}:`, error);
    return `문제 ${problemId}`;
  }
}

export const data = new SlashCommandBuilder()
  .setName('remind')
  .setDescription('백준 온라인 저지 사용자의 일주일 전 제출 기록을 보여줍니다.')
  .addStringOption((option) =>
    option.setName('user_id').setDescription('백준 온라인 저지 사용자 ID').setRequired(true),
  ) as SlashCommandBuilder;

export async function execute(interaction: CommandInteraction) {
  await interaction.deferReply();

  const userId = interaction.options.get('user_id')?.value as string;
  if (!userId) {
    await interaction.editReply('사용자 ID를 입력해주세요.');
    return;
  }

  try {
    const stats = await BaekjoonService.getUserSubmissions(userId);
    const problemSummary = BaekjoonService.calculateProblemSummary(stats);

    if (Object.keys(stats).length === 0) {
      await interaction.editReply('일주일 전 제출 기록이 없습니다.');
      return;
    }

    // 문제 제목 가져오기
    const problemTitles = await Promise.all(
      Object.keys(stats).map(async (problemId) => {
        const title = await getProblemTitle(problemId);
        const problemResults = stats[problemId];

        // 문제 상태 확인
        const hasSolved = Object.entries(problemResults).some(
          ([result, count]) => result.includes('맞았습니다') && count > 0,
        );
        const hasFailed = Object.entries(problemResults).some(
          ([result, count]) => result.includes('틀렸습니다') && count > 0,
        );

        let status = '';
        if (hasSolved) {
          status = '✅';
        } else if (hasFailed) {
          status = '❌';
        } else {
          status = '⏳';
        }

        return { problemId, title, status };
      }),
    );

    // 문제 목록을 위한 Select Menu 생성
    const selectMenu = new StringSelectMenuBuilder()
      .setCustomId('problem-select')
      .setPlaceholder('문제를 선택하세요')
      .addOptions(
        problemTitles.map(({ problemId, title, status }) =>
          new StringSelectMenuOptionBuilder()
            .setLabel(`${status} ${problemId}. ${title}`)
            .setDescription(`문제 ${problemId}의 제출 기록`)
            .setValue(problemId),
        ),
      );

    const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(selectMenu);

    // 초기 임베드 생성
    const initialEmbed = new EmbedBuilder()
      .setColor(0x0099ff)
      .setTitle(`${userId} 님의 일주일 전 제출 기록`)
      .setDescription(
        `**총 ${problemSummary.totalProblems}개의 문제를 시도했습니다.**\n\n` +
          `✅ 맞은 문제: ${problemSummary.solvedProblems}개\n` +
          `❌ 틀린 문제: ${problemSummary.failedProblems}개\n` +
          `⏳ 부분 점수: ${problemSummary.partialProblems}개\n\n` +
          '아래 메뉴에서 문제를 선택하세요.',
      );

    const message = await interaction.editReply({
      embeds: [initialEmbed],
      components: [row],
    });

    // Select Menu 이벤트 리스너
    const collector = message.createMessageComponentCollector({
      time: 60000,
    });

    collector.on('collect', async (i: StringSelectMenuInteraction) => {
      if (i.customId === 'problem-select') {
        const problemId = i.values[0];
        const results = stats[problemId];
        const problemTitle = problemTitles.find((p) => p.problemId === problemId)?.title;

        // 문제별 임베드 생성
        const problemEmbed = new EmbedBuilder()
          .setColor(0x0099ff)
          .setTitle(`${problemId}. ${problemTitle}`)
          .setURL(`https://www.acmicpc.net/problem/${problemId}`)
          .setDescription(
            Object.entries(results)
              .map(([result, count]) => {
                return `**${result}**: ${count}회`;
              })
              .join('\n'),
          )
          .setFooter({ text: '다른 문제를 선택하려면 아래 메뉴를 사용하세요.' });

        await i.update({
          embeds: [problemEmbed],
          components: [row],
        });
      }
    });

    collector.on('end', () => {
      const disabledRow = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
        selectMenu.setDisabled(true),
      );

      interaction.editReply({ components: [disabledRow] });
    });
  } catch (error) {
    console.error('Error fetching submissions:', error);
    await interaction.editReply('제출 기록을 가져오는 중 오류가 발생했습니다.');
  }
}
