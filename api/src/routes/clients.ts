import Router from '@koa/router';
import { Context } from 'koa';
import { ClientService } from '../services/client.service';
import { AIService } from '../services/ai.service';
import { createClientSchema, createMessageSchema } from '../lib/validators';

const router = new Router();

// GET /clients - Obtener todos los clientes (solo id, name, rut)
router.get('/clients', async (ctx: Context) => {
  try {
    const clients = await ClientService.getAllClients();
    ctx.body = {
      success: true,
      data: clients
    };
  } catch (error) {
    ctx.throw(500, 'Error obteniendo clientes');
  }
});

// GET /clients/:id - Obtener cliente específico con mensajes y deudas
router.get('/clients/:id', async (ctx: Context) => {
  try {
    const id = parseInt(ctx.params.id);
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
    if (error && typeof error === 'object' && 'status' in error && error.status) {
      throw error;
    }
    ctx.throw(500, 'Error obteniendo cliente');
  }
});

// GET /clients-to-do-follow-up - Clientes que requieren seguimiento
router.get('/clients-to-do-follow-up', async (ctx: Context) => {
  try {
    const clients = await ClientService.getClientsToDoFollowUp();
    ctx.body = {
      success: true,
      data: clients
    };
  } catch (error) {
    ctx.throw(500, 'Error obteniendo clientes para seguimiento');
  }
});

// POST /clients - Crear nuevo cliente con mensajes y deudas
router.post('/clients', async (ctx: Context) => {
  try {
    const validatedData = createClientSchema.parse(ctx.request.body);
    
    const client = await ClientService.createClient(validatedData);
    
    ctx.status = 201;
    ctx.body = {
      success: true,
      data: client,
      message: 'Cliente creado exitosamente'
    };
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') {
      ctx.throw(400, 'Datos de entrada inválidos');
    }
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002') {
      ctx.throw(409, 'El RUT o email ya existe');
    }
    ctx.throw(500, 'Error creando cliente');
  }
});

// POST /clients/:id/messages - Crear mensaje para un cliente
router.post('/clients/:id/messages', async (ctx: Context) => {
  try {
    const id = parseInt(ctx.params.id);
    if (isNaN(id)) {
      ctx.throw(400, 'ID de cliente inválido');
    }

    const validatedData = createMessageSchema.parse(ctx.request.body);
    
    // Verificar que el cliente existe
    const client = await ClientService.getClientById(id);
    if (!client) {
      ctx.throw(404, 'Cliente no encontrado');
    }

    const message = await ClientService.createMessage(id, validatedData);
    
    ctx.status = 201;
    ctx.body = {
      success: true,
      data: message,
      message: 'Mensaje creado exitosamente'
    };
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') {
      ctx.throw(400, 'Datos de entrada inválidos');
    }
    if (error && typeof error === 'object' && 'status' in error && error.status) {
      throw error;
    }
    ctx.throw(500, 'Error creando mensaje');
  }
});

// GET /clients/:id/generateMessage - Generar mensaje de seguimiento con IA
router.get('/clients/:id/generateMessage', async (ctx: Context) => {
  try {
    const id = parseInt(ctx.params.id);
    if (isNaN(id)) {
      ctx.throw(400, 'ID de cliente inválido');
    }

    // Obtener cliente con sus deudas
    const client = await ClientService.getClientById(id);
    if (!client) {
      ctx.throw(404, 'Cliente no encontrado');
    }

    const { hasDebts } = await ClientService.getClientDebts(id);
    
    // Generar mensaje con IA
    const generatedMessage = await AIService.generateFollowUpMessage(
      id,
      client.name,
      client.rut,
      hasDebts
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
    if (error && typeof error === 'object' && 'status' in error && error.status) {
      throw error;
    }
    if (error instanceof Error && error.message?.includes('OpenAI')) {
      ctx.throw(502, error.message);
    }
    ctx.throw(500, 'Error generando mensaje de seguimiento');
  }
});

export default router;
