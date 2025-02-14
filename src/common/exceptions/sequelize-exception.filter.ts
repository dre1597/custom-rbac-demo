import {
  ArgumentsHost,
  Catch,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { apiConfig } from '../../config/custom-config';

@Injectable()
@Catch()
export class SequelizeExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const context = host.switchToHttp();
    const response = context.getResponse();

    if (apiConfig().nodeEnv === 'development') {
      console.error(exception);
    }

    if (exception.name === 'SequelizeUniqueConstraintError') {
      return response.status(HttpStatus.BAD_REQUEST).json({
        statusCode: HttpStatus.CONFLICT,
        message: 'Unique constraint failed',
        errors: exception.errors.map((err: any) => ({
          field: err.path,
          message: `The value '${err.value}' already exists for field: '${err.path}'.`,
        })),
      });
    }

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      return response.status(status).json({
        // @ts-expect-error type problem
        error: exception.getResponse().error,
        statusCode: status,
        message: exception.message,
      });
    }

    return response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Internal server error',
      error: exception.error,
    });
  }
}
