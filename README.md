# CRM Automotriz con Asistente de IA

Sistema CRM especializado para concesionarias automotrices que integra un asistente de IA (GPT-4o-mini) para generar mensajes de seguimiento personalizados. Desarrollado con React, TypeScript, Node.js/Koa y PostgreSQL.

## 🏗️ Arquitectura del Proyecto

```
.
├── api/                    # Backend API (Node.js + Koa + Prisma)
│   ├── src/
│   │   ├── services/       # Lógica de negocio y servicio de IA
│   │   ├── routes/         # Endpoints REST
│   │   └── lib/           # Utilidades y configuración
│   └── prisma/            # Schema DB y migraciones
├── web/                   # Frontend (React + TypeScript + Vite)
│   ├── src/
│   │   ├── components/    # Componentes React
│   │   ├── hooks/        # Custom hooks
│   │   └── types/        # Definiciones TypeScript
└── vistas/               # Screenshots de la aplicación
```

## 📋 Características Principales

### 🤖 Asistente de IA Inteligente
- **Generación contextual**: Mensajes personalizados basados en historial de conversaciones
- **Reglas de negocio**: Manejo automático de clientes con/sin deudas para ofertas de financiamiento
- **Configuración dinámica**: Tono, idioma, catálogo de vehículos y sucursales personalizables
- **Context-aware**: Utiliza conversaciones anteriores para evitar repeticiones

### 📊 Dashboard de Métricas
- Estadísticas en tiempo real de clientes activos vs seguimiento
- Gráficos de distribución y eficiencia del CRM
- Alertas automáticas para clientes que requieren atención

### 👥 Gestión de Clientes
- Separación visual por estado (activos/seguimiento)
- Vista detallada con historial completo de conversaciones
- Información de deudas y elegibilidad para financiamiento
- Creación y edición de clientes

### ⚙️ Configuración del Asistente
- Control total sobre la personalidad de la IA
- Gestión de catálogo (marcas, modelos, sucursales)
- Configuración de longitud de mensajes y uso de emojis
- Instrucciones adicionales personalizadas

## 🚀 Instrucciones de Instalación y Ejecución

### Prerrequisitos
- Docker y Docker Compose
- Node.js 18+ (para desarrollo local)
- Cuenta de OpenAI con API Key

### 1. Clonar el Repositorio
```bash
git clone <repository-url>
cd Relif_Test
```

### 2. Configurar Variables de Entorno
```bash
# Crear archivo .env en la carpeta api/
cp api/.env.example api/.env
```

Editar `api/.env` con tus datos:
```env
DATABASE_URL="postgresql://postgres:postgres@db:5432/automotora?schema=public"
OPENAI_API_KEY="sk-proj-TU_API_KEY_AQUI"
PORT=3000
```

### 3. Ejecutar con Docker (Recomendado)
```bash
# Iniciar todos los servicios
docker-compose up --build

# En segundo plano
docker-compose up -d --build
```

### 4. Acceder a la Aplicación
- **Frontend**: http://localhost:5173
- **API**: http://localhost:3000
- **Base de datos**: localhost:5432

### 5. Datos de Prueba
El sistema incluye datos de prueba automáticos con 6 clientes de ejemplo:
- Clientes con/sin deudas
- Diferentes estados de conversación
- Configuración predeterminada del asistente

### 6. Comandos Útiles
```bash
# Ver logs
docker-compose logs -f

# Reiniciar base de datos
docker-compose down -v
docker-compose up --build

# Ejecutar seed manualmente
docker-compose exec api npm run prisma:seed
```

### 7. Desarrollo Local (Opcional)
```bash
# Backend
cd api
npm install
npm run dev

# Frontend (nueva terminal)
cd web
npm install
npm run dev
```

## 🧠 Diseño y Arquitectura del Prompt de IA

### Experiencia Previa en Mintii
Durante mi trabajo en Mintii, tuve la oportunidad de trabajar con sistemas de prompt engineering donde la configuración del comportamiento del asistente era crucial. Esta experiencia me enseñó la importancia de:

1. **Contexto de conversaciones anteriores**: Fundamental para mantener coherencia y evitar repeticiones
2. **Reglas de negocio claras**: El prompt debe entender cuándo ofrecer financiamiento vs alternativas
3. **Personalización dinámica**: Cada empresa necesita ajustar el tono y catálogo según su marca

### Modelo Utilizado: GPT-4o-mini

**Elección del modelo**:
- **GPT-4o-mini**: Equilibrio perfecto entre calidad y costo
- **Latencia baja**: Respuestas rápidas para mejor UX
- **Suficiente capacidad**: Para mensajes de seguimiento comerciales
- **Costo-efectivo**: Ideal para alto volumen de mensajes

### Proceso de Desarrollo del Prompt

#### 1. Análisis de Requisitos
- Mensajes de seguimiento comercial para automotoras
- Manejo de información financiera sensible (deudas)
- Personalización por empresa (catálogo, sucursales, tono)
- Coherencia con conversaciones previas

#### 2. Estructura del Prompt Final

**System Prompt** (buildSystemPromptFromConfig):
```
You are "Carla", a sales executive at a Chilean car dealership...

Business rules:
- Sell only brand-new cars. Catalog: Toyota (Corolla, RAV4), Hyundai (Tucson, Elantra)...
- Financing eligibility: ONLY offer financing if client has NO overdue debts
- Context awareness: Use conversation history to write relevant follow-ups

Style and output:
- Spanish, 120-180 words, professional tone
- Include: greeting, 1-2 model suggestions, CTA for branch visit
- Sign with: "Carla — Automotora"
```

**Developer Prompt** (buildDeveloperPromptFromConfig):
```
Context: client name, RUT, hasDebts = true/false
- If hasDebts = true: NO financing, mention alternatives
- If hasDebts = false: MAY offer financing
- Use conversation history for contextual follow-ups
```

#### 3. Iteraciones de Mejora

**Versión 1**: Prompt estático
```
"Escribe un mensaje de seguimiento para un cliente de automotora"
```
❌ Problemas: Genérico, sin contexto de negocio

**Versión 2**: Reglas básicas
```
"Eres un vendedor de autos. Si el cliente tiene deudas, no ofrezcas financiamiento"
```
⚠️ Problemas: Sin personalización, tono inconsistente

**Versión 3**: Configuración dinámica (actual)
```typescript
function buildSystemPromptFromConfig(cfg) {
  // Construye prompt dinámico basado en configuración
  // Incluye catálogo, sucursales, tono, etc.
}
```
✅ Beneficios: Totalmente personalizable, coherente, específico del negocio

### Calidad y Explicación de la Generación

#### Factores de Calidad Implementados:

1. **Context Window Management**: Se incluyen las últimas conversaciones para mantener coherencia
2. **Business Logic Integration**: Las reglas de financiamiento están hardcodeadas en el prompt
3. **Dynamic Personalization**: Cada empresa puede tener su propia configuración
4. **Output Validation**: Control de longitud, tono y formato
5. **Error Handling**: Fallbacks en caso de fallas de API

#### Proceso de Generación:
1. **Cargar configuración** del asistente desde BD
2. **Construir System Prompt** dinámicamente con catálogo y reglas
3. **Incluir contexto** del cliente (nombre, RUT, deudas, historial)
4. **Llamar a OpenAI** con temperatura 0.7 para balance creatividad/consistencia
5. **Validar output** y guardar mensaje en BD automáticamente

## 🎨 Explicación del Diseño Frontend

### Filosofía de Diseño

El diseño del frontend se estructura siguiendo el flujo natural de trabajo de un vendedor de automotora:

#### 1. Dashboard como Punto de Entrada
**Decisión de diseño**: El dashboard es la vista inicial porque:
- **Visión general inmediata**: Los vendedores necesitan ver el estado general del CRM al llegar
- **Métricas clave**: Cuántos clientes requieren atención urgente
- **Eficiencia operativa**: Permite priorizar el trabajo del día
- **Motivación**: Ver el progreso y eficiencia genera engagement

**Elementos del dashboard**:
- Tarjetas de estadísticas visuales
- Gráficos de distribución de clientes
- Alertas de actividad reciente
- Indicadores de eficiencia

#### 2. Sección de Clientes Estratégicamente Organizada
**Separación por estado**:
- **Clientes que requieren seguimiento** (arriba): Prioridad máxima, destacados visualmente
- **Clientes activos** (abajo): Gestión de mantenimiento

**Por qué esta estructura**:
- **Priorización visual**: El rojo/naranja llama la atención sobre lo urgente
- **Flujo de trabajo eficiente**: Lo más importante está siempre visible primero
- **Reducción de errores**: Es imposible pasar por alto clientes que necesitan atención

#### 3. Configuración del Asistente Detallada
**Aspectos configurables organizados por categorías**:

**Identidad del Asistente**:
- Nombre personalizado (humaniza la interacción)
- Tono de voz (profesional, cercano, formal, amigable)
- Firma corporativa

**Catálogo de Negocio**:
- Marcas y modelos disponibles
- Sucursales activas
- Gestión dinámica (agregar/quitar)

**Configuración de Mensajes**:
- Longitud mínima y máxima
- Uso de emojis
- Instrucciones adicionales específicas

**Por qué esta granularidad**:
- **Adaptabilidad**: Cada concesionaria tiene su propia personalidad de marca
- **Control total**: Los gerentes pueden ajustar el asistente sin código
- **Consistencia**: Todos los mensajes siguen las mismas reglas
- **Escalabilidad**: Fácil agregar nuevos vehículos o sucursales

### Mejoras que Implementaría con Más Tiempo

- **Notificaciones push** para nuevas consultas y recordatorios de seguimiento
- **Analytics avanzado** con métricas de conversión y ventas por período
- **Scoring automático** de clientes basado en comportamiento de compra
- **Plantillas de mensajes** predefinidas para diferentes escenarios
- **App móvil** para vendedores en campo con acceso offline
- **Sistema de permisos** para diferentes roles de usuario
- **Análisis de sentimiento** en mensajes para priorizar clientes urgentes

## 🚀 Mejoras y Extensiones Propuestas

### Integraciones
- **WhatsApp Business API** para envío directo de mensajes
- **Salesforce/HubSpot** para sincronización de clientes
- **APIs bancarias** para preaprobación de créditos automática

### Funcionalidades Avanzadas
- **Múltiples concesionarias** en un solo sistema (SaaS)
- **Reconocimiento de voz** para transcribir llamadas telefónicas
- **Chatbot web** que derive leads automáticamente al CRM
- **Reportes automáticos** para gerencia con KPIs de ventas

### IA Mejorada
- **Predicción de compra** basada en patrones de comportamiento
- **Recomendación de modelos** según perfil del cliente
- **Optimización de horarios** para contactar clientes
- **Detección de urgencia** en mensajes para priorizar respuestas

## 📸 Capturas de Pantalla

El proyecto incluye 3 vistas principales documentadas en la carpeta `vistas/`:

- **vista1.png**: Dashboard principal con métricas y estadísticas
- **vista2.png**: Gestión de clientes con estados diferenciados
- **vista3.png**: Configuración detallada del asistente de IA

## 🛠️ Stack Tecnológico

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Koa.js (ligero y modular)
- **Base de Datos**: PostgreSQL + Prisma ORM
- **AI Integration**: OpenAI GPT-4o-mini
- **Validation**: Zod schemas
- **Containerization**: Docker

### Frontend
- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite (rápido y moderno)
- **State Management**: React hooks + Context
- **Styling**: CSS modules + CSS custom properties
- **HTTP Client**: Fetch API nativo

### DevOps & Deployment
- **Development**: Docker Compose
- **Production Ready**: Vercel config incluido
- **Database**: Migrations automáticas con Prisma
- **Environment**: Variables de entorno configurables
