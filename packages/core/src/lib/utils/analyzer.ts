import * as fs from 'fs';
import * as path from 'path';
import { isEmpty } from 'lodash';

interface ConcurrentPerformanceRecord {
  [key: string]: [{ group?: string; diff?: number }];
}
let is_analysis = false;
let performanceRecord: ConcurrentPerformanceRecord = {};
let keyStatistics: Record<
  string,
  {
    min?: number;
    max?: number;
    avg?: number;
    median?: number;
    p90?: number;
  }
> = {};
/**
  * This is a performance analysis tool for concurrent tasks
  * You can use it to collect the start and end time of a task, the collected data with the same key will be summarized
  * the summarzied report contains the min, max, avg, median, p90 of the task 
  * When the code snippet is executed, the performance analysis tool will automatically collect the start and end time of the task
  * 
  * example: 
  *   const start = Date.now();
  *   await fn_to_measure()
  *   const end = Date.now();
  *   PerformanceAnalysis.collect('fn_to_measure', start, end)
  * 
  * You can choose when to summarize the performance data
  * for example, you can summarize the performance data before server closed
  * 
  *   public async close() {
      if (this.servers) {
        ... close server
      }
      PerformanceAnalysis.count();
    }
  *
  * Note: If you want to view the performance by each API call, you can use k6 or you can specify the group name when collecting the performance data
  *       and implement another count & writePerformanceReport funtion to summarize the performance data by group name
  * 
  */
export class PerformanceAnalysis {
  public static collect(
    key: string,
    start: number,
    end: number,
    group?: string
  ) {
    if (!start || !end) {
      throw new Error(
        `should provide start and end time when doing performance analysis task "${key}"`
      );
    }
    if (!performanceRecord[key]) {
      performanceRecord[key] = [] as any;
    }
    const diff = end - start;
    performanceRecord[key].push({ group, diff });
    if (process.env['PRINT_COLLECTION']) {
      console.log(
        `${key}: collected, start: ${start}, end: ${end}, diff: ${diff}`
      );
    }
  }

  public static count(): boolean {
    // sort by time diff
    if (isEmpty(performanceRecord)) {
      console.log('performanceRecord is empty');
      return false;
    }
    Object.values(performanceRecord).map((records) => {
      records.sort((a, b) => {
        return <number>a.diff - <number>b.diff;
      });
    });
    // count statistics
    Object.entries(performanceRecord).map(([key, records]) => {
      const count = records.length;
      const min = records[0].diff;
      const max = records[count - 1].diff;
      const avg =
        records.reduce((acc, cur) => {
          return acc + <number>cur.diff;
        }, 0) / count;
      const median = records[Math.floor(count / 2)].diff;
      const p90 = records[Math.floor(count * 0.9)].diff;
      keyStatistics[key] = { min, max, avg, median, p90 };
    });
    return true;
  }

  public static getStatistic(key: string): any {
    return keyStatistics[key];
  }

  public static clean = () => {
    performanceRecord = {};
    keyStatistics = {};
  };

  // write to txt file
  public static writePerformanceReport() {
    const filePath = path.join('./performanceRecord.txt');
    // print current date, time as humun readable format
    fs.appendFileSync(filePath, `------${new Date().toLocaleString()}\n`);
    for (const key of Object.keys(keyStatistics)) {
      fs.appendFileSync(filePath, `${key}\n`);
      let staticLine = '';
      if (keyStatistics[key]) {
        const statics = keyStatistics[key];
        Object.entries(statics).map(([k, v]) => {
          staticLine += `${k}: ${v}, `;
        });
        fs.appendFileSync(filePath, `${staticLine}\n`);
      }
    }
    fs.appendFileSync(filePath, `------\n`);
  }
}

export function getAnalysis() {
  const counted = PerformanceAnalysis.count();
  if (counted && !is_analysis) {
    PerformanceAnalysis.writePerformanceReport();
    console.log(
      'performance analysis finished, check the performanceRecord.txt file for details'
    );
    is_analysis = true;
  }
}
