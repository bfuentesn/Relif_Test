/**
 * Constantes del backend
 * Centraliza valores configurables y constantes del sistema
 */

/**
 * Configuración de la base de datos
 */
export const DATABASE_CONFIG = {
  CONNECTION_TIMEOUT: 30000, // 30 segundos
  QUERY_TIMEOUT: 15000, // 15 segundos
} as const;

/**
 * Configuración de OpenAI
 */
export const OPENAI_CONFIG = {
  MODEL: 'gpt-4o-mini',
  MAX_TOKENS: 300,
  TEMPERATURE: 0.7,
  TIMEOUT: 30000, // 30 segundos
} as const;

/**
 * Límites del sistema
 */
export const SYSTEM_LIMITS = {
  MAX_MESSAGE_LENGTH: 2000,
  MIN_MESSAGE_LENGTH: 1,
  MAX_CLIENT_NAME_LENGTH: 100,
  MAX_INSTITUTION_NAME_LENGTH: 100,
  MAX_DEBT_AMOUNT: 999999999, // ~1B CLP
} as const;

/**
 * Configuración de seguimiento de clientes
 */
export const FOLLOW_UP_CONFIG = {
  DAYS_WITHOUT_MESSAGES: 7, // Días sin mensajes para requerir seguimiento
  DAYS_OLD_MESSAGES: 7, // Días para considerar mensajes antiguos
} as const;

/**
 * Estados HTTP
 */
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
} as const;

/**
 * Mensajes de error estándar
 */
export const ERROR_MESSAGES = {
  CLIENT_NOT_FOUND: 'Cliente no encontrado',
  INVALID_CLIENT_DATA: 'Datos del cliente inválidos',
  INVALID_MESSAGE_DATA: 'Datos del mensaje inválidos',
  OPENAI_API_ERROR: 'Error en la API de OpenAI',
  DATABASE_ERROR: 'Error en la base de datos',
  VALIDATION_ERROR: 'Error de validación',
  INTERNAL_ERROR: 'Error interno del servidor',
} as const;

/**
 * Configuración del servidor
 */
export const SERVER_CONFIG = {
  DEFAULT_PORT: 3000,
  CORS_ORIGINS: {
    DEVELOPMENT: '*',
    PRODUCTION: process.env.FRONTEND_URL || 'https://localhost:3000',
  },
} as const;