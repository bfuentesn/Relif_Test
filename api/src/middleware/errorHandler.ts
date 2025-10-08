/**
 * Middleware para manejo centralizado de errores
 * Procesa diferentes tipos de errores y devuelve respuestas apropiadas
 */
import type { Context } from 'koa';
import { HTTP_STATUS, ERROR_MESSAGES } from '../utils/constants';
import type { ErrorResponse } from '../types';

// Declaración de tipo para ZodError
interface ZodError {
  errors: Array<{
    path: string[] | string;
    message: string;
    received?: unknown;
  }>;
}

/**
 * Interface para errores de base de datos (Prisma)
 */
interface DatabaseError {
  code: string;
  message?: string;
  meta?: Record<string, unknown>;
}

/**
 * Interface para errores de validación con detalles
 */
interface ValidationErrorDetail {
  field: string;
  message: string;
  received?: unknown;
}

/**
 * Mapeo de códigos de error de Prisma a mensajes amigables
 */
const PRISMA_ERROR_CODES = {
  P2002: 'El recurso ya existe (violación de constraint único)',
  P2025: 'Recurso no encontrado',
  P2003: 'Violación de constraint de clave foránea',
  P2014: 'El cambio violaría una restricción de relación',
  P2021: 'La tabla no existe en la base de datos',
  P2022: 'La columna no existe en la base de datos',
} as const;

/**
 * Maneja errores de base de datos (Prisma)
 */
function handleDatabaseError(ctx: Context, error: DatabaseError): void {
  const { code } = error;
  
  switch (code) {
    case 'P2002':
      ctx.status = HTTP_STATUS.CONFLICT;
      break;
    case 'P2025':
      ctx.status = HTTP_STATUS.NOT_FOUND;
      break;
    case 'P2003':
    case 'P2014':
      ctx.status = HTTP_STATUS.BAD_REQUEST;
      break;
    default:
      ctx.status = HTTP_STATUS.INTERNAL_SERVER_ERROR;
  }

  ctx.body = {
    success: false,
    error: 'Database Error',
    message: PRISMA_ERROR_CODES[code as keyof typeof PRISMA_ERROR_CODES] || ERROR_MESSAGES.DATABASE_ERROR,
    ...(process.env.NODE_ENV === 'development' && { details: error.meta })
  } satisfies ErrorResponse;
}

/**
 * Maneja errores de validación (Zod)
 */
function handleValidationError(ctx: Context, error: ZodError): void {
  const details: ValidationErrorDetail[] = error.errors.map((err: any) => ({
    field: Array.isArray(err.path) ? err.path.join('.') : String(err.path),
    message: err.message,
    ...(process.env.NODE_ENV === 'development' && { received: err.received })
  }));

  ctx.status = HTTP_STATUS.BAD_REQUEST;
  ctx.body = {
    success: false,
    error: 'Validation Error',
    message: ERROR_MESSAGES.VALIDATION_ERROR,
    details
  } satisfies ErrorResponse;
}

/**
 * Maneja errores de servicios externos (OpenAI, etc.)
 */
function handleExternalServiceError(ctx: Context, error: Error): void {
  ctx.status = 502;
  ctx.body = {
    success: false,
    error: 'External Service Error',
    message: 'Error en servicio externo. Intenta nuevamente.',
    ...(process.env.NODE_ENV === 'development' && { details: error.message })
  } satisfies ErrorResponse;
}

/**
 * Maneja errores de timeout
 */
function handleTimeoutError(ctx: Context): void {
  ctx.status = 504;
  ctx.body = {
    success: false,
    error: 'Timeout',
    message: 'La operación tardó demasiado tiempo'
  } satisfies ErrorResponse;
}

/**
 * Maneja errores por defecto
 */
function handleDefaultError(ctx: Context, error: unknown): void {
  ctx.status = HTTP_STATUS.INTERNAL_SERVER_ERROR;
  ctx.body = {
    success: false,
    error: 'Internal Server Error',
    message: ERROR_MESSAGES.INTERNAL_ERROR,
    ...(process.env.NODE_ENV === 'development' && { 
      details: error instanceof Error ? error.message : 'Unknown error' 
    })
  } satisfies ErrorResponse;
}

/**
 * Middleware principal de manejo de errores
 */
export const errorHandler = async (ctx: Context, next: () => Promise<void>): Promise<void> => {
  try {
    await next();
  } catch (error: unknown) {
    // Log del error para debugging
    console.error(`❌ Error in ${ctx.method} ${ctx.url}:`, error);

    // Manejo específico según el tipo de error
    if (error && typeof error === 'object' && 'code' in error) {
      handleDatabaseError(ctx, error as DatabaseError);
    } else if (error && typeof error === 'object' && 'errors' in error && Array.isArray((error as any).errors)) {
      handleValidationError(ctx, error as ZodError);
    } else if (error instanceof Error && error.message?.includes('OpenAI')) {
      handleExternalServiceError(ctx, error);
    } else if (error instanceof Error && error.message?.includes('timeout')) {
      handleTimeoutError(ctx);
    } else {
      handleDefaultError(ctx, error);
    }
  }
};
