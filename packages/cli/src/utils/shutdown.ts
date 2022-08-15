import { logger } from './logger';

type JobBeforeShutdown = () => Promise<void>;

const shutdownJobs: JobBeforeShutdown[] = [];

export const addShutdownJob = (job: JobBeforeShutdown) => {
  shutdownJobs.push(job);
};

process.on('SIGINT', async () => {
  logger.info('Ctrl-C signal caught, stopping services...');
  await Promise.all(shutdownJobs.map((job) => job()));
  logger.info('Bye.');
  process.exit(0);
});
