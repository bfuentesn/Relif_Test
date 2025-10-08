import { Client, Message, Debt, Role } from '@prisma/client';

/**
 * Cliente con todas sus relaciones cargadas
 * Incluye la información completa del cliente más sus mensajes y deudas
 */
export type ClientWithRelations = Client & {
  messages: Message[];
  debts: Debt[];
};

export interface CreateClientData {
  name: string;
  rut: string;
  email?: string;
  phone?: string;
  messages?: Array<{
    text: string;
    role: Role;
  }>;
  debts?: Array<{
    institution: string;
    amount: number;
    dueDate: string;
  }>;
}

export interface CreateMessageData {
  text: string;
  role: Role;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface ErrorResponse {
  success: false;
  error: string;
  message: string;
}
