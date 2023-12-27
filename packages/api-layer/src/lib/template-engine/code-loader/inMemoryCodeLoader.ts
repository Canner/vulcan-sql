import * as nunjucks from 'nunjucks';
import {
  CodeLoader,
  VulcanExtensionId,
  VulcanInternalExtension,
} from '@vulcan-sql/api-layer/models';

@VulcanInternalExtension()
@VulcanExtensionId('InMemory')
export class InMemoryCodeLoader extends CodeLoader {
  private source = new Map<string, object>();

  public setSource(name: string, code: string) {
    this.source.set(name, eval(code));
  }

  public getSource(name: string): nunjucks.LoaderSource | null {
    if (!this.source.has(name)) return null;

    return {
      src: {
        type: 'code',
        // We've checked the map and ensured that the key exists
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        obj: this.source.get(name)!,
      },
      path: name,
      noCache: true,
    };
  }
}
