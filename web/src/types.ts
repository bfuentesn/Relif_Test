export interface Client {
  id: number;
  name: string;
  rut: string;
  email?: string;
  phone?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  id: number;
  text: string;
  role: 'client' | 'agent';
  sentAt: string;
  clientId: number;
  createdAt: string;
  updatedAt: string;
}

export interface Debt {
  id: number;
  institution: string;
  amount: number;
  dueDate: string;
  clientId: number;
  createdAt: string;
  updatedAt: string;
}

export interface ClientWithRelations extends Client {
  messages: Message[];
  debts: Debt[];
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface CreateMessageData {
  text: string;
  role: 'client' | 'agent';
}

export interface GenerateMessageResponse {
  message: string;
  clientId: number;
}
