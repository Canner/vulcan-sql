// Copy from https://github.com/DefinitelyTyped/DefinitelyTyped, module @types/nunjucks
// We copied the definition files instead of installing it because there are lots of mismatches between definition and the package

declare module 'nunjucks' {
  export type TemplateCallback<T> = (
    err: lib.TemplateError | null,
    res: T | null
  ) => void;
  export type TemplateExportCallback<T> = (
    err: lib.TemplateError | null,
    res: T
  ) => void;
  export type Callback<E, T> = (err: E | null, res: T | null) => void;

  export function render(name: string, context?: object): string;
  export function render(
    name: string,
    context?: object,
    callback?: TemplateCallback<string>
  ): void;

  export function renderString(src: string, context: object): string;
  export function renderString(
    src: string,
    context: object,
    callback?: TemplateCallback<string>
  ): void;

  export function compile(
    src: string,
    env?: Environment,
    callback?: TemplateCallback<Template>
  ): Template;

  export function precompile(path: string, opts?: PrecompileOptions): string;
  export function precompileString(
    src: string,
    opts?: PrecompileOptions
  ): string;

  export interface PrecompileOptions {
    name?: string | undefined;
    asFunction?: boolean | undefined;
    force?: boolean | undefined;
    env?: Environment | undefined;
    include?: string[] | undefined;
    exclude?: string[] | undefined;
    wrapper?(
      templates: { name: string; template: string }[],
      opts: PrecompileOptions
    ): string;
  }

  export class Template {
    constructor(
      src: string,
      env?: Environment,
      path?: string,
      eagerCompile?: boolean
    );
    render(context?: object): string;
    render(context?: object, callback?: TemplateCallback<string>): void;
    getExported<T>(callback: TemplateExportCallback<T>): void;
    getExported<T>(
      context: object,
      callback: TemplateExportCallback<T>
    ): string;
    getExported<T>(
      context: object,
      parentFrame: any,
      callback: TemplateExportCallback<T>
    ): string;
  }

  export function configure(options: ConfigureOptions): Environment;
  export function configure(
    path: string | string[],
    options?: ConfigureOptions
  ): Environment;

  export interface ConfigureOptions {
    autoescape?: boolean | undefined;
    throwOnUndefined?: boolean | undefined;
    trimBlocks?: boolean | undefined;
    lstripBlocks?: boolean | undefined;
    watch?: boolean | undefined;
    noCache?: boolean | undefined;
    web?:
      | {
          useCache?: boolean | undefined;
          async?: boolean | undefined;
        }
      | undefined;
    express?: object | undefined;
    tags?:
      | {
          blockStart?: string | undefined;
          blockEnd?: string | undefined;
          variableStart?: string | undefined;
          variableEnd?: string | undefined;
          commentStart?: string | undefined;
          commentEnd?: string | undefined;
        }
      | undefined;
  }

  export class Environment {
    options: {
      autoescape: boolean;
    };
    opts: any;
    extensionsList: Extension[];
    asyncFilters: string[];

    constructor(loader?: ILoader | ILoader[] | null, opts?: ConfigureOptions);
    render(name: string, context?: object): string;
    render(
      name: string,
      context?: object,
      callback?: TemplateCallback<string>
    ): void;

    renderString(name: string, context: object): string;
    renderString(
      name: string,
      context: object,
      callback?: TemplateCallback<string>
    ): void;

    addFilter(
      name: string,
      func: (...args: any[]) => any,
      async?: boolean
    ): Environment;
    getFilter(name: string): (...args: any[]) => any;

    addExtension(name: string, ext: Extension): Environment;
    removeExtension(name: string): void;
    getExtension(name: string): Extension;
    hasExtension(name: string): boolean;

    addGlobal(name: string, value: any): Environment;
    getGlobal(name: string): any;

    getTemplate(name: string, eagerCompile?: boolean): Template;
    getTemplate(
      name: string,
      eagerCompile?: boolean,
      callback?: Callback<Error, Template>
    ): void;

    express(app: object): void;

    on(
      event: 'load',
      fn: (
        name: string,
        source: { src: string; path: string; noCache: boolean },
        loader: Loader
      ) => void
    ): void;
  }

  export interface Extension {
    tags: string[];
    // Parser API is undocumented it is suggested to check the source: https://github.com/mozilla/nunjucks/blob/master/src/parser.js
    parse?(parser: any, nodes: any, lexer: any): any;
  }

  export function installJinjaCompat(): void;

  export interface ILoader {
    async?: boolean | undefined;
    getSource(name: string): LoaderSource | null;
    getSource(
      name: string,
      callback: Callback<Error, LoaderSource | null>
    ): void;
  }

  // Needs both Loader and ILoader since nunjucks uses a custom object system
  // Object system is also responsible for the extend methods
  export class Loader {
    on(name: string, func: (...args: any[]) => any): void;
    emit(name: string, ...args: any[]): void;
    resolve(from: string, to: string): string;
    isRelative(filename: string): boolean;
    static extend<LoaderClass extends typeof Loader>(
      this: LoaderClass,
      toExtend: ILoader
    ): LoaderClass;
  }

  export interface LoadSourceSrc {
    type: 'code' | 'string';
    obj: object | string;
  }

  export interface LoaderSource {
    src: string | LoadSourceSrc;
    path: string;
    noCache: boolean;
  }

  export interface LoaderOptions {
    /** if true, the system will automatically update templates when they are changed on the filesystem */
    watch?: boolean;

    /**  if true, the system will avoid using a cache and templates will be recompiled every single time */
    noCache?: boolean;
  }

  export type FileSystemLoaderOptions = LoaderOptions;
  export type NodeResolveLoaderOptions = LoaderOptions;

  export class FileSystemLoader extends Loader implements ILoader {
    constructor(
      searchPaths?: string | string[],
      opts?: FileSystemLoaderOptions
    );
    getSource(name: string): LoaderSource;
  }

  export class NodeResolveLoader extends Loader implements ILoader {
    constructor(
      searchPaths?: string | string[],
      opts?: NodeResolveLoaderOptions
    );
    getSource(name: string): LoaderSource;
  }

  export interface WebLoaderOptions {
    useCache?: boolean;
    async?: boolean;
  }

  export class WebLoader extends Loader implements ILoader {
    constructor(baseUrl?: string, opts?: WebLoaderOptions);
    getSource(name: string): LoaderSource;
  }

  export class PrecompiledLoader extends Loader implements ILoader {
    constructor(compiledTemplates?: any[]);
    getSource(name: string): LoaderSource;
  }

  export namespace runtime {
    class SafeString {
      constructor(val: string);
      val: string;
      length: number;
      valueOf(): string;
      toString(): string;
    }
  }

  export namespace lib {
    class TemplateError extends Error {
      constructor(message: string, lineno: number, colno: number);

      name: string; // always 'Template render error'
      message: string;
      stack: string;

      cause?: Error | undefined;
      lineno: number;
      colno: number;
    }
  }

  export namespace compiler {
    class Compiler {
      constructor(name: string, throwOnUndefined: boolean);
      compile(ast: any): void;
      getCode(): string;
    }
  }

  export namespace parser {
    function parse(src: string, extensions: Extension[], opts: any): any;

    class Parser {
      nextToken(withWhitespace = false): Token;
      peekToken(): Token;
      /**
       * Parse a list of arguments. e.g. (foo, bar, arg=18) ...
       * @param tolerant throw when parsing failed
       * @param noParens set true if your argument aren't enclosed in parentheses
       */
      parseSignature(
        tolerant: boolean | null,
        noParens: boolean
      ): nodes.NodeList;
      /**
       * Advance to the block end (%})
       */
      advanceAfterBlockEnd(name: string): Token;
      parseUntilBlocks(...blockName: string[]): nodes.NodeList;
      advanceAfterBlockEnd(): Token;
      fail(message: string, lineno?: number, colno?: number): void;
      parseExpression(): Nodes;
    }
  }

  export namespace nodes {
    class Node {
      constructor(lineno: number, colno: number, ...args: any[]);
      typename: string;
      iterFields(
        cb: (node: Node | NodeList | CallExtension, fieldName: string) => void
      ): void;
      lineno: number;
      colno: number;
    }

    class NodeList extends Node {
      typename: string;
      children: Node[];
      addChild(child: Node): void;
    }

    class Root extends NodeList {}

    class CallExtension extends Node {
      constructor(
        ext: object | string,
        prop: string,
        args: nodes.NodeList | null,
        contentArgs: nodes.Node[] | null
      );
      extName: string;
      args: NodeList;
      contentArgs?: (NodeList | Node)[];
    }

    class CallExtensionAsync extends CallExtension {}

    class LookupVal extends Node {
      target:
        | Symbol // a.b
        | FunCall // a().b
        | LookupVal; // a.b.c
      val: Value;
    }

    class Value extends Node {
      value: string;
    }

    class Literal extends Value {}

    class Symbol extends Value {}

    class FunCall extends Node {
      name:
        | Symbol // a()
        | LookupVal // a.b()
        | FunCall; // a().b()
      args: NodeList;
    }

    class Filter extends FunCall {}

    class Set extends Node {
      value: Node | null;
      body: Node | null;
      targets: Node[];
    }

    class TemplateData extends Literal {}
  }

  namespace lexer {
    function lexer(src: string, opts: any): any;
    const TOKEN_STRING: string;
    const TOKEN_WHITESPACE: string;
    const TOKEN_DATA: string;
    const TOKEN_BLOCK_START: string;
    const TOKEN_BLOCK_END: string;
    const TOKEN_VARIABLE_START: string;
    const TOKEN_VARIABLE_END: string;
    const TOKEN_COMMENT: string;
    const TOKEN_LEFT_PAREN: string;
    const TOKEN_RIGHT_PAREN: string;
    const TOKEN_LEFT_BRACKET: string;
    const TOKEN_RIGHT_BRACKET: string;
    const TOKEN_LEFT_CURLY: string;
    const TOKEN_RIGHT_CURLY: string;
    const TOKEN_OPERATOR: string;
    const TOKEN_COMMA: string;
    const TOKEN_COLON: string;
    const TOKEN_TILDE: string;
    const TOKEN_PIPE: string;
    const TOKEN_INT: string;
    const TOKEN_FLOAT: string;
    const TOKEN_BOOLEAN: string;
    const TOKEN_NONE: string;
    const TOKEN_SYMBOL: string;
    const TOKEN_SPECIAL: string;
    const TOKEN_REGEX: string;
  }

  interface Token {
    type: string;
    lineno: number;
    colno: number;
    value: string;
  }
}

declare module 'nunjucks/src/transformer' {
  export function transform(ast: any, filter: any);
}
