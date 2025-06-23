import { HttpException, HttpStatus } from '@nestjs/common';

interface IErrorResponse extends Error {
  errorCode: string;
}

export class ErrorResponse extends HttpException {
  constructor(error?: IErrorResponse) {
    super(error || '', HttpStatus.BAD_REQUEST);

    this.errorCode = error.errorCode;
  }

  errorCode: string;
}
