import * as fs from 'fs';

export interface TokenStorage {
  getToken(key: string): Promise<string>;
  setToken(key: string, token: string): Promise<void>;
  delToken(key: string): Promise<void>;
}

export class FileTokenStorage implements TokenStorage {
  private tokens: Record<string, string> = {};
  private filePath = './.tokens.json';

  public getToken = async (key: string): Promise<string> => {
    this.tokens = JSON.parse(fs.readFileSync(this.filePath, 'utf-8'));
    return this.tokens[key];
  }

  public setToken = async (key: string, token: string): Promise<void> => {
    this.tokens[key] = token;
    this.writeFile();
  }

  public delToken = async (key: string): Promise<void> => {
    delete this.tokens[key];
    this.writeFile();
  }

  private writeFile = async () => {
    fs.writeFileSync(this.filePath, JSON.stringify(this.tokens));
  }
}
