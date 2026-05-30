import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Request } from 'express';
import { Observable, tap } from 'rxjs';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('AuditLog');

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<Request>();
    const { method, url, ip } = request;

    const user = (request as { user?: { userId?: string } }).user;
    const userId = user?.userId ?? 'anonymous';

    const startTime = Date.now();

    return next.handle().pipe(
      tap({
        next: () => {
          const duration = Date.now() - startTime;
          this.logger.log(
            `${method} ${url} | user=${userId} ip=${ip} | ${duration}ms`,
          );
        },
        error: (err: unknown) => {
          const duration = Date.now() - startTime;
          const status =
            err instanceof Error && 'status' in err
              ? (err as { status: number }).status
              : 500;
          this.logger.warn(
            `${method} ${url} | user=${userId} ip=${ip} | ${duration}ms | error=${status}`,
          );
        },
      }),
    );
  }
}
