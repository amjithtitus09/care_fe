export class ResponseError extends Error {
  name: string;
  message: string;
  cause: ErrorCause;

  constructor({
    name,
    message,
    cause,
  }: {
    name: string;
    message: string;
    cause: ErrorCause;
  }) {
    super(message);
    this.name = name;
    this.message = message;
    this.cause = cause;
  }
}

export interface ErrorCause {
  code: string;
  status: number;
  silent: boolean | false;
  detail: string;
}
