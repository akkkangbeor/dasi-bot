import axios from 'axios';
import * as cheerio from 'cheerio';
import { DateTime } from 'luxon';

interface Submission {
  problemId: string;
  result: string;
  timestamp: string;
}

interface ProblemStats {
  [problemId: string]: {
    [result: string]: number;
  };
}

export class BaekjoonService {
  private static readonly BASE_URL = 'https://www.acmicpc.net';
  private static readonly SUBMISSION_URL = `${BaekjoonService.BASE_URL}/status`;

  private static readonly headers = {
    'User-Agent':
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'Accept-Language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7',
    'Cache-Control': 'no-cache',
    Pragma: 'no-cache',
    'Upgrade-Insecure-Requests': '1',
  };

  public static async getUserSubmissions(userId: string): Promise<ProblemStats> {
    const stats: ProblemStats = {};
    let currentPage = 1;
    let hasMorePages = true;
    let top = '';

    while (hasMorePages) {
      try {
        const url = top
          ? `${BaekjoonService.SUBMISSION_URL}?user_id=${userId}&top=${top}`
          : `${BaekjoonService.SUBMISSION_URL}?user_id=${userId}`;
        console.log(`Fetching page ${currentPage}: ${url}`);

        const response = await axios.get(url, {
          headers: this.headers,
          timeout: 10000, // 10초 타임아웃 설정
        });

        const $ = cheerio.load(response.data);
        const submissions: Submission[] = [];

        // 테이블의 각 행을 파싱
        $('#status-table tbody tr').each((_, element) => {
          const timestampElement = $(element).find('td:nth-child(9)');
          const timestamp =
            timestampElement.find('a').attr('title') || timestampElement.text().trim();

          if (!timestamp) {
            console.log('Timestamp not found in row');
            return;
          }

          const submissionDate = DateTime.fromFormat(timestamp, 'yyyy-MM-dd HH:mm:ss');
          const sevenDaysAgo = DateTime.now().minus({ days: 7 });

          console.log(
            `Found submission at ${timestamp}, comparing with ${sevenDaysAgo.toFormat('yyyy-MM-dd HH:mm:ss')}`,
          );

          if (submissionDate < sevenDaysAgo) {
            console.log('Submission is older than 7 days, stopping');
            hasMorePages = false;
            return false;
          }

          const problemId = $(element).find('td:nth-child(3) a').text().trim();
          const result = $(element).find('td:nth-child(4) span').text().trim();

          console.log(`Found submission: Problem ${problemId}, Result: ${result}`);

          submissions.push({
            problemId,
            result,
            timestamp,
          });
        });

        console.log(`Found ${submissions.length} submissions on page ${currentPage}`);

        // 통계 업데이트
        submissions.forEach((submission) => {
          if (!stats[submission.problemId]) {
            stats[submission.problemId] = {};
          }
          if (!stats[submission.problemId][submission.result]) {
            stats[submission.problemId][submission.result] = 0;
          }
          stats[submission.problemId][submission.result]++;
        });

        // 다음 페이지 확인
        const nextPageLink = $('#next_page');
        if (!nextPageLink.length) {
          console.log('No more pages to fetch');
          hasMorePages = false;
        } else {
          const nextPageHref = nextPageLink.attr('href');
          if (!nextPageHref) {
            console.log('No next page link found');
            hasMorePages = false;
          } else {
            const urlParams = new URLSearchParams(nextPageHref.split('?')[1]);
            const topParam = urlParams.get('top');
            if (!topParam) {
              console.log('No top parameter found in next page link');
              hasMorePages = false;
            } else {
              console.log('Moving to next page');
              top = topParam;
              currentPage++;
            }
          }
        }

        // 요청 간 딜레이 추가
        await new Promise((resolve) => setTimeout(resolve, 1000));
      } catch (error) {
        console.error(`페이지 ${currentPage} 가져오기 실패:`, error);
        throw new Error('백준 온라인 저지 서버에 접근할 수 없습니다.');
      }
    }

    console.log('Final stats:', stats);
    return stats;
  }
}
