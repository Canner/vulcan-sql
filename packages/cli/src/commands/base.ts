import { Logger } from 'tslog';

export abstract class Command<O = any> {
  constructor(protected logger: Logger) {}

  abstract handle(options: O): Promise<void>;
}
