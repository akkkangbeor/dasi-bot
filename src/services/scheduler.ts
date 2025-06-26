import { Client, TextChannel } from 'discord.js';
import { DateTime } from 'luxon';
import { userMap } from '../commands/setuser';
import { execute as remindExecute } from '../commands/remind';

export class Scheduler {
  private static client: Client;

  public static initialize(client: Client) {
    this.client = client;
    this.scheduleDailyReminder();
  }

  private static scheduleDailyReminder() {
    const now = DateTime.now();
    const nextRun = now.set({ hour: 9, minute: 0, second: 0, millisecond: 0 });

    // 이미 오늘 9시가 지났다면 다음날로 설정
    if (now > nextRun) {
      nextRun.plus({ days: 1 });
    }

    const delay = nextRun.diff(now).as('milliseconds');

    setTimeout(() => {
      this.runReminder();
      // 다음날 9시에 실행되도록 재귀적으로 스케줄링
      this.scheduleDailyReminder();
    }, delay);
  }

  private static async runReminder() {
    // 저장된 모든 사용자에 대해 remind 명령어 실행
    for (const [discordUserId, userData] of userMap.entries()) {
      try {
        const user = await this.client.users.fetch(discordUserId);
        if (!user) continue;

        const channel = (await this.client.channels.fetch(userData.channelId)) as TextChannel;
        if (!channel) {
          console.error(`채널 ${userData.channelId}를 찾을 수 없습니다.`);
          continue;
        }

        // 가상의 interaction 객체 생성
        const interaction = {
          options: {
            get: () => ({ value: userData.baekjoonId }),
          },
          user,
          channel,
          deferReply: async () => {},
          editReply: async (content: any) => {
            await channel.send(content);
          },
        } as any;

        await remindExecute(interaction);
      } catch (error) {
        console.error(`사용자 ${discordUserId}에 대한 remind 실행 중 오류:`, error);
      }
    }
  }
}
