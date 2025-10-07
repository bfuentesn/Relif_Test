import { z } from 'zod';

export const createClientSchema = z.object({
  name: z.string().min(1, 'Nombre es requerido'),
  rut: z.string().min(1, 'RUT es requerido'),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  phone: z.string().optional().or(z.literal('')),
  messages: z.array(z.object({
    text: z.string().min(1, 'Texto del mensaje es requerido'),
    role: z.enum(['client', 'agent'], {
      errorMap: () => ({ message: 'Role debe ser client o agent' })
    })
  })).optional().default([]),
  debts: z.array(z.object({
    institution: z.string().min(1, 'Institución es requerida'),
    amount: z.number().int().positive('Monto debe ser positivo'),
    dueDate: z.string().datetime('Fecha de vencimiento inválida')
  })).optional().default([])
});

export const createMessageSchema = z.object({
  text: z.string().min(1, 'Texto del mensaje es requerido'),
  role: z.enum(['client', 'agent'], {
    errorMap: () => ({ message: 'Role debe ser client o agent' })
  })
});

export type CreateClientInput = z.infer<typeof createClientSchema>;
export type CreateMessageInput = z.infer<typeof createMessageSchema>;
