import { ApiResponse, ClientWithRelations, CreateClientData } from './types';
import type { AssistantConfig, UpdateAssistantConfig } from './types/assistant';

const API_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3000';

async function fetchJSON<T>(url: string, options: RequestInit = {}): Promise<T> {
  try {
    const response = await fetch(`${API_URL}${url}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Error de conexión con el servidor');
  }
}

export const api = {
  // Health check
  async health(): Promise<{ status: string; timestamp: string; uptime: number }> {
    return fetchJSON('/health');
  },

  // Clientes
  async getClients(): Promise<ApiResponse<Array<{ id: number; name: string; rut: string }>>> {
    return fetchJSON('/clients');
  },

  async getClient(id: number): Promise<ApiResponse<any>> {
    return fetchJSON(`/clients/${id}`);
  },

  async getClientsToDoFollowUp(): Promise<ApiResponse<Array<{ id: number; name: string; rut: string }>>> {
    return fetchJSON('/clients-to-do-follow-up');
  },

  async createClient(data: CreateClientData): Promise<ApiResponse<ClientWithRelations>> {
    return fetchJSON('/client', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Mensajes
  async createMessage(clientId: number, data: { text: string; role: 'client' | 'agent' }): Promise<ApiResponse<any>> {
    return fetchJSON(`/clients/${clientId}/messages`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async generateMessage(clientId: number): Promise<ApiResponse<{ message: string; clientId: number }>> {
    return fetchJSON(`/clients/${clientId}/generateMessage`);
  },

  // Assistant Configuration
  async getAssistantConfig(): Promise<ApiResponse<AssistantConfig>> {
    return fetchJSON('/assistant/config');
  },

  async updateAssistantConfig(data: UpdateAssistantConfig): Promise<ApiResponse<AssistantConfig>> {
    return fetchJSON('/assistant/config', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
};
