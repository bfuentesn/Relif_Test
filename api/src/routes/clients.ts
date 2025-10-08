import Router from '@koa/router';
import { Context } from 'koa';
import { ClientService } from '../services/client.service';
import { AIService } from '../services/ai.service';
import { createClientSchema, createMessageSchema } from '../lib/validators';

/**
 * Router para gestionar todas las operaciones relacionadas con clientes
 * Incluye CRUD de clientes, mensajes y generación de mensajes con IA
 */
const router = new Router();

/**
 * GET /clients
 * Obtiene la lista de todos los clientes (solo campos básicos: id, name, rut)
 * @returns Lista de clientes con información básica
 */
router.get('/clients', async (ctx: Context) => {
  try {
    const clients = await ClientService.getAllClients();
    
    ctx.body = {
      success: true,
      data: clients
    };
  } catch (error) {
    console.error('Error al obtener lista de clientes:', error);
    ctx.throw(500, 'Error obteniendo clientes');
  }
});

/**
 * GET /clients/:id
 * Obtiene un cliente específico con toda su información relacionada
 * @param id - ID del cliente
 * @returns Cliente completo con mensajes y deudas
 */
router.get('/clients/:id', async (ctx: Context) => {
  try {
    const id = parseInt(ctx.params.id);
    
    // Validar que el ID sea un número válido
    if (isNaN(id)) {
      ctx.throw(400, 'ID de cliente inválido');
    }

    const client = await ClientService.getClientById(id);
    
    if (!client) {
      ctx.throw(404, 'Cliente no encontrado');
    }
    
    ctx.body = {
      success: true,
      data: client
    };
  } catch (error) {
    // Si es un error de Koa (con status), lo propagamos
    if (error && typeof error === 'object' && 'status' in error && error.status) {
      throw error;
    }
    console.error('Error al obtener cliente:', error);
    ctx.throw(500, 'Error obteniendo cliente');
  }
});

/**
 * GET /clients-to-do-follow-up
 * Obtiene clientes que requieren seguimiento
 * Criterio: sin mensajes o con último mensaje hace más de 7 días
 * @returns Lista de clientes que necesitan seguimiento
 */
router.get('/clients-to-do-follow-up', async (ctx: Context) => {
  try {
    const clients = await ClientService.getClientsToDoFollowUp();
    
    ctx.body = {
      success: true,
      data: clients
    };
  } catch (error) {
    console.error('Error al obtener clientes para seguimiento:', error);
    ctx.throw(500, 'Error obteniendo clientes para seguimiento');
  }
});

/**
 * POST /client
 * Crea un nuevo cliente con sus mensajes y deudas iniciales
 * @body CreateClientData - Datos del cliente a crear
 * @returns Cliente creado con todas sus relaciones
 */
router.post('/client', async (ctx: Context) => {
  try {
    // Validar datos de entrada con Zod
    const validatedData = createClientSchema.parse(ctx.request.body);
    
    // Crear cliente en la base de datos
    const client = await ClientService.createClient(validatedData);
    
    ctx.status = 201;
    ctx.body = {
      success: true,
      data: client,
      message: 'Cliente creado exitosamente'
    };
  } catch (error) {
    // Error de validación de Zod
    if (error instanceof Error && error.name === 'ZodError') {
      ctx.throw(400, 'Datos de entrada inválidos');
    }
    // Error de duplicado en Prisma (P2002 = unique constraint violation)
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002') {
      ctx.throw(409, 'El RUT o email ya existe');
    }
    console.error('Error al crear cliente:', error);
    ctx.throw(500, 'Error creando cliente');
  }
});

/**
 * POST /clients/:id/messages
 * Crea un nuevo mensaje para un cliente específico
 * @param id - ID del cliente
 * @body CreateMessageData - Datos del mensaje a crear
 * @returns Mensaje creado
 */
router.post('/clients/:id/messages', async (ctx: Context) => {
  try {
    const id = parseInt(ctx.params.id);
    
    // Validar ID del cliente
    if (isNaN(id)) {
      ctx.throw(400, 'ID de cliente inválido');
    }

    // Validar datos del mensaje con Zod
    const validatedData = createMessageSchema.parse(ctx.request.body);
    
    // Verificar que el cliente existe
    const client = await ClientService.getClientById(id);
    if (!client) {
      ctx.throw(404, 'Cliente no encontrado');
    }

    // Crear el mensaje
    const message = await ClientService.createMessage(id, validatedData);
    
    ctx.status = 201;
    ctx.body = {
      success: true,
      data: message,
      message: 'Mensaje creado exitosamente'
    };
  } catch (error) {
    // Error de validación
    if (error instanceof Error && error.name === 'ZodError') {
      ctx.throw(400, 'Datos de entrada inválidos');
    }
    // Propagar errores de Koa
    if (error && typeof error === 'object' && 'status' in error && error.status) {
      throw error;
    }
    console.error('Error al crear mensaje:', error);
    ctx.throw(500, 'Error creando mensaje');
  }
});

/**
 * GET /clients/:id/generateMessage
 * Genera un mensaje de seguimiento personalizado usando IA
 * Considera el contexto del cliente (nombre, RUT, deudas) para crear un mensaje apropiado
 * @param id - ID del cliente
 * @returns Mensaje generado por IA
 */
router.get('/clients/:id/generateMessage', async (ctx: Context) => {
  try {
    const id = parseInt(ctx.params.id);
    
    // Validar ID del cliente
    if (isNaN(id)) {
      ctx.throw(400, 'ID de cliente inválido');
    }

    // Obtener datos del cliente
    const client = await ClientService.getClientById(id);
    if (!client) {
      ctx.throw(404, 'Cliente no encontrado');
      return; // TypeScript flow control
    }

    // Verificar estado de deudas del cliente
    const { hasDebts } = await ClientService.getClientDebts(id);
    
    // Transformar el historial de mensajes al formato esperado por el servicio de IA
    const conversationHistory = client.messages.map((msg: typeof client.messages[0]) => ({
      text: msg.text,
      role: msg.role,
      sentAt: msg.sentAt.toISOString()
    }));
    
    // Generar mensaje personalizado con IA
    // El cliente ya fue validado, podemos acceder a sus propiedades de forma segura
    const generatedMessage = await AIService.generateFollowUpMessage(
      id,
      client.name,
      client.rut,
      hasDebts,
      undefined, // recentModelsHint
      conversationHistory // Pasar el historial de conversaciones
    );
    
    ctx.body = {
      success: true,
      data: {
        message: generatedMessage,
        clientId: id
      },
      message: 'Mensaje generado exitosamente'
    };
  } catch (error) {
    // Propagar errores de Koa
    if (error && typeof error === 'object' && 'status' in error && error.status) {
      throw error;
    }
    // Errores específicos de OpenAI
    if (error instanceof Error && error.message?.includes('OpenAI')) {
      ctx.throw(502, error.message);
    }
    console.error('Error al generar mensaje con IA:', error);
    ctx.throw(500, 'Error generando mensaje de seguimiento');
  }
});

export default router;
