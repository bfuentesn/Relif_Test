import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed de la base de datos...');
  console.log('🗑️  Limpiando datos existentes...');

  // Limpiar datos existentes
  await prisma.debt.deleteMany();
  await prisma.message.deleteMany();
  await prisma.client.deleteMany();
  await prisma.assistantConfig.deleteMany();

  console.log('✨ Creando datos de prueba...');

  // ==========================================
  // CLIENTE 1: Juan Pérez
  // Requiere seguimiento (mensajes >7 días)
  // CON deudas (no puede financiar)
  // ==========================================
  const juan = await prisma.client.create({
    data: {
      name: 'Juan Pérez',
      rut: '12.345.678-9',
      email: 'juan.perez@email.com',
      phone: '+56912345678'
    }
  });

  await prisma.debt.createMany({
    data: [
      {
        institution: 'Banco Estado',
        amount: 1500000,
        dueDate: new Date('2025-02-15'),
        clientId: juan.id
      },
      {
        institution: 'Caja Los Andes',
        amount: 800000,
        dueDate: new Date('2025-03-10'),
        clientId: juan.id
      }
    ]
  });

  const tenDaysAgo = new Date();
  tenDaysAgo.setDate(tenDaysAgo.getDate() - 10);
  const eightDaysAgo = new Date();
  eightDaysAgo.setDate(eightDaysAgo.getDate() - 8);

  await prisma.message.createMany({
    data: [
      {
        text: 'Hola, me interesa el Toyota Corolla. ¿Podrían enviarme información?',
        role: 'client',
        sentAt: tenDaysAgo,
        clientId: juan.id
      },
      {
        text: 'Hola Juan, ¡gracias por tu interés! El Toyota Corolla es una excelente elección. Te envío información por email. ¿Te gustaría agendar una visita a nuestra sucursal?',
        role: 'agent',
        sentAt: eightDaysAgo,
        clientId: juan.id
      }
    ]
  });

  // ==========================================
  // CLIENTE 2: María González
  // Activo (mensajes <7 días)
  // SIN deudas (puede financiar)
  // ==========================================
  const maria = await prisma.client.create({
    data: {
      name: 'María González',
      rut: '20.455.223-4',
      email: 'maria.gonzalez@email.com',
      phone: '+56987654321'
    }
  });

  const threeDaysAgo = new Date();
  threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
  const twoDaysAgo = new Date();
  twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

  await prisma.message.createMany({
    data: [
      {
        text: 'Buenos días, estoy interesada en el Hyundai Tucson. ¿Tienen disponibilidad en color blanco?',
        role: 'client',
        sentAt: threeDaysAgo,
        clientId: maria.id
      },
      {
        text: '¡Hola María! Sí, tenemos el Hyundai Tucson en blanco disponible en nuestra sucursal de Providencia. Además, contamos con excelentes opciones de financiamiento. ¿Te gustaría agendar una prueba de manejo?',
        role: 'agent',
        sentAt: twoDaysAgo,
        clientId: maria.id
      }
    ]
  });

  // ==========================================
  // CLIENTE 3: Carlos Rojas
  // Requiere seguimiento (sin mensajes)
  // CON deudas vencidas
  // ==========================================
  const carlos = await prisma.client.create({
    data: {
      name: 'Carlos Rojas',
      rut: '16.789.456-2',
      email: 'carlos.rojas@email.com',
      phone: '+56923456789'
    }
  });

  await prisma.debt.createMany({
    data: [
      {
        institution: 'Banco de Chile',
        amount: 2500000,
        dueDate: new Date('2024-12-20'),
        clientId: carlos.id
      }
    ]
  });

  // ==========================================
  // CLIENTE 4: Andrea Silva
  // Requiere seguimiento (sin mensajes)
  // SIN deudas
  // ==========================================
  const andrea = await prisma.client.create({
    data: {
      name: 'Andrea Silva',
      rut: '18.234.567-8',
      email: 'andrea.silva@email.com',
      phone: '+56945678901'
    }
  });

  // ==========================================
  // CLIENTE 5: Roberto Muñoz
  // Activo (mensaje reciente)
  // CON deuda pero puede consultar
  // ==========================================
  const roberto = await prisma.client.create({
    data: {
      name: 'Roberto Muñoz',
      rut: '14.567.890-1',
      email: 'roberto.munoz@email.com',
      phone: '+56956789012'
    }
  });

  await prisma.debt.createMany({
    data: [
      {
        institution: 'Ripley',
        amount: 500000,
        dueDate: new Date('2025-04-30'),
        clientId: roberto.id
      }
    ]
  });

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  await prisma.message.createMany({
    data: [
      {
        text: 'Hola, vi en su página el Chevrolet Tracker. ¿Qué colores tienen disponibles?',
        role: 'client',
        sentAt: yesterday,
        clientId: roberto.id
      }
    ]
  });

  // ==========================================
  // CLIENTE 6: Patricia Vega
  // Activo (conversación completa)
  // SIN deudas (candidata ideal para financiamiento)
  // ==========================================
  const patricia = await prisma.client.create({
    data: {
      name: 'Patricia Vega',
      rut: '19.876.543-2',
      email: 'patricia.vega@email.com',
      phone: '+56967890123'
    }
  });

  const fiveDaysAgo = new Date();
  fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);
  const fourDaysAgo = new Date();
  fourDaysAgo.setDate(fourDaysAgo.getDate() - 4);
  const oneDayAgo = new Date();
  oneDayAgo.setDate(oneDayAgo.getDate() - 1);

  await prisma.message.createMany({
    data: [
      {
        text: 'Buenos días, estoy buscando un auto familiar. ¿Qué me recomiendan?',
        role: 'client',
        sentAt: fiveDaysAgo,
        clientId: patricia.id
      },
      {
        text: 'Hola Patricia, para familias recomendamos el Toyota RAV4 o el Hyundai Tucson. Ambos tienen excelente espacio, seguridad y consumo eficiente. ¿Tienes alguna preferencia de marca o presupuesto?',
        role: 'agent',
        sentAt: fourDaysAgo,
        clientId: patricia.id
      },
      {
        text: 'Me gusta el RAV4. ¿Tienen opciones de financiamiento?',
        role: 'client',
        sentAt: oneDayAgo,
        clientId: patricia.id
      }
    ]
  });

  // ==========================================
  // CONFIGURACIÓN DEL ASISTENTE
  // ==========================================
  await prisma.assistantConfig.create({
    data: {
      name: 'Carla',
      tone: 'profesional',
      language: 'es',
      brands: ['Toyota', 'Hyundai', 'Chevrolet', 'Suzuki', 'Mazda'],
      models: {
        Toyota: ['Corolla', 'RAV4', 'Yaris'],
        Hyundai: ['Tucson', 'Elantra', 'Creta'],
        Chevrolet: ['Tracker', 'Onix', 'Cruze'],
        Suzuki: ['Swift', 'Vitara'],
        Mazda: ['CX-5', 'Mazda3']
      },
      branches: ['Providencia', 'Maipú', 'La Florida'],
      messageLengthMin: 120,
      messageLengthMax: 180,
      signature: 'Carla — Automotora',
      useEmojis: true,
      additionalInstructions: 'Prioriza modelos híbridos cuando el cliente mencione eficiencia.'
    }
  });

  console.log('\n✅ Seed completado exitosamente!\n');
  console.log('═══════════════════════════════════════════════');
  console.log('📊 CLIENTES CREADOS:');
  console.log('═══════════════════════════════════════════════');
  console.log(`\n🔴 REQUIEREN SEGUIMIENTO (${[juan.id, carlos.id, andrea.id].length}):`);
  console.log(`   1. Juan Pérez (ID: ${juan.id})`);
  console.log(`      - RUT: 12.345.678-9`);
  console.log(`      - Estado: Mensajes antiguos (>7 días)`);
  console.log(`      - Deudas: SÍ (Banco Estado $1.500.000, Caja Los Andes $800.000)`);
  console.log(`      - IA sugerirá: Pago al contado o regularización de deudas`);
  console.log(`\n   2. Carlos Rojas (ID: ${carlos.id})`);
  console.log(`      - RUT: 16.789.456-2`);
  console.log(`      - Estado: Sin mensajes`);
  console.log(`      - Deudas: SÍ (Banco de Chile $2.500.000 VENCIDA)`);
  console.log(`      - IA sugerirá: Regularización antes de financiar`);
  console.log(`\n   3. Andrea Silva (ID: ${andrea.id})`);
  console.log(`      - RUT: 18.234.567-8`);
  console.log(`      - Estado: Sin mensajes`);
  console.log(`      - Deudas: NO`);
  console.log(`      - IA sugerirá: Financiamiento disponible + oferta de modelos`);
  console.log(`\n✅ CLIENTES ACTIVOS (${[maria.id, roberto.id, patricia.id].length}):`);
  console.log(`   4. María González (ID: ${maria.id})`);
  console.log(`      - RUT: 20.455.223-4`);
  console.log(`      - Estado: Mensajes recientes (<7 días)`);
  console.log(`      - Deudas: NO`);
  console.log(`      - Interés: Hyundai Tucson blanco`);
  console.log(`\n   5. Roberto Muñoz (ID: ${roberto.id})`);
  console.log(`      - RUT: 14.567.890-1`);
  console.log(`      - Estado: Mensaje reciente`);
  console.log(`      - Deudas: SÍ (Ripley $500.000)`);
  console.log(`      - Interés: Chevrolet Tracker`);
  console.log(`\n   6. Patricia Vega (ID: ${patricia.id})`);
  console.log(`      - RUT: 19.876.543-2`);
  console.log(`      - Estado: Conversación activa`);
  console.log(`      - Deudas: NO (¡Candidata ideal para financiamiento!)`);
  console.log(`      - Interés: Toyota RAV4 familiar`);
  console.log('\n═══════════════════════════════════════════════');
  console.log('🤖 CONFIGURACIÓN DEL ASISTENTE:');
  console.log('═══════════════════════════════════════════════');
  console.log('   - Nombre: Carla');
  console.log('   - Tono: Profesional');
  console.log('   - Idioma: Español');
  console.log('   - Marcas: Toyota, Hyundai, Chevrolet, Suzuki, Mazda');
  console.log('   - Sucursales: Providencia, Maipú, La Florida');
  console.log('   - Emojis: Activados');
  console.log('\n═══════════════════════════════════════════════');
  console.log('🎯 CASOS DE PRUEBA DISPONIBLES:');
  console.log('═══════════════════════════════════════════════');
  console.log('   ✅ Cliente con deudas (mensaje sin financiamiento)');
  console.log('   ✅ Cliente sin deudas (mensaje con financiamiento)');
  console.log('   ✅ Cliente activo vs requiere seguimiento');
  console.log('   ✅ Cliente sin historial');
  console.log('   ✅ Cliente con conversación completa');
  console.log('   ✅ Diferentes estados de deuda');
  console.log('\n🚀 ¡Listo para probar todas las funcionalidades!\n');
}

main()
  .catch((e) => {
    console.error('❌ Error durante el seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
