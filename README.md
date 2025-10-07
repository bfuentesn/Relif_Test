# Automotora CRM - Monorepo

Este es un monorepo que contiene una aplicación CRM para una automotora con backend API (Node.js + Koa + Prisma + PostgreSQL) y frontend web (React + Vite).

## Estructura del proyecto

```
.
├─ docker-compose.yml
├─ README.md
├─ api/                    # Backend API
│  ├─ src/
│  │  ├─ server.ts
│  │  ├─ routes/
│  │  ├─ services/
│  │  ├─ lib/
│  │  ├─ middleware/
│  │  └─ types/
│  ├─ prisma/
│  ├─ .env.example
│  ├─ package.json
│  └─ Dockerfile
└─ web/                    # Frontend React
   ├─ src/
   │  ├─ components/
   │  ├─ hooks/
   │  └─ types.ts
   ├─ .env.example
   ├─ package.json
   └─ Dockerfile
```

## Tecnologías utilizadas

### Backend
- Node.js + TypeScript
- Koa.js (framework web)
- Prisma (ORM)
- PostgreSQL (base de datos)
- OpenAI API (generación de mensajes)

### Frontend
- React + TypeScript
- Vite (build tool)
- Fetch API para comunicación con backend

## Configuración y ejecución

### Con Docker Compose (Recomendado)

1. **Clonar el repositorio y configurar variables de entorno:**

```bash
# Copiar archivos de ejemplo de variables de entorno
cp api/.env.example api/.env
cp web/.env.example web/.env

# Editar api/.env y agregar tu OPENAI_API_KEY
# DATABASE_URL="postgresql://postgres:postgres@localhost:5432/automotora?schema=public"
# OPENAI_API_KEY="tu_api_key_aqui"
# PORT=3000
```

2. **Levantar todos los servicios:**

```bash
docker-compose up --build
```

Esto levantará:
- PostgreSQL en puerto 5432
- API en puerto 3000
- Web en puerto 5173

3. **Ejecutar migraciones y seed:**

```bash
# En otra terminal
docker-compose exec api npx prisma migrate deploy
docker-compose exec api npx prisma db seed
```

### Desarrollo local

Si prefieres ejecutar sin Docker:

1. **Configurar PostgreSQL localmente**
2. **Instalar dependencias:**

```bash
cd api && npm install
cd ../web && npm install
```

3. **Configurar variables de entorno** (copiar .env.example a .env)
4. **Ejecutar migraciones:**

```bash
cd api
npx prisma migrate dev --name init
npx prisma db seed
```

5. **Levantar servicios:**

```bash
# Terminal 1 - API
cd api && npm run dev

# Terminal 2 - Web
cd web && npm run dev
```

## Variables de entorno

### API (.env)
```
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/automotora?schema=public"
OPENAI_API_KEY="tu_api_key_de_openai"
PORT=3000
```

### Web (.env)
```
VITE_API_URL="http://localhost:3000"
```

## API Endpoints

### Health Check
```bash
curl http://localhost:3000/health
# Respuesta: {"status":"ok"}
```

### Clientes
```bash
# Obtener todos los clientes
curl http://localhost:3000/clients

# Obtener cliente específico
curl http://localhost:3000/clients/1

# Obtener clientes que requieren seguimiento
curl http://localhost:3000/clients-to-do-follow-up

# Crear nuevo cliente
curl -X POST http://localhost:3000/clients \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Juan Pérez",
    "rut": "12345678-9",
    "email": "juan@email.com",
    "phone": "+56912345678",
    "messages": [
      {
        "text": "Hola, me interesa el Corolla",
        "role": "client"
      }
    ],
    "debts": []
  }'
```

### Mensajes
```bash
# Crear mensaje para un cliente
curl -X POST http://localhost:3000/clients/1/messages \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Gracias por contactarnos",
    "role": "agent"
  }'

# Generar mensaje de seguimiento con IA
curl http://localhost:3000/clients/1/generateMessage
```

## Modelos de datos

### Client
- `id`: ID único (autoincrement)
- `name`: Nombre del cliente
- `rut`: RUT único
- `email`: Email opcional único
- `phone`: Teléfono opcional

### Message
- `id`: ID único (autoincrement)
- `text`: Contenido del mensaje
- `role`: "client" o "agent"
- `sentAt`: Fecha y hora de envío
- `clientId`: Referencia al cliente

### Debt
- `id`: ID único (autoincrement)
- `institution`: Institución de la deuda
- `amount`: Monto en pesos chilenos
- `dueDate`: Fecha de vencimiento
- `clientId`: Referencia al cliente

## Funcionalidades

### Backend
- API REST con Koa.js
- ORM con Prisma para PostgreSQL
- Validación de datos
- Manejo de errores
- Integración con OpenAI para generación de mensajes
- CORS habilitado para frontend

### Frontend
- Tablero con dos listas: clientes que requieren seguimiento y clientes activos
- Detalle de cliente con historial de mensajes y deudas
- Generación automática de mensajes de seguimiento con IA
- Interfaz responsive y moderna

### IA (OpenAI)
- Genera mensajes personalizados en español
- Considera el estado financiero del cliente (deudas)
- Sugiere modelos de autos disponibles
- Tono profesional y cercano
- Longitud optimizada (120-180 palabras)

## Scripts disponibles

### API
```bash
npm run dev          # Desarrollo con tsx
npm run build        # Compilar TypeScript
npm run start        # Ejecutar versión compilada
npm run prisma:migrate # Ejecutar migraciones
npm run prisma:seed  # Poblar base de datos
```

### Web
```bash
npm run dev          # Desarrollo con Vite
npm run build        # Compilar para producción
npm run preview      # Preview de la build
```

## Notas importantes

- La base de datos se inicializa automáticamente con datos de prueba
- Los mensajes de IA se generan usando OpenAI GPT-4o-mini
- El sistema considera clientes para seguimiento si su último mensaje fue hace más de 7 días
- La financiación solo se ofrece a clientes sin deudas pendientes
- Todos los textos generados por IA están en español neutro chileno