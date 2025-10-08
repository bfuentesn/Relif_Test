import { prisma } from '../lib/prisma';
import { CreateClientData, CreateMessageData, ClientWithRelations } from '../types';

/**
 * Servicio para gestionar operaciones relacionadas con clientes
 * Proporciona métodos para CRUD de clientes, mensajes y consultas especializadas
 */
export class ClientService {
  /**
   * Obtiene todos los clientes con información básica
   * Solo retorna id, name y rut para optimizar la consulta
   * @returns Lista de clientes ordenada por nombre
   */
  static async getAllClients(): Promise<Pick<ClientWithRelations, 'id' | 'name' | 'rut'>[]> {
    return await prisma.client.findMany({
      select: {
        id: true,
        name: true,
        rut: true
      },
      orderBy: {
        name: 'asc'
      }
    });
  }

  /**
   * Obtiene un cliente específico con todas sus relaciones
   * Incluye mensajes ordenados por fecha (más reciente primero)
   * y deudas ordenadas por fecha de vencimiento
   * @param id - ID del cliente a buscar
   * @returns Cliente con sus relaciones o null si no existe
   */
  static async getClientById(id: number): Promise<ClientWithRelations | null> {
    return await prisma.client.findUnique({
      where: { id },
      include: {
        messages: {
          orderBy: {
            sentAt: 'desc'
          }
        },
        debts: {
          orderBy: {
            dueDate: 'asc'
          }
        }
      }
    });
  }

  /**
   * Obtiene clientes que necesitan seguimiento
   * Criterios: sin mensajes o con último mensaje hace más de 7 días
   * @returns Lista de clientes que requieren seguimiento
   */
  static async getClientsToDoFollowUp(): Promise<Pick<ClientWithRelations, 'id' | 'name' | 'rut'>[]> {
    const DAYS_FOR_FOLLOW_UP = 7;
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - DAYS_FOR_FOLLOW_UP);

    // Obtener clientes sin mensajes
    const clientsWithoutMessages = await prisma.client.findMany({
      where: {
        messages: {
          none: {}
        }
      },
      select: {
        id: true,
        name: true,
        rut: true
      }
    });

    // Obtener clientes con último mensaje hace más de 7 días
    const clientsWithOldMessages = await prisma.client.findMany({
      where: {
        messages: {
          some: {}
        },
        NOT: {
          messages: {
            some: {
              sentAt: {
                gt: sevenDaysAgo
              }
            }
          }
        }
      },
      select: {
        id: true,
        name: true,
        rut: true
      }
    });

    // Combinar ambas listas y eliminar duplicados
    const allClients = [...clientsWithoutMessages, ...clientsWithOldMessages];
    const uniqueClients = allClients.filter((client, index, self) => 
      index === self.findIndex(c => c.id === client.id)
    );

    // Ordenar alfabéticamente por nombre
    return uniqueClients.sort((a, b) => a.name.localeCompare(b.name));
  }

  /**
   * Crea un nuevo cliente con sus mensajes y deudas iniciales
   * Usa una transacción para garantizar la consistencia de los datos
   * @param data - Datos del cliente a crear
   * @returns Cliente creado con todas sus relaciones
   */
  static async createClient(data: CreateClientData): Promise<ClientWithRelations> {
    return await prisma.$transaction(async (tx: any) => {
      // Crear cliente
      const client = await tx.client.create({
        data: {
          name: data.name,
          rut: data.rut,
          email: data.email || null,
          phone: data.phone || null
        }
      });

      // Crear mensajes si existen
      if (data.messages && data.messages.length > 0) {
        await tx.message.createMany({
          data: data.messages.map(msg => ({
            text: msg.text,
            role: msg.role,
            sentAt: new Date(),
            clientId: client.id
          }))
        });
      }

      // Crear deudas si existen
      if (data.debts && data.debts.length > 0) {
        await tx.debt.createMany({
          data: data.debts.map(debt => ({
            institution: debt.institution,
            amount: debt.amount,
            dueDate: new Date(debt.dueDate),
            clientId: client.id
          }))
        });
      }

      // Retornar cliente con relaciones
      return await tx.client.findUnique({
        where: { id: client.id },
        include: {
          messages: {
            orderBy: {
              sentAt: 'desc'
            }
          },
          debts: {
            orderBy: {
              dueDate: 'asc'
            }
          }
        }
      }) as ClientWithRelations;
    });
  }

  /**
   * Crea un nuevo mensaje para un cliente existente
   * @param clientId - ID del cliente al que pertenece el mensaje
   * @param data - Datos del mensaje a crear
   * @returns Mensaje creado
   */
  static async createMessage(clientId: number, data: CreateMessageData) {
    const message = await prisma.message.create({
      data: {
        text: data.text,
        role: data.role,
        sentAt: new Date(),
        clientId: clientId
      }
    });

    return message;
  }

  /**
   * Obtiene las deudas de un cliente
   * Útil para determinar si el cliente puede acceder a financiamiento
   * @param clientId - ID del cliente
   * @returns Objeto con flag hasDebts y lista de deudas
   */
  static async getClientDebts(clientId: number): Promise<{ hasDebts: boolean; debts: any[] }> {
    const debts = await prisma.debt.findMany({
      where: { clientId },
      orderBy: {
        dueDate: 'asc'
      }
    });

    return {
      hasDebts: debts.length > 0,
      debts
    };
  }
}
