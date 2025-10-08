export interface AssistantConfig {
  id: number;
  name: string;
  tone: 'profesional' | 'cercano' | 'formal' | 'amigable';
  language: 'es' | 'en';
  brands: string[];
  models: Record<string, string[]>;
  branches: string[];
  messageLength: {
    min: number;
    max: number;
  };
  signature: string;
  useEmojis: boolean;
  additionalInstructions?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Interface para actualizar la configuración del asistente
 * Todos los campos son opcionales
 */
export interface UpdateAssistantConfig {
  name?: string;
  tone?: 'profesional' | 'cercano' | 'formal' | 'amigable';
  language?: 'es' | 'en';  // Cambiado para coincidir con AssistantConfig
  brands?: string[];
  models?: Record<string, string[]>;
  branches?: string[];
  messageLength?: {
    min: number;
    max: number;
  };
  signature?: string;
  useEmojis?: boolean;
  additionalInstructions?: string;
}
