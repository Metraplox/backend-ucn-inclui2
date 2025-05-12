# Usa una imagen oficial de Node.js como base
FROM node:18-alpine AS development

# Establece el directorio de trabajo en el contenedor
WORKDIR /usr/src/app

# Copia package.json y package-lock.json (o yarn.lock)
COPY package*.json ./

# Instala las dependencias del proyecto
RUN npm install --only=development

# Copia el resto de los archivos de la aplicación
COPY . .

# Construye la aplicación para producción
RUN npm run build

# Etapa de producción
FROM node:18-alpine AS production

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install --only=production

# Copia los artefactos de compilación de la etapa de desarrollo
COPY --from=development /usr/src/app/dist ./dist

# Expone el puerto en el que la aplicación se ejecuta
EXPOSE 3000

# Comando para ejecutar la aplicación
CMD ["node", "dist/main"]
