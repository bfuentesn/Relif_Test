/**
 * Utilidades de validación para formularios
 */

import { VALIDATION } from './constants';

/**
 * Valida si un RUT chileno tiene el formato correcto
 * @param rut - RUT a validar
 * @returns true si el formato es válido
 */
export const isValidRUT = (rut: string): boolean => {
  if (!rut || typeof rut !== 'string') return false;
  
  // Limpiar el RUT de puntos y guiones
  const cleanRut = rut.replace(/[.-]/g, '');
  
  // Verificar formato básico
  if (!/^[0-9]+[0-9kK]$/.test(cleanRut)) return false;
  
  // Verificar longitud
  if (cleanRut.length < 8 || cleanRut.length > 9) return false;
  
  return true;
};

/**
 * Valida si un email tiene formato válido
 * @param email - Email a validar
 * @returns true si el formato es válido
 */
export const isValidEmail = (email: string): boolean => {
  if (!email || typeof email !== 'string') return false;
  return VALIDATION.EMAIL_REGEX.test(email);
};

/**
 * Valida si un teléfono tiene formato válido
 * @param phone - Teléfono a validar
 * @returns true si el formato es válido
 */
export const isValidPhone = (phone: string): boolean => {
  if (!phone || typeof phone !== 'string') return false;
  return VALIDATION.PHONE_REGEX.test(phone);
};

/**
 * Valida si un string no está vacío (después de trim)
 * @param value - Valor a validar
 * @returns true si no está vacío
 */
export const isNotEmpty = (value: string): boolean => {
  return Boolean(value && value.trim().length > 0);
};

/**
 * Valida si un número está dentro de un rango
 * @param value - Número a validar
 * @param min - Valor mínimo
 * @param max - Valor máximo
 * @returns true si está dentro del rango
 */
export const isInRange = (value: number, min: number, max: number): boolean => {
  return value >= min && value <= max;
};

/**
 * Valida si una fecha está en el futuro
 * @param date - Fecha a validar
 * @returns true si la fecha es futura
 */
export const isFutureDate = (date: string | Date): boolean => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj > new Date();
};

/**
 * Conjunto de validaciones para crear cliente
 * @param data - Datos del cliente a validar
 * @returns Objeto con errores de validación
 */
export const validateClientData = (data: {
  name: string;
  rut: string;
  email?: string;
  phone?: string;
}) => {
  const errors: Record<string, string> = {};

  if (!isNotEmpty(data.name)) {
    errors.name = 'El nombre es requerido';
  }

  if (!isNotEmpty(data.rut)) {
    errors.rut = 'El RUT es requerido';
  } else if (!isValidRUT(data.rut)) {
    errors.rut = 'El RUT no tiene un formato válido';
  }

  if (data.email && !isValidEmail(data.email)) {
    errors.email = 'El email no tiene un formato válido';
  }

  if (data.phone && !isValidPhone(data.phone)) {
    errors.phone = 'El teléfono no tiene un formato válido';
  }

  return errors;
};