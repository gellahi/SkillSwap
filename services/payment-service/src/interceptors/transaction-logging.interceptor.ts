import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class TransactionLoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('TransactionInterceptor');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, body, user } = request;
    const userId = user?.id || 'anonymous';

    // Log the request
    this.logger.log(
      `[${method}] ${url} - User: ${userId} - Request: ${JSON.stringify(body)}`,
    );

    const now = Date.now();
    return next.handle().pipe(
      tap({
        next: (data) => {
          // Log the response
          this.logger.log(
            `[${method}] ${url} - User: ${userId} - Response: ${JSON.stringify(
              data,
            )} - ${Date.now() - now}ms`,
          );
        },
        error: (error) => {
          // Log the error
          this.logger.error(
            `[${method}] ${url} - User: ${userId} - Error: ${error.message} - ${
              Date.now() - now
            }ms`,
            error.stack,
          );
        },
      }),
    );
  }
}
