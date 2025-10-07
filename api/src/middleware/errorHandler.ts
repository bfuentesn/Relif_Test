import { Context, Next } from 'koa';
import { Prisma } from '@prisma/client';
import { ZodError } from 'zod';

export async function errorHandler(ctx: Context, next: Next) {
  try {
    await next();
  } catch (error) {
    console.error('Error:', error);

    // Prisma errors
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      switch (error.code) {
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

    // Zod validation errors
    if (error instanceof ZodError) {
      ctx.status = 400;
      ctx.body = {
        success: false,
        error: 'Validation Error',
        message: 'Datos de entrada inválidos',
        details: error.errors.map(err => ({
          field: err.path.join('.'),
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

    // Generic error
    ctx.status = ctx.status || 500;
    ctx.body = {
      success: false,
      error: 'Internal Server Error',
      message: process.env.NODE_ENV === 'development' 
        ? (error instanceof Error ? error.message : 'Error desconocido')
        : 'Error interno del servidor'
    };
  }
}
