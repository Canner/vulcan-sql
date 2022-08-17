import {
  TagRunner,
  TagRunnerOptions,
  VulcanInternalExtension,
} from '@vulcan-sql/core/models';

@VulcanInternalExtension()
export class ErrorTagRunner extends TagRunner {
  public tags = ['error'];

  public async run({ args }: TagRunnerOptions) {
    const message = args[0];
    const lineno = args[1];
    const colno = args[2];
    throw new Error(`${message} at ${lineno}:${colno}`);
  }
}
