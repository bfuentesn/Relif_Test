# API Dockerfile
FROM node:18-slim

# Instalar dependencias del sistema necesarias para Prisma y herramientas globales
RUN apt-get update && apt-get install -y \
    openssl \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/* \
    && npm install -g wait-on

# Crear usuario no root y directorio home
RUN groupadd -r appuser && \
    useradd -r -g appuser -m -d /home/appuser appuser && \
    mkdir -p /home/appuser/.npm && \
    chown -R appuser:appuser /home/appuser

WORKDIR /app

# Establecer propiedad del directorio de trabajo
RUN chown -R appuser:appuser /app

# Cambiar al usuario no root
USER appuser

# Copiar archivos de dependencias
COPY --chown=appuser:appuser package*.json ./

# Instalar dependencias
RUN npm install

# Copiar código fuente
COPY --chown=appuser:appuser . .

# Limpiar completamente y regenerar cliente de Prisma
RUN rm -rf node_modules/.prisma node_modules/@prisma/client && \
    PRISMA_CLI_BINARY_TARGETS=debian-openssl-3.0.x npx prisma generate

# Instalar tipos de TypeScript necesarios
RUN npm install --save-dev @types/node @types/koa @types/koa-bodyparser @types/koa-json @types/koa__cors

# Compilar TypeScript
RUN npm run build

# Exponer puerto
EXPOSE 3000

# Copiar y dar permisos al script de inicio
COPY --chown=appuser:appuser scripts/start.sh /app/scripts/start.sh
RUN chmod +x /app/scripts/start.sh

# Comando para desarrollo
CMD ["sh", "/app/scripts/start.sh"]
