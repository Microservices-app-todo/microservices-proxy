# Usa una imagen base oficial de Node.js
FROM node:18-alpine

# Establece el directorio de trabajo
WORKDIR /app

# Copia package.json y package-lock.json (si existe)
COPY package*.json ./

# Instala dependencias
RUN npm install

# Copia el resto del código de la app
COPY . .


# Expone el puerto (por defecto usamos 3000)
EXPOSE 8085

# Comando para arrancar la app
CMD ["npm", "start"]
