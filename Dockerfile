FROM node:20-alpine AS builder

ENV NODE_ENV=production

ARG NEXT_PUBLIC_API_URL


ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

RUN npm install -g pnpm

WORKDIR /app


COPY package.json pnpm-lock.yaml ./


RUN pnpm install --frozen-lockfile 

COPY . .


RUN echo "================================================"
RUN echo "LA VARIABLE DE BUILD ES: $NEXT_PUBLIC_API_URL"
RUN echo "================================================"


RUN pnpm run build


FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT 5050
ENV HOSTNAME="0.0.0.0"

COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/static ./.next/static

RUN chown -R node:node /app

USER node

EXPOSE 5050

CMD ["node", "server.js"]