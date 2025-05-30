import { 
  CallHandler, 
  ExecutionContext, 
  Injectable, 
  NestInterceptor,
  HttpStatus
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Response<T> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T;
  timestamp: string;
  path: string;
}

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, Response<T>> {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<Response<T>> {
    const ctx = context.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();
    const statusCode = response.statusCode || HttpStatus.OK;
    
    return next.handle().pipe(
      map((data) => ({
        success: statusCode >= 200 && statusCode < 300,
        statusCode,
        message: data?.message || 'Operation completed successfully',
        data: data?.data || data || null,
        timestamp: new Date().toISOString(),
        path: request.url,
      })),
    );
  }
}

export class ErrorResponse {
  success: boolean;
  statusCode: number;
  message: string;
  error: string;
  timestamp: string;
  path: string;

  constructor(
    message: string,
    statusCode: number,
    error: string,
    path: string,
  ) {
    this.success = false;
    this.statusCode = statusCode;
    this.message = message;
    this.error = error;
    this.timestamp = new Date().toISOString();
    this.path = path;
  }
}

export function formatErrorResponse(
  message: string,
  statusCode: number,
  error: string,
  path: string,
): ErrorResponse {
  return new ErrorResponse(message, statusCode, error, path);
}
