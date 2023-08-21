import { PerformanceAnalysis, getAnalysis } from '../src/lib/utils/analyzer';
import * as fs from 'fs';

async function waitOneSec(): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, 1000);
  });
}

async function collect(key: string): Promise<void> {
  const t1 = new Date().getTime();
  await waitOneSec();
  const t2 = new Date().getTime();
  PerformanceAnalysis.collect(key, t1, t2);
}

describe('Performance Analysis', () => {
  beforeEach(() => {
    PerformanceAnalysis.clean();
    if (fs.existsSync('performanceRecord.txt')) {
      fs.unlinkSync('performanceRecord.txt');
    }
  });
  afterEach(() => {
    PerformanceAnalysis.clean();
    if (fs.existsSync('performanceRecord.txt')) {
      fs.unlinkSync('performanceRecord.txt');
    }
  });
  it('should collect performance data', async () => {
    await collect('waitOneSec');
    expect(PerformanceAnalysis.count()).toBeTruthy();
  });
  it('should write performance data to file', async () => {
    await collect('waitOneSec');
    await collect('waitAnotherSec');
    PerformanceAnalysis.count();
    getAnalysis();
    expect(fs.existsSync('performanceRecord.txt')).toBeTruthy();
    // expect file have two lines
    const data = fs.readFileSync('performanceRecord.txt', 'utf8');
    const lines = data.split('\n').filter((line) => line !== '');
    expect(lines.length).toBe(6);
  });
});
