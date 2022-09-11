
export class HttpError extends Error {
  public code: string;
  public status: number;

  constructor(code: string, status: number) {
    super(code);
    this.code = code;
    this.status = status;
  }
}

export const errorCode = {
  LOGIN_FAILED: new HttpError('LOGIN_FAILED', 401),
  UNAUTHORIZED_REQUEST: new HttpError('UNAUTHORIZED_REQUEST', 401),
};
