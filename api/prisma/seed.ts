import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed de la base de datos...');

  // Limpiar datos existentes
  await prisma.debt.deleteMany();
  await prisma.message.deleteMany();
  await prisma.client.deleteMany();

  // Crear cliente 1: Juan Pérez - con deudas y mensajes antiguos (>7 días)
  const juan = await prisma.client.create({
    data: {
      name: 'Juan Pérez',
      rut: '12345678-9',
      email: 'juan.perez@email.com',
      phone: '+56912345678'
    }
  });

  // Crear deudas para Juan
  await prisma.debt.createMany({
    data: [
      {
        institution: 'Banco Estado',
        amount: 1500000,
        dueDate: new Date('2024-02-15'),
        clientId: juan.id
      },
      {
        institution: 'Caja Los Andes',
        amount: 800000,
        dueDate: new Date('2024-03-10'),
        clientId: juan.id
      }
    ]
  });

  // Crear mensajes antiguos para Juan (>7 días)
  const eightDaysAgo = new Date();
  eightDaysAgo.setDate(eightDaysAgo.getDate() - 8);

  const tenDaysAgo = new Date();
  tenDaysAgo.setDate(tenDaysAgo.getDate() - 10);

  await prisma.message.createMany({
    data: [
      {
        text: 'Hola, me interesa el Toyota Corolla. ¿Podrían enviarme información?',
        role: 'client',
        sentAt: tenDaysAgo,
        clientId: juan.id
      },
      {
        text: 'Hola Juan, gracias por tu interés. Te envío información del Corolla por email.',
        role: 'agent',
        sentAt: eightDaysAgo,
        clientId: juan.id
      }
    ]
  });

  // Crear cliente 2: Pedro Soto - con mensajes recientes y sin deudas
  const pedro = await prisma.client.create({
    data: {
      name: 'Pedro Soto',
      rut: '87654321-0',
      email: 'pedro.soto@email.com',
      phone: '+56987654321'
    }
  });

  // Crear mensajes recientes para Pedro (<7 días)
  const twoDaysAgo = new Date();
  twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

  const oneDayAgo = new Date();
  oneDayAgo.setDate(oneDayAgo.getDate() - 1);

  await prisma.message.createMany({
    data: [
      {
        text: '¿Tienen el Hyundai Tucson en color blanco disponible?',
        role: 'client',
        sentAt: twoDaysAgo,
        clientId: pedro.id
      },
      {
        text: 'Sí Pedro, tenemos el Tucson en blanco disponible. ¿Te gustaría agendar una visita?',
        role: 'agent',
        sentAt: oneDayAgo,
        clientId: pedro.id
      }
    ]
  });

  // Crear cliente 3: Ana Díaz - sin mensajes (queda en seguimiento)
  const ana = await prisma.client.create({
    data: {
      name: 'Ana Díaz',
      rut: '11223344-5',
      email: 'ana.diaz@email.com',
      phone: '+56911223344'
    }
  });

  console.log('✅ Seed completado exitosamente');
  console.log('📊 Clientes creados:');
  console.log(`   - Juan Pérez (ID: ${juan.id}) - Con deudas y mensajes antiguos`);
  console.log(`   - Pedro Soto (ID: ${pedro.id}) - Con mensajes recientes, sin deudas`);
  console.log(`   - Ana Díaz (ID: ${ana.id}) - Sin mensajes`);
}

main()
  .catch((e) => {
    console.error('❌ Error durante el seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
