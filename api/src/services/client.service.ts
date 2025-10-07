import { prisma } from '../lib/prisma';
import { CreateClientData, CreateMessageData, ClientWithRelations } from '../types';

export class ClientService {
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

  static async getClientsToDoFollowUp(): Promise<Pick<ClientWithRelations, 'id' | 'name' | 'rut'>[]> {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // Clientes sin mensajes
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

    // Clientes con último mensaje hace más de 7 días
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

    // Combinar y eliminar duplicados
    const allClients = [...clientsWithoutMessages, ...clientsWithOldMessages];
    const uniqueClients = allClients.filter((client, index, self) => 
      index === self.findIndex(c => c.id === client.id)
    );

    return uniqueClients.sort((a, b) => a.name.localeCompare(b.name));
  }

  static async createClient(data: CreateClientData): Promise<ClientWithRelations> {
    return await prisma.$transaction(async (tx) => {
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
