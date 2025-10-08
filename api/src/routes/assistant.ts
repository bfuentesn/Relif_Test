import Router from '@koa/router';
import { Context } from 'koa';
import { AssistantService } from '../services/assistant.service';
import { z } from 'zod';

/**
 * Router para gestionar la configuración del asistente de IA
 */
const router = new Router();

/**
 * Schema de validación para actualizar la configuración del asistente
 * Todos los campos son opcionales para permitir actualizaciones parciales
 */
const updateConfigSchema = z.object({
  name: z.string().min(1).optional(),
  tone: z.enum(['profesional', 'cercano', 'formal', 'amigable']).optional(),
  language: z.enum(['es', 'en']).optional(),
  brands: z.array(z.string()).optional(),
  models: z.record(z.array(z.string())).optional(),
  branches: z.array(z.string()).optional(),
  messageLength: z.object({
    min: z.number().int().positive(),
    max: z.number().int().positive()
  }).optional(),
  signature: z.string().min(1).optional(),
  useEmojis: z.boolean().optional(),
  additionalInstructions: z.string().optional()
});

/**
 * GET /assistant/config
 * Obtiene la configuración actual del asistente de IA
 * @returns Configuración del asistente
 */
router.get('/assistant/config', async (ctx: Context) => {
  try {
    const config = await AssistantService.getConfig();
    
    ctx.body = {
      success: true,
      data: config
    };
  } catch (error) {
    console.error('Error al obtener configuración del asistente:', error);
    if (error instanceof Error) {
      ctx.throw(500, `Error obteniendo configuración del asistente: ${error.message}`);
    } else {
      ctx.throw(500, 'Error obteniendo configuración del asistente');
    }
  }
});

/**
 * PUT /assistant/config
 * Actualiza la configuración del asistente de IA
 * Todos los campos son opcionales (actualización parcial)
 * @body UpdateAssistantConfig - Campos a actualizar
 * @returns Configuración actualizada
 */
router.put('/assistant/config', async (ctx: Context) => {
  try {
    // Validar datos de entrada con Zod
    const validatedData = updateConfigSchema.parse(ctx.request.body);
    
    // Actualizar configuración
    const config = await AssistantService.updateConfig(validatedData);
    
    ctx.body = {
      success: true,
      data: config,
      message: 'Configuración actualizada exitosamente'
    };
  } catch (error) {
    // Error de validación
    if (error instanceof Error && error.name === 'ZodError') {
      ctx.throw(400, 'Datos de configuración inválidos');
    }
    console.error('Error al actualizar configuración:', error);
    ctx.throw(500, 'Error actualizando configuración del asistente');
  }
});

export default router;
