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
    // sort by diff
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
  // write by key
  public static writePerformanceReport() {
    const filePath = path.join('./performanceRecord.txt');
    // write by key
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
    console.log('performance analysis finished');
    console.log('check the performanceRecord.txt file for details');
    is_analysis = true;
  }
}
