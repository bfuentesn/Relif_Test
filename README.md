# 🚗 Relif Test - Sistema de Gestión de Clientes con IA

Sistema completo de gestión de clientes para automotoras con asistente de IA integrado para seguimiento personalizado.

## 📋 Descripción

Este proyecto es una aplicación full-stack que permite:
- ✅ Gestionar clientes y sus interacciones
- ✅ Generar mensajes de seguimiento personalizados con IA
- ✅ Configurar el comportamiento del asistente de IA
- ✅ Rastrear deudas de clientes para determinar elegibilidad de financiamiento
- ✅ Visualizar clientes que requieren seguimiento

## 🏗️ Arquitectura

### Backend (API)
- **Framework**: Koa.js + TypeScript
- **Base de Datos**: PostgreSQL con Prisma ORM
- **IA**: OpenAI GPT-4o-mini
- **Validación**: Zod
- **Estructura**:
  ```
  api/
  ├── src/
  │   ├── routes/          # Endpoints REST
  │   ├── services/        # Lógica de negocio
  │   ├── lib/             # Utilidades y configuración
  │   ├── middleware/      # Middleware de Koa
  │   └── types/           # Definiciones TypeScript
  ├── prisma/
  │   ├── schema.prisma    # Schema de base de datos
  │   └── migrations/      # Migraciones de BD
  └── scripts/             # Scripts de inicialización
  ```

### Frontend (Web)
- **Framework**: React + TypeScript + Vite
- **Estilo**: CSS moderno con variables
- **Estado**: React Hooks
- **Estructura**:
  ```
  web/
  ├── src/
  │   ├── components/      # Componentes React
  │   ├── hooks/           # Hooks personalizados
  │   ├── types/           # Tipos TypeScript
  │   └── api.ts           # Cliente API
  └── public/              # Assets estáticos
  ```

## �� Instalación y Configuración

### Requisitos Previos
- Node.js 18+ 
- PostgreSQL 14+
- Docker y Docker Compose (opcional)

### Variables de Entorno

#### **Configuración Simplificada** ✨

Solo necesitas configurar **un archivo**: `api/.env`

```bash
# 1. Copiar el archivo de ejemplo
cp api/.env.example api/.env

# 2. Editar y agregar tu API Key de OpenAI
# api/.env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/automotora?schema=public"
OPENAI_API_KEY="sk-proj-tu-api-key-aqui"  # Obtén tu key en: https://platform.openai.com/api-keys
PORT=3000
```

**Nota:** Este mismo archivo `.env` funciona tanto para desarrollo local como para Docker Compose.
📖 Ver [CONFIGURACION_ENV.md](./CONFIGURACION_ENV.md) para detalles completos.

### Instalación con Docker (Recomendado)

```bash
# 1. Configurar variables de entorno (solo la primera vez)
cp api/.env.example api/.env
# Edita api/.env y agrega tu OPENAI_API_KEY

# 2. Iniciar servicios
docker-compose up -d

# 3. El sistema estará disponible en:
# - Frontend: http://localhost:5173
# - Backend: http://localhost:3000

# 4. (Opcional) Poblar base de datos con datos de prueba
docker-compose exec api npx prisma db seed
```

### Instalación Manual

**Backend**:
```bash
cd api
npm install
npx prisma generate
npx prisma migrate dev
npm run dev
```

**Frontend**:
```bash
cd web
npm install
npm run dev
```

## 📚 API Endpoints

### Clientes

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/clients` | Lista todos los clientes (id, name, rut) |
| GET | `/clients/:id` | Obtiene un cliente con mensajes y deudas |
| GET | `/clients-to-do-follow-up` | Clientes que necesitan seguimiento |
| POST | `/client` | Crea un nuevo cliente |
| POST | `/clients/:id/messages` | Crea un mensaje para un cliente |
| GET | `/clients/:id/generateMessage` | Genera mensaje de IA para cliente |

### Configuración del Asistente

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/assistant/config` | Obtiene configuración del asistente |
| PUT | `/assistant/config` | Actualiza configuración del asistente |

### Health Check

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/health` | Verifica estado del servicio |

## 🤖 Configuración del Asistente de IA

El asistente puede ser personalizado con:

- **Identidad**: Nombre, firma, tono de voz (profesional, cercano, formal, amigable)
- **Idioma**: Español o Inglés
- **Catálogo**: Marcas y modelos de vehículos disponibles
- **Sucursales**: Ubicaciones de la automotora
- **Mensajes**: Longitud min/max, uso de emojis
- **Instrucciones adicionales**: Guías personalizadas para el prompt

## 🎨 Características de Clean Code Implementadas

### Organización
✅ Código modularizado por responsabilidades  
✅ Separación clara de capas (routes, services, types)  
✅ Nombres descriptivos y consistentes  

### Documentación
✅ Comentarios JSDoc en todas las funciones públicas  
✅ Explicaciones de lógica compleja  
✅ README detallado  

### Calidad
✅ TypeScript estricto en todo el proyecto  
✅ Validación de datos con Zod  
✅ Manejo consistente de errores  
✅ Sin errores de compilación  

### Mejores Prácticas
✅ Transacciones para operaciones críticas  
✅ Separación de concerns (UI, lógica, datos)  
✅ Prompts dinámicos basados en configuración  
✅ Reutilización de código mediante servicios  

## 🔧 Scripts Útiles

### Backend
```bash
npm run dev         # Desarrollo con hot-reload
npm run build       # Compilar TypeScript
npm start           # Producción
npm run migrate     # Ejecutar migraciones
```

### Frontend
```bash
npm run dev         # Desarrollo con hot-reload
npm run build       # Build para producción
npm run preview     # Preview de producción
```

## 📝 Modelo de Datos

### Client
- id, name, rut (único), email, phone
- timestamps (createdAt, updatedAt)
- Relaciones: messages[], debts[]

### Message
- id, text, role (client|agent), sentAt
- Relación: client

### Debt
- id, institution, amount, dueDate
- Relación: client

### AssistantConfig
- Configuración única del asistente
- Nombre, tono, idioma, catálogo, etc.

## 🎯 Flujo de Generación de Mensajes

1. Usuario selecciona cliente que necesita seguimiento
2. Sistema verifica si el cliente tiene deudas
3. Se construye el prompt dinámicamente basado en:
   - Configuración del asistente
   - Datos del cliente (nombre, RUT)
   - Estado de deudas
4. OpenAI genera mensaje personalizado
5. Mensaje se guarda automáticamente en BD
6. Usuario puede editar antes de enviar

## 🔒 Seguridad

- Validación de entrada con Zod
- Transacciones para integridad de datos
- Variables de entorno para secretos
- CORS configurado
- Sanitización de errores al cliente

## 🐛 Debugging

Ver logs en tiempo real:
```bash
docker-compose logs -f api
docker-compose logs -f web
```

## 📄 Licencia

MIT

## 👥 Contribución

Este proyecto fue refactorizado siguiendo principios de Clean Code:
- Comentarios descriptivos
- Código organizado y modular
- Sin errores de compilación
- Documentación completa
