import { BuildCommandOptions, handleBuild } from './build';
import { handleServe, ServeCommandOptions } from './serve';

export const handleStart = async (
  options: Partial<BuildCommandOptions & ServeCommandOptions>
): Promise<void> => {
  await handleBuild(options);
  await handleServe(options);
};
