import { Client, Message, Debt, Role } from '@prisma/client';

export interface ClientWithRelations extends Client {
  messages: Message[];
  debts: Debt[];
}

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
