/**
 * Constantes de la aplicación
 * Centraliza valores que se usan en múltiples lugares
 */

/**
 * Configuración de la API
 */
export const API_CONFIG = {
  BASE_URL: (import.meta as any).env?.VITE_API_URL || 'http://localhost:3000',
  TIMEOUT: 10000, // 10 segundos
} as const;

/**
 * Estados de los clientes
 */
export const CLIENT_STATUS = {
  ACTIVE: 'active',
  FOLLOW_UP: 'follow-up',
} as const;

/**
 * Roles de mensajes
 */
export const MESSAGE_ROLES = {
  CLIENT: 'client',
  AGENT: 'agent',
} as const;

/**
 * Tonos disponibles para el asistente
 */
export const ASSISTANT_TONES = {
  PROFESSIONAL: 'profesional',
  FRIENDLY: 'cercano',
  FORMAL: 'formal',
  CASUAL: 'amigable',
} as const;

/**
 * Idiomas disponibles
 */
export const LANGUAGES = {
  SPANISH: 'es',
  ENGLISH: 'en',
} as const;

/**
 * Límites de longitud de mensaje
 */
export const MESSAGE_LIMITS = {
  MIN_LENGTH: 80,
  MAX_LENGTH: 300,
  DEFAULT_MIN: 120,
  DEFAULT_MAX: 180,
} as const;

/**
 * Colores del tema
 */
export const THEME_COLORS = {
  PRIMARY: '#2563eb',
  SECONDARY: '#64748b',
  SUCCESS: '#10b981',
  WARNING: '#f59e0b',
  ERROR: '#ef4444',
  INFO: '#3b82f6',
} as const;

/**
 * Breakpoints para responsive design
 */
export const BREAKPOINTS = {
  MOBILE: '768px',
  TABLET: '1024px',
  DESKTOP: '1280px',
} as const;

/**
 * Validaciones comunes
 */
export const VALIDATION = {
  RUT_REGEX: /^[0-9]+-[0-9kK]$/,
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE_REGEX: /^[+]?[0-9\s\-()]+$/,
} as const;

/**
 * Mensajes de error comunes
 */
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Error de conexión con el servidor',
  UNAUTHORIZED: 'No autorizado',
  NOT_FOUND: 'Recurso no encontrado',
  VALIDATION_ERROR: 'Error de validación',
  UNKNOWN_ERROR: 'Error desconocido',
} as const;

/**
 * Configuración de paginación
 */
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 100,
} as const;