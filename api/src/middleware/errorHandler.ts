import type { Context } from 'koa';
import { z } from 'zod';

interface DatabaseError {
  code: string;
  message?: string;
}

export const errorHandler = async (ctx: Context, next: () => Promise<void>): Promise<void> => {
  try {
    await next();
  } catch (error: unknown) {
    console.error('Error:', error);

    // Database errors (duck typing for Prisma errors)
    if (error && typeof error === 'object' && 'code' in error) {
      const code = (error as { code: string }).code;
      switch (code) {
        case 'P2002':
          ctx.status = 409;
          ctx.body = {
            success: false,
            error: 'Conflict',
            message: 'El recurso ya existe (violación de constraint único)'
          };
          return;
        case 'P2025':
          ctx.status = 404;
          ctx.body = {
            success: false,
            error: 'Not Found',
            message: 'Recurso no encontrado'
          };
          return;
        default:
          ctx.status = 500;
          ctx.body = {
            success: false,
            error: 'Database Error',
            message: 'Error interno de base de datos'
          };
          return;
      }
    }

    // Validation errors
    if (error instanceof z.ZodError) {
      const zodError = error as { errors: Array<{ path: string[] | string; message: string }> };
      ctx.status = 400;
      ctx.body = {
        success: false,
        error: 'Validation Error',
        message: 'Datos de entrada inválidos',
        details: zodError.errors.map((err) => ({
          field: Array.isArray(err.path) ? err.path.join('.') : err.path,
          message: err.message
        }))
      };
      return;
    }

    // OpenAI API errors
    if (error instanceof Error && error.message?.includes('OpenAI')) {
      ctx.status = 502;
      ctx.body = {
        success: false,
        error: 'External Service Error',
        message: 'Error en servicio de IA. Intenta nuevamente.'
      };
      return;
    }

    // Timeout errors
    if (error instanceof Error && error.message?.includes('timeout')) {
      ctx.status = 504;
      ctx.body = {
        success: false,
        error: 'Timeout',
        message: 'La operación tardó demasiado tiempo'
      };
      return;
    }

    // Default error
    ctx.status = 500;
    ctx.body = {
      success: false,
      error: 'Internal Server Error',
      message: 'Ocurrió un error inesperado'
    };
  }
};
