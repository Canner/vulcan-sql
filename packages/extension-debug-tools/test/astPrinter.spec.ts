import { getTestCompiler } from '@vulcan-sql/test-utility';
import * as path from 'path';
import { promises as fs } from 'fs';

it('Printer should generate mermaid for each AST tree', async () => {
  // Arrange
  const { compileAndLoad } = await getTestCompiler({
    extensions: { debug: path.join(__dirname, '..', 'src') },
    debug: {
      'debug-folder': path.resolve(__dirname, '.vulcan-debug'),
    },
  });
  // Act
  await compileAndLoad(`a`);
  await compileAndLoad(`{% req user %}b{{c | string}}d{% endreq %}`);
  const tree0 = await fs.readFile(
    path.resolve(__dirname, '.vulcan-debug', 'ast-0.md'),
    'utf-8'
  );
  const tree1 = await fs.readFile(
    path.resolve(__dirname, '.vulcan-debug', 'ast-1.md'),
    'utf-8'
  );
  // Assert
  expect(tree0).toBe(`graph LR
    0[Root]
    0 --"children[0]"--> 1
    1[Output]
    1 --"children[0]"--> 2
    2[TemplateData]
    3{{"a"}}
    2 --value--> 3
`);
  expect(tree1).toBe(`graph LR
    0[Root]
    0 --"children[0]"--> 1
    1[CallExtensionAsync]
    2{{req}}
    1 --extName--> 2
    1 --args--> 3
    3[NodeList]
    3 --"children[0]"--> 4
    4[Literal]
    5{{"user"}}
    4 --value--> 5
    3 --"children[1]"--> 6
    6[Literal]
    7{{"false"}}
    6 --value--> 7
    1 --"contentArgs[0]"--> 8
    8[NodeList]
    8 --"children[0]"--> 9
    9[Output]
    9 --"children[0]"--> 10
    10[TemplateData]
    11{{"b"}}
    10 --value--> 11
    8 --"children[1]"--> 12
    12[Output]
    12 --"children[0]"--> 13
    13[Filter]
    13 --name--> 14
    14[Symbol]
    15{{"string"}}
    14 --value--> 15
    13 --args--> 16
    16[NodeList]
    16 --"children[0]"--> 17
    17[Symbol]
    18{{"c"}}
    17 --value--> 18
    8 --"children[2]"--> 19
    19[Output]
    19 --"children[0]"--> 20
    20[TemplateData]
    21{{"d"}}
    20 --value--> 21
`);
});
