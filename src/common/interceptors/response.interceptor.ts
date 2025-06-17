import { 
  CallHandler, 
  ExecutionContext, 
  Injectable, 
  NestInterceptor,
  HttpStatus
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Response } from 'express';

export interface ApiResponse<T> {
  success: boolean;
  statusCode: number;
  data: T;
}

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, ApiResponse<T>> {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiResponse<T>> {
    const ctx = context.switchToHttp();
    const response = ctx.getResponse<Response>();
    
    // Para endpoints que no devuelven contenido (ej. DELETE 204), no interceptar.
    if (response.statusCode === HttpStatus.NO_CONTENT) {
      return next.handle();
    }

    return next.handle().pipe(
      map((data) => ({
        success: true,
        statusCode: response.statusCode,
        data: data, // Asignar directamente la data del controlador
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
