# API Dockerfile
FROM node:18-slim

# Instalar dependencias del sistema necesarias para Prisma
RUN apt-get update && apt-get install -y \
    openssl \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias
RUN npm install

# Copiar código fuente
COPY . .

# Limpiar completamente y regenerar cliente de Prisma
RUN rm -rf node_modules/.prisma node_modules/@prisma/client && \
    PRISMA_CLI_BINARY_TARGETS=debian-openssl-3.0.x npx prisma generate

# Compilar TypeScript
RUN npm run build

# Exponer puerto
EXPOSE 3000

# Comando para desarrollo (usar tsx)
CMD ["npm", "run", "dev"]
