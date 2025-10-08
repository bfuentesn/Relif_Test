/**
 * Servicio para gestionar operaciones relacionadas con clientes
 * Proporciona métodos para CRUD de clientes, mensajes y consultas especializadas
 */
import { prisma } from '../lib/prisma';
import { CreateClientData, CreateMessageData, ClientWithRelations } from '../types';
import { FOLLOW_UP_CONFIG } from '../utils/constants';

/**
 * Tipo para cliente básico (solo campos públicos)
 */
type BasicClient = Pick<ClientWithRelations, 'id' | 'name' | 'rut'>;

/**
 * Tipo para resultado de deudas de cliente
 */
interface ClientDebtsResult {
  hasDebts: boolean;
  debts: Array<{
    id: number;
    institution: string;
    amount: number;
    dueDate: Date;
    clientId: number;
    createdAt: Date;
    updatedAt: Date;
  }>;
}

export class ClientService {
  /**
   * Obtiene todos los clientes con información básica
   * Solo retorna id, name y rut para optimizar la consulta
   */
  static async getAllClients(): Promise<BasicClient[]> {
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
   * Criterios: sin mensajes o con último mensaje hace más de X días (configurable)
   */
  static async getClientsToDoFollowUp(): Promise<BasicClient[]> {
    const followUpDate = new Date();
    followUpDate.setDate(followUpDate.getDate() - FOLLOW_UP_CONFIG.DAYS_WITHOUT_MESSAGES);

    // Optimización: usar una sola consulta con operadores OR
    const clients = await prisma.client.findMany({
      where: {
        OR: [
          // Clientes sin mensajes
          {
            messages: {
              none: {}
            }
          },
          // Clientes con último mensaje antiguo
          {
            AND: [
              {
                messages: {
                  some: {}
                }
              },
              {
                NOT: {
                  messages: {
                    some: {
                      sentAt: {
                        gt: followUpDate
                      }
                    }
                  }
                }
              }
            ]
          }
        ]
      },
      select: {
        id: true,
        name: true,
        rut: true
      },
      orderBy: {
        name: 'asc'
      }
    });

    return clients;
  }

  /**
   * Crea un nuevo cliente con sus mensajes y deudas iniciales
   * Usa una transacción para garantizar la consistencia de los datos
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
        const messageData = data.messages.map((msg: any) => ({
          text: msg.text,
          role: msg.role,
          sentAt: new Date(),
          clientId: client.id
        }));

        await tx.message.createMany({
          data: messageData
        });
      }

      // Crear deudas si existen
      if (data.debts && data.debts.length > 0) {
        const debtData = data.debts.map((debt: any) => ({
          institution: debt.institution,
          amount: debt.amount,
          dueDate: new Date(debt.dueDate),
          clientId: client.id
        }));

        await tx.debt.createMany({
          data: debtData
        });
      }

      // Retornar cliente con relaciones
      const clientWithRelations = await tx.client.findUnique({
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
      });

      if (!clientWithRelations) {
        throw new Error('Error al recuperar el cliente creado');
      }

      return clientWithRelations;
    });
  }

  /**
   * Crea un nuevo mensaje para un cliente existente
   */
  static async createMessage(clientId: number, data: CreateMessageData) {
    return await prisma.message.create({
      data: {
        text: data.text,
        role: data.role,
        sentAt: new Date(),
        clientId: clientId
      }
    });
  }

  /**
   * Obtiene las deudas de un cliente
   * Útil para determinar si el cliente puede acceder a financiamiento
   */
  static async getClientDebts(clientId: number): Promise<ClientDebtsResult> {
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

  /**
   * Verifica si un cliente existe
   * Método auxiliar para validaciones rápidas
   */
  static async clientExists(id: number): Promise<boolean> {
    const count = await prisma.client.count({
      where: { id }
    });
    return count > 0;
  }

  /**
   * Obtiene estadísticas básicas de clientes
   * Útil para dashboards y métricas
   */
  static async getClientStats(): Promise<{
    total: number;
    needFollowUp: number;
    withDebts: number;
    withoutDebts: number;
  }> {
    const [total, followUpClients, clientsWithDebts] = await Promise.all([
      prisma.client.count(),
      this.getClientsToDoFollowUp(),
      prisma.client.count({
        where: {
          debts: {
            some: {}
          }
        }
      })
    ]);

    return {
      total,
      needFollowUp: followUpClients.length,
      withDebts: clientsWithDebts,
      withoutDebts: total - clientsWithDebts
    };
  }
}
