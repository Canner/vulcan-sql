declare module 'apache-md5' {
  declare function apacheMd5(password: string, salt?: string): string;

  export default apacheMd5;
}
