import { logger } from './logger';

type JobBeforeShutdown = () => Promise<void>;

const shutdownJobs: JobBeforeShutdown[] = [];

export const addShutdownJob = (job: JobBeforeShutdown) => {
  shutdownJobs.push(job);
};

export const runShutdownJobs = async () => {
  logger.info('Ctrl-C signal caught, stopping services...');
  await Promise.all(shutdownJobs.map((job) => job()));
  logger.info('Bye.');
};

process.on('SIGINT', async () => {
  await runShutdownJobs();
  process.exit(0);
});
