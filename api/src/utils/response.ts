/**
 * Utilidades de respuesta HTTP
 * Funciones helper para crear respuestas consistentes en la API
 */

import type { Context } from 'koa';
import { HTTP_STATUS } from './constants';

/**
 * Formato estándar de respuesta de la API
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: string;
}

/**
 * Crea una respuesta de éxito
 * @param ctx - Contexto de Koa
 * @param data - Datos a devolver
 * @param message - Mensaje opcional
 * @param status - Código de estado HTTP (por defecto 200)
 */
export function createSuccessResponse<T>(
  ctx: Context,
  data?: T,
  message?: string,
  status: number = HTTP_STATUS.OK
): void {
  ctx.status = status;
  ctx.body = {
    success: true,
    data,
    message,
    timestamp: new Date().toISOString(),
  } as ApiResponse<T>;
}

/**
 * Crea una respuesta de error
 * @param ctx - Contexto de Koa
 * @param error - Mensaje de error
 * @param status - Código de estado HTTP (por defecto 500)
 * @param data - Datos adicionales opcionales
 */
export function createErrorResponse(
  ctx: Context,
  error: string,
  status: number = HTTP_STATUS.INTERNAL_SERVER_ERROR,
  data?: any
): void {
  ctx.status = status;
  ctx.body = {
    success: false,
    error,
    data,
    timestamp: new Date().toISOString(),
  } as ApiResponse;
}

/**
 * Crea una respuesta de validación de error
 * @param ctx - Contexto de Koa
 * @param validationErrors - Errores de validación detallados
 */
export function createValidationErrorResponse(
  ctx: Context,
  validationErrors: Record<string, string[]>
): void {
  createErrorResponse(
    ctx,
    'Error de validación',
    HTTP_STATUS.BAD_REQUEST,
    { validationErrors }
  );
}

/**
 * Crea una respuesta de recurso no encontrado
 * @param ctx - Contexto de Koa
 * @param resource - Nombre del recurso no encontrado
 */
export function createNotFoundResponse(
  ctx: Context,
  resource: string = 'Recurso'
): void {
  createErrorResponse(
    ctx,
    `${resource} no encontrado`,
    HTTP_STATUS.NOT_FOUND
  );
}

/**
 * Maneja errores de forma consistente
 * @param ctx - Contexto de Koa
 * @param error - Error capturado
 * @param defaultMessage - Mensaje por defecto si no se puede determinar el error
 */
export function handleError(
  ctx: Context,
  error: unknown,
  defaultMessage: string = 'Error interno del servidor'
): void {
  console.error('API Error:', error);

  if (error instanceof Error) {
    // Si es un error de validación de Zod o similar
    if (error.name === 'ZodError') {
      createValidationErrorResponse(ctx, { validation: [error.message] });
      return;
    }

    // Error general con mensaje específico
    createErrorResponse(ctx, error.message, HTTP_STATUS.INTERNAL_SERVER_ERROR);
    return;
  }

  // Error desconocido
  createErrorResponse(ctx, defaultMessage, HTTP_STATUS.INTERNAL_SERVER_ERROR);
}