# Immagine unica: lo stesso processo serve la pagina, le API e il WebSocket.
# Funziona su Render, Railway, Fly.io e qualunque host che tenga vivo un container.
FROM node:22-slim

WORKDIR /app

# better-sqlite3 e' un modulo nativo: se per la piattaforma non esiste un
# binario precompilato, questi pacchetti permettono di compilarlo.
RUN apt-get update \
 && apt-get install -y --no-install-recommends python3 make g++ \
 && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# build del client: finisce in server/public, servito da Fastify
RUN npm run build

ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000

# archivio partite: montare un volume qui per conservarlo tra un deploy e l'altro
VOLUME ["/app/server/data"]

CMD ["npm", "start"]
