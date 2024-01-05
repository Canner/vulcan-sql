import * as peggy from 'peggy';
import grammar from './grammar';

let parser: peggy.Parser;

try {
  parser = peggy.generate(grammar);
} catch (e) {
  console.error(typeof e);
  console.error(e);
}

export const tokenize = (input: string) => parser.parse(input);

