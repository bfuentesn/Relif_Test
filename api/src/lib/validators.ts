
/**
 * Esquemas de validación usando Zod
 * Define la estructura y validaciones para los datos de entrada
 */

// Usar el shim de zod para evitar problemas de importación
declare const require: any;
const { z } = require('zod');

/**
 * Schema para crear un nuevo cliente
 * Valida todos los campos requeridos y opcionales
 */
export const createClientSchema = z.object({
  name: z.string()
    .min(1, 'Nombre es requerido')
    .max(100, 'Nombre demasiado largo'),
  
  rut: z.string()
    .min(1, 'RUT es requerido'),
  
  email: z.string()
    .email('Email inválido')
    .optional()
    .or(z.literal('')),
  
  phone: z.string()
    .optional()
    .or(z.literal('')),
  
  messages: z.array(z.object({
    text: z.string()
      .min(1, 'Texto del mensaje es requerido')
      .max(2000, 'Mensaje demasiado largo'),
    role: z.enum(['client', 'agent'], {
      errorMap: () => ({ message: 'Role debe ser client o agent' })
    })
  })).optional().default([]),
  
  debts: z.array(z.object({
    institution: z.string()
      .min(1, 'Institución es requerida')
      .max(100, 'Nombre de institución demasiado largo'),
    amount: z.number()
      .int('Monto debe ser un número entero')
      .positive('Monto debe ser positivo')
      .max(999999999, 'Monto demasiado alto'),
    dueDate: z.string()
  })).optional().default([])
});

/**
 * Schema para crear un nuevo mensaje
 * Valida texto y rol del mensaje
 */
export const createMessageSchema = z.object({
  text: z.string()
    .min(1, 'Texto del mensaje es requerido')
    .max(2000, 'Mensaje demasiado largo'),
  
  role: z.enum(['client', 'agent'], {
    errorMap: () => ({ message: 'Role debe ser client o agent' })
  })
});

/**
 * Schema para actualizar configuración del asistente
 * Todos los campos son opcionales para permitir actualizaciones parciales
 */
export const updateAssistantConfigSchema = z.object({
  name: z.string()
    .min(1, 'Nombre es requerido')
    .max(50, 'Nombre demasiado largo')
    .optional(),
  
  tone: z.enum(['profesional', 'cercano', 'formal', 'amigable'])
    .optional(),
  
  language: z.enum(['es', 'en'])
    .optional(),
  
  brands: z.array(z.string().min(1))
    .optional(),
  
  models: z.record(z.array(z.string()))
    .optional(),
  
  branches: z.array(z.string().min(1))
    .optional(),
  
  messageLengthMin: z.number()
    .int()
    .min(50, 'Longitud mínima debe ser al menos 50 caracteres')
    .max(300, 'Longitud mínima no puede exceder 300 caracteres')
    .optional(),
  
  messageLengthMax: z.number()
    .int()
    .min(100, 'Longitud máxima debe ser al menos 100 caracteres')
    .max(500, 'Longitud máxima no puede exceder 500 caracteres')
    .optional(),
  
  signature: z.string()
    .max(100, 'Firma demasiado larga')
    .optional(),
  
  useEmojis: z.boolean()
    .optional(),
  
  additionalInstructions: z.string()
    .max(1000, 'Instrucciones adicionales demasiado largas')
    .optional()
});

/**
 * Función para validar datos de cliente
 */
export function validateCreateClientData(data: any) {
  return createClientSchema.parse(data);
}

/**
 * Función para validar datos de mensaje
 */
export function validateCreateMessageData(data: any) {
  return createMessageSchema.parse(data);
}

/**
 * Función para validar configuración de asistente
 */
export function validateUpdateAssistantConfigData(data: any) {
  return updateAssistantConfigSchema.parse(data);
}
