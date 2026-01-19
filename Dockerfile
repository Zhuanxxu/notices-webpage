# Dockerfile para el backend
FROM node:18-alpine

WORKDIR /app

# Copiar archivos de dependencias
COPY backend/package*.json ./
RUN npm install

# Copiar el resto del código
COPY backend/ ./

# Crear directorio de uploads
RUN mkdir -p uploads

# Exponer el puerto
EXPOSE 3001

# Comando para iniciar
CMD ["node", "server.js"]
