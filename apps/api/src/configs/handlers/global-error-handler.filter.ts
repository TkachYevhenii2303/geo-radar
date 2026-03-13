import {
  Catch,
  ExceptionFilter,
  ArgumentsHost,
  HttpStatus,
} from '@nestjs/common';
import { Logger } from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class GlobalErrorHandlerFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalErrorHandlerFilter.name);

  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    this.logger.error(`The request has failed with error: ${exception}`);
    if (exception?.response) {
      const status =
        exception.response.status ||
        exception.response?.statusCode ||
        HttpStatus.INTERNAL_SERVER_ERROR;

      const message = exception.response?.message ?? 'Internal server error';
      return response.status(status).json({
        statusCode: status,
        message,
      });
    }

    return response
      .json({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: exception.message ?? 'Internal server error',
      })
      .status(HttpStatus.INTERNAL_SERVER_ERROR);
  }
}
