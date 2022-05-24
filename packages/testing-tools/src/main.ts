import {
  Container,
  NunjucksCompiler,
  PersistentStoreType,
  SerializerType,
  TemplateProviderType,
  TYPES,
} from '@vulcan/core';
import * as nunjucks from 'nunjucks';
import * as prettier from 'prettier';
import * as fs from 'fs';
import * as path from 'path';

const template = `
{% if ((builder + builder) | unique) is 1 %}
{% endif %}
`;

const container = new Container();
container.load({
  artifact: {
    provider: PersistentStoreType.LocalFile,
    serializer: SerializerType.JSON,
    filePath: '',
  },
  template: {
    provider: TemplateProviderType.LocalFile,
    templatePath: '',
  },
});

const compiler = container.get<NunjucksCompiler>(TYPES.Compiler);

const { ast } = compiler.generateAst(template);

const compilerToMermaid = (ast: nunjucks.nodes.Node) => {
  let output = '';
  const append = (str: string, indent = 0) => {
    output += ' '.repeat(indent) + str + '\n';
  };
  append('graph LR');

  let nodeIndex = 0;

  const bindId = (node: nunjucks.nodes.Node) => {
    (node as any).id = nodeIndex;
    return nodeIndex++;
  };
  bindId(ast);

  const walkAst = (root: nunjucks.nodes.Node): void => {
    const nodeId = (root as any).id;
    append(`${nodeId}[${root.typename}]`, 4);

    if (root instanceof nunjucks.nodes.NodeList) {
      root.children.forEach((node, index) => {
        const id = bindId(node);
        append(`${nodeId} --"children[${index}]"--> ${id}`, 4);
        walkAst(node);
      });
    } else if (root instanceof nunjucks.nodes.CallExtension) {
      const valueId = nodeIndex++;
      append(`${valueId}{{${root.extName}}}`, 4);
      append(`${nodeId} --extName--> ${valueId}`, 4);
      if (root.args) {
        const id = bindId(root.args);
        append(`${nodeId} --args--> ${id}`, 4);
        walkAst(root.args);
      }
      if (root.contentArgs) {
        root.contentArgs.forEach((n, index) => {
          const id = bindId(n);
          append(`${nodeId} --"contentArgs[${index}]"--> ${id}`, 4);
          walkAst(n);
        });
      }
    } else {
      root.iterFields((node, fieldName) => {
        if (node instanceof nunjucks.nodes.Node) {
          const id = bindId(node);
          append(`${nodeId} --${fieldName}--> ${id}`, 4);
          walkAst(node);
        } else {
          const valueId = nodeIndex++;
          append(
            `${valueId}{{"${String(node)
              .replace(/(?:\r\n|\r|\n)/g, ' ')
              .replace(/"/g, '&quot;')}"}}`,
            4
          );
          append(`${nodeId} --${fieldName}--> ${valueId}`, 4);
        }
      });
    }
  };

  walkAst(ast);

  return output;
};

fs.writeFileSync(
  path.resolve(__dirname, 'ast.md'),
  compilerToMermaid(ast),
  'utf-8'
);

const { compiledData } = compiler.compile(template);

fs.writeFileSync(
  path.resolve(__dirname, 'result.js'),
  prettier.format(compiledData, { parser: 'babel' }),
  'utf-8'
);

console.log('done');
