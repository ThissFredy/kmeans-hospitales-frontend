FROM node:20-alpine AS builder

ENV NODE_ENV=production

# --- 1. Declarar el ARGUMENTO de Build ---
# Esto le dice a Docker que espere una variable en el momento del build
ARG NEXT_PUBLIC_API_URL

# --- 2. Asignar el ARG a una ENV ---
# Esto hace que la variable esté disponible para los comandos RUN
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

# Instalas pnpm
RUN npm install -g pnpm

WORKDIR /app

# Copias los archivos de pnpm
COPY package.json pnpm-lock.yaml ./

# Instalas dependencias con pnpm
RUN pnpm install --frozen-lockfile 

# Copias el resto del código
COPY . .

# --- 3. El Diagnóstico ---
RUN echo "================================================"
RUN echo "LA VARIABLE DE BUILD ES: $NEXT_PUBLIC_API_URL"
RUN echo "================================================"

# Construyes el proyecto
RUN pnpm run build

# --- Etapa Runner (sin cambios) ---
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT 5050
ENV HOSTNAME="0.0.0.0"

COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/static ./.next/static

RUN chown -R node:node /app

# Usas el usuario no-root
USER node

EXPOSE 5050

# Comando final para ejecutar la app
CMD ["node", "server.js"]