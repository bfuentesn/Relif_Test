/**
 * Router para operaciones de clientes
 * Gestiona CRUD de clientes, mensajes y generación con IA
 */
import Router from '@koa/router';
import { Context } from 'koa';
import { ClientService } from '../services/client.service';
import { AIService } from '../services/ai.service';
import { createClientSchema, createMessageSchema } from '../lib/validators';
import { HTTP_STATUS, ERROR_MESSAGES } from '../utils/constants';
import { createSuccessResponse, createErrorResponse, createNotFoundResponse, ApiResponse } from '../utils/response';
import type { CreateClientData, CreateMessageData, ClientWithRelations } from '../types';

const router = new Router();

/**
 * Validador auxiliar para ID de cliente
 */
function validateClientId(id: string): number {
  const parsedId = parseInt(id, 10);
  if (isNaN(parsedId) || parsedId <= 0) {
    throw new Error('ID de cliente inválido');
  }
  return parsedId;
}

/**
 * GET /clients
 * Obtiene la lista de todos los clientes (solo campos básicos: id, name, rut)
 */
router.get('/clients', async (ctx: Context) => {
  const clients = await ClientService.getAllClients();
  createSuccessResponse(ctx, clients);
});

/**
 * GET /clients/:id
 * Obtiene un cliente específico con toda su información relacionada
 */
router.get('/clients/:id', async (ctx: Context) => {
  const id = validateClientId(ctx.params.id);
  
  const client = await ClientService.getClientById(id);
  
  if (!client) {
    createNotFoundResponse(ctx, 'Cliente');
    return;
  }
  
  createSuccessResponse(ctx, client);
});

/**
 * GET /clients-to-do-follow-up
 * Obtiene clientes que requieren seguimiento
 */
router.get('/clients-to-do-follow-up', async (ctx: Context) => {
  const clients = await ClientService.getClientsToDoFollowUp();
  createSuccessResponse(ctx, clients);
});

/**
 * POST /client
 * Crea un nuevo cliente con sus mensajes y deudas iniciales
 */
router.post('/client', async (ctx: Context) => {
  // Validar datos de entrada
  const validatedData = createClientSchema.parse(ctx.request.body) as CreateClientData;
  
  // Crear cliente
  const client = await ClientService.createClient(validatedData);
  
  createSuccessResponse(ctx, client, 'Cliente creado exitosamente', HTTP_STATUS.CREATED);
});

/**
 * POST /clients/:id/messages
 * Crea un nuevo mensaje para un cliente específico
 */
router.post('/clients/:id/messages', async (ctx: Context) => {
  const id = validateClientId(ctx.params.id);
  
  // Validar datos del mensaje
  const validatedData = createMessageSchema.parse(ctx.request.body) as CreateMessageData;
  
  // Verificar que el cliente existe
  const client = await ClientService.getClientById(id);
  if (!client) {
    createNotFoundResponse(ctx, 'Cliente');
    return;
  }

  // Crear el mensaje
  const message = await ClientService.createMessage(id, validatedData);
  
  createSuccessResponse(ctx, message, 'Mensaje creado exitosamente', HTTP_STATUS.CREATED);
});

/**
 * GET /clients/:id/generateMessage
 * Genera un mensaje de seguimiento personalizado usando IA
 */
router.get('/clients/:id/generateMessage', async (ctx: Context) => {
  const id = validateClientId(ctx.params.id);
  
  // Obtener datos del cliente
  const client = await ClientService.getClientById(id);
  if (!client) {
    createNotFoundResponse(ctx, 'Cliente');
    return;
  }

  // Verificar estado de deudas del cliente
  const { hasDebts } = await ClientService.getClientDebts(id);
  
  // Transformar el historial de mensajes
  const conversationHistory = client.messages.map((msg: any) => ({
    text: msg.text,
    role: msg.role,
    sentAt: msg.sentAt.toISOString()
  }));
  
  // Generar mensaje personalizado con IA
  const generatedMessage = await AIService.generateFollowUpMessage(
    id,
    client.name,
    client.rut,
    hasDebts,
    undefined, // recentModelsHint
    conversationHistory
  );
  
  createSuccessResponse(ctx, {
    message: generatedMessage,
    clientId: id
  }, 'Mensaje generado exitosamente');
});

export default router;
