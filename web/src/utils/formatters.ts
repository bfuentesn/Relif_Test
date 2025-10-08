/**
 * Utilidades de formateo para mostrar datos de forma consistente
 */

/**
 * Formatea un monto en pesos chilenos
 * @param amount - Monto en números
 * @returns String formateado con separadores de miles y símbolo de peso
 */
export const formatCurrency = (amount: number): string => {
  return `$${amount.toLocaleString('es-CL')}`;
};

/**
 * Formatea una fecha en formato chileno (DD/MM/YYYY)
 * @param date - Fecha como string o Date object
 * @returns String con formato DD/MM/YYYY
 */
export const formatDate = (date: string | Date): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString('es-CL');
};

/**
 * Formatea una fecha y hora en formato chileno
 * @param date - Fecha como string o Date object
 * @returns String con formato DD/MM/YYYY HH:MM
 */
export const formatDateTime = (date: string | Date): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString('es-CL') + ' ' + 
         dateObj.toLocaleTimeString('es-CL', { 
           hour: '2-digit', 
           minute: '2-digit' 
         });
};

/**
 * Formatea un RUT chileno para mostrar con puntos y guión
 * @param rut - RUT sin formato
 * @returns RUT formateado (ej: 12.345.678-9)
 */
export const formatRUT = (rut: string): string => {
  // Remover caracteres que no sean números o 'k'
  const cleanRut = rut.replace(/[^0-9kK]/g, '');
  
  if (cleanRut.length < 2) return rut;
  
  // Separar número del dígito verificador
  const body = cleanRut.slice(0, -1);
  const dv = cleanRut.slice(-1);
  
  // Agregar puntos cada 3 dígitos desde la derecha
  const formattedBody = body.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  
  return `${formattedBody}-${dv}`;
};

/**
 * Calcula el tiempo transcurrido desde una fecha
 * @param date - Fecha como string o Date object
 * @returns String descriptivo del tiempo transcurrido
 */
export const getTimeAgo = (date: string | Date): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - dateObj.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffMinutes = Math.floor(diffMs / (1000 * 60));

  if (diffDays > 7) {
    return formatDate(dateObj);
  } else if (diffDays > 0) {
    return `Hace ${diffDays} día${diffDays > 1 ? 's' : ''}`;
  } else if (diffHours > 0) {
    return `Hace ${diffHours} hora${diffHours > 1 ? 's' : ''}`;
  } else if (diffMinutes > 0) {
    return `Hace ${diffMinutes} minuto${diffMinutes > 1 ? 's' : ''}`;
  } else {
    return 'Hace un momento';
  }
};

/**
 * Determina si una fecha está vencida
 * @param dueDate - Fecha de vencimiento
 * @returns true si la fecha está vencida
 */
export const isOverdue = (dueDate: string | Date): boolean => {
  const dateObj = typeof dueDate === 'string' ? new Date(dueDate) : dueDate;
  return dateObj < new Date();
};