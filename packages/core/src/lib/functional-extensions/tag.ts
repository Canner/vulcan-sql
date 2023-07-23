import {
  TagBuilder,
  TagRunner,
  TagRunnerOptions,
} from '../../models/extensions';
import { ClassType } from '../utils';
import * as nunjucks from 'nunjucks';
import { NunjucksExecutionMetadata } from '../template-engine/nunjucksExecutionMetadata';

export interface FunctionalTagOptions {
  sql: string;
  args: Record<string, any>;
  metadata: NunjucksExecutionMetadata;
  // The options from configuration for the tag extension
  options: Record<string, any> | Array<Record<string, any>>;
}

export type FunctionalTag = (options: FunctionalTagOptions) => Promise<string>;

export const createTagExtension = (
  name: string,
  functionalTag: FunctionalTag
): [ClassType<TagBuilder>, ClassType<TagRunner>] => {
  class Builder extends TagBuilder {
    public tags = [name, `end${name}`];

    public parse(parser: nunjucks.parser.Parser) {
      // SELECT {% mask len=3 %} id {% endmask %} FROM users;
      // Tokens: mask
      // consume mask tag
      parser.nextToken();
      // Tokens: len=3
      // parseSignature is a helper function to parse the arguments of tag
      // e.g. len=3 -> {len: 3}
      const argsNodeToPass = parser.parseSignature(true, true);
      // Tokens: %}
      // consume end tag token
      parser.nextToken();
      // Tokens: id {%
      // parseUntilBlocks is a helper function to parse tokens between current position to the targe blocks
      const requestQuery = parser.parseUntilBlocks(this.tags[1]);
      // Tokens: endmask %}
      // advanceAfterBlockEnd is a helper function to advance after the end block %}
      parser.advanceAfterBlockEnd();
      return this.createAsyncExtensionNode(argsNodeToPass, [requestQuery]);
    }
  }

  class Runner extends TagRunner {
    public tags: string[] = [name, `end${name}`];

    public async run({ args, contentArgs, metadata }: TagRunnerOptions) {
      // Render sqls
      const sql = (
        await Promise.all(contentArgs.map((content) => content()))
      ).join('\n');

      const result = await functionalTag({
        sql,
        args: args[0] as any,
        metadata,
        options: this.getConfig(),
      });
      return new nunjucks.runtime.SafeString(result);
    }
  }
  return [Builder, Runner];
};
