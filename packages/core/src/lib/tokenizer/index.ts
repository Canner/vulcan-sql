import * as peggy from 'peggy';
import grammar from './grammar';

const parser = peggy.generate(grammar);

export const tokenize = (input: string) => parser.parse(input);
