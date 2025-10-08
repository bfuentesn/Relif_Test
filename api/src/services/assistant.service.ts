import { prisma } from '../lib/prisma';
import { AssistantConfig, UpdateAssistantConfig } from '../types/assistant';

/**
 * Servicio para gestionar la configuración del asistente de IA
 * Maneja la obtención y actualización de parámetros del asistente
 */
export class AssistantService {
  /**
   * Obtiene la configuración del asistente
   * Si no existe, crea una configuración por defecto
   * @returns Configuración actual del asistente
   */
  static async getConfig(): Promise<AssistantConfig> {
    try {
      // Intentar obtener configuración existente
      const configFromDb = await prisma.assistantConfig.findFirst();
      
      // Si no existe, crear configuración por defecto
      if (!configFromDb) {
        // Configuración predeterminada para automotora chilena
        const defaultConfig = {
          name: 'Carla',
          tone: 'profesional' as const,
          language: 'es' as const,
          brands: ['Toyota', 'Hyundai', 'Chevrolet', 'Suzuki', 'Mazda'],
          models: {
            Toyota: ['Corolla', 'RAV4'],
            Hyundai: ['Tucson', 'Elantra'],
            Chevrolet: ['Tracker', 'Onix'],
            Suzuki: ['Swift'],
            Mazda: ['CX-5']
          },
          branches: ['Providencia', 'Maipú', 'La Florida'],
          messageLengthMin: 120,
          messageLengthMax: 180,
          signature: 'Carla — Automotora',
          useEmojis: true,
          additionalInstructions: ''
        };
        
        // Crear nueva configuración
        const newConfig = await prisma.assistantConfig.create({
          data: defaultConfig
        });

        // Verificar que se creó correctamente
        if (!newConfig) {
          throw new Error('No se pudo crear la configuración inicial del asistente');
        }

        // Devolver la nueva configuración
        return {
          id: newConfig.id,
          name: newConfig.name,
          tone: newConfig.tone as AssistantConfig['tone'],
          language: newConfig.language as AssistantConfig['language'],
          brands: newConfig.brands,
          models: newConfig.models as Record<string, string[]>,
          branches: newConfig.branches,
          messageLength: {
            min: newConfig.messageLengthMin,
            max: newConfig.messageLengthMax
          },
          signature: newConfig.signature,
          useEmojis: newConfig.useEmojis,
          additionalInstructions: newConfig.additionalInstructions || '',
          createdAt: newConfig.createdAt.toISOString(),
          updatedAt: newConfig.updatedAt.toISOString()
        };
      }

            // Devolver la configuración existente
      return {
        id: configFromDb.id,
        name: configFromDb.name,
        tone: configFromDb.tone as AssistantConfig['tone'],
        language: configFromDb.language as AssistantConfig['language'],
        brands: configFromDb.brands,
        models: configFromDb.models as Record<string, string[]>,
        branches: configFromDb.branches,
        messageLength: {
          min: configFromDb.messageLengthMin,
          max: configFromDb.messageLengthMax
        },
        signature: configFromDb.signature,
        useEmojis: configFromDb.useEmojis,
        additionalInstructions: configFromDb.additionalInstructions || '',
        createdAt: configFromDb.createdAt.toISOString(),
        updatedAt: configFromDb.updatedAt.toISOString()
      };
    } catch (error) {
      console.error('Error en AssistantService.getConfig:', error);
      const message = error instanceof Error ? error.message : 'error desconocido';
      throw new Error(`Error al obtener configuración del asistente: ${message}`);
    }
  }

  /**
   * Actualiza la configuración del asistente
   * Si no existe configuración, crea una nueva con los datos proporcionados
   * @param updates - Campos a actualizar (todos opcionales)
   * @returns Configuración actualizada
   */
  static async updateConfig(updates: UpdateAssistantConfig): Promise<AssistantConfig> {
    const existingConfig = await prisma.assistantConfig.findFirst();
    
    if (existingConfig) {
      const updatedConfig = await prisma.assistantConfig.update({
        where: { id: existingConfig.id },
        data: {
          ...(updates.name && { name: updates.name }),
          ...(updates.tone && { tone: updates.tone }),
          ...(updates.language && { language: updates.language }),
          ...(updates.brands && { brands: updates.brands }),
          ...(updates.models && { models: updates.models }),
          ...(updates.branches && { branches: updates.branches }),
          ...(updates.messageLength && {
            messageLengthMin: updates.messageLength.min,
            messageLengthMax: updates.messageLength.max
          }),
          ...(updates.signature && { signature: updates.signature }),
          ...(updates.useEmojis !== undefined && { useEmojis: updates.useEmojis }),
          ...(updates.additionalInstructions !== undefined && { additionalInstructions: updates.additionalInstructions })
        }
      });

      return {
        id: updatedConfig.id,
        name: updatedConfig.name,
        tone: updatedConfig.tone as AssistantConfig['tone'],
        language: updatedConfig.language as AssistantConfig['language'],
        brands: updatedConfig.brands,
        models: updatedConfig.models as Record<string, string[]>,
        branches: updatedConfig.branches,
        messageLength: {
          min: updatedConfig.messageLengthMin,
          max: updatedConfig.messageLengthMax
        },
        signature: updatedConfig.signature,
        useEmojis: updatedConfig.useEmojis,
        additionalInstructions: updatedConfig.additionalInstructions || '',
        createdAt: updatedConfig.createdAt.toISOString(),
        updatedAt: updatedConfig.updatedAt.toISOString()
      };
    } else {
      // Crear nueva configuración si no existe
      const newConfig = await prisma.assistantConfig.create({
        data: {
          name: updates.name || 'Carla',
          tone: updates.tone || 'profesional',
          language: updates.language || 'es',
          brands: updates.brands || ['Toyota', 'Hyundai', 'Chevrolet', 'Suzuki', 'Mazda'],
          models: updates.models || {
            Toyota: ['Corolla', 'RAV4'],
            Hyundai: ['Tucson', 'Elantra'],
            Chevrolet: ['Tracker', 'Onix'],
            Suzuki: ['Swift'],
            Mazda: ['CX-5']
          },
          branches: updates.branches || ['Providencia', 'Maipú', 'La Florida'],
          messageLengthMin: updates.messageLength?.min || 120,
          messageLengthMax: updates.messageLength?.max || 180,
          signature: updates.signature || 'Carla — Automotora',
          useEmojis: updates.useEmojis ?? true,
          additionalInstructions: updates.additionalInstructions ?? ''
        }
      });

      return {
        id: newConfig.id,
        name: newConfig.name,
        tone: newConfig.tone as AssistantConfig['tone'],
        language: newConfig.language as AssistantConfig['language'],
        brands: newConfig.brands,
        models: newConfig.models as Record<string, string[]>,
        branches: newConfig.branches,
        messageLength: {
          min: newConfig.messageLengthMin,
          max: newConfig.messageLengthMax
        },
        signature: newConfig.signature,
        useEmojis: newConfig.useEmojis,
        additionalInstructions: newConfig.additionalInstructions || '',
        createdAt: newConfig.createdAt.toISOString(),
        updatedAt: newConfig.updatedAt.toISOString()
      };
    }
  }
}
