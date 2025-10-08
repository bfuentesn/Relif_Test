/**
 * Utilidades de fecha y tiempo
 * Funciones helper para manejo de fechas en el backend
 */

/**
 * Obtiene la fecha actual como string ISO
 * @returns Fecha actual en formato ISO
 */
export function getCurrentISODate(): string {
  return new Date().toISOString();
}

/**
 * Convierte días a milisegundos
 * @param days - Número de días
 * @returns Milisegundos equivalentes
 */
export function daysToMilliseconds(days: number): number {
  return days * 24 * 60 * 60 * 1000;
}

/**
 * Verifica si una fecha está en el pasado
 * @param date - Fecha a verificar (string ISO o Date)
 * @returns true si la fecha está en el pasado
 */
export function isDateInPast(date: string | Date): boolean {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj < new Date();
}

/**
 * Calcula la diferencia en días entre dos fechas
 * @param date1 - Primera fecha
 * @param date2 - Segunda fecha (por defecto, fecha actual)
 * @returns Diferencia en días (positiva si date1 es posterior a date2)
 */
export function getDaysDifference(
  date1: string | Date,
  date2: string | Date = new Date()
): number {
  const dateObj1 = typeof date1 === 'string' ? new Date(date1) : date1;
  const dateObj2 = typeof date2 === 'string' ? new Date(date2) : date2;
  
  const diffTime = dateObj1.getTime() - dateObj2.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Verifica si una fecha es válida
 * @param date - Fecha a validar
 * @returns true si la fecha es válida
 */
export function isValidDate(date: string | Date): boolean {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return !isNaN(dateObj.getTime());
}

/**
 * Obtiene una fecha N días en el pasado
 * @param days - Número de días hacia atrás
 * @returns Fecha en formato ISO
 */
export function getDateDaysAgo(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString();
}