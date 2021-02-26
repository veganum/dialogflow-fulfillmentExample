#https://dev.to/azure/desarrollo-de-aplicaciones-node-js-y-express-js-con-docker-4agm
# imagen que vamos a usar
FROM node:latest
# directorio donde vamos a instalarlo centro de la imagen
WORKDIR /app
# corremos todos los archivos que empiecen por package y que acaben en .json
# COPY package*.json ./
#Copiamos todos los arachivos
COPY . .
ENV PORT=3000
#dependencias node
RUN npm install
#puerto
EXPOSE $PORT
# que vamos a ejecutar
CMD ["npm","run dev"]