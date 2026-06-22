FROM node:20-alpine AS builder

WORKDIR /app

RUN apk add --no-cache openssl

COPY package*.json ./
COPY prisma ./prisma/
RUN npm ci

COPY tsconfig.json ./
COPY src ./src/
RUN npm run build

FROM node:20-alpine

WORKDIR /app

RUN apk add --no-cache openssl

COPY package*.json ./
COPY prisma ./prisma/
RUN npm ci --omit=dev && npm run generate

COPY --from=builder /app/dist ./dist/
COPY prisma ./prisma/

RUN mkdir -p /app/uploads/screenshots /app/uploads/installers

EXPOSE 3001

CMD ["sh", "-c", "npx prisma migrate deploy && node dist/seed.js && node dist/index.js"]
