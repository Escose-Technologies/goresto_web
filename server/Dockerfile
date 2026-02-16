# Stage 1: Build dependencies and generate Prisma client
FROM node:20-alpine AS builder

RUN apk add --no-cache openssl python3 make g++

WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Copy Prisma schema first (needed before npm ci due to postinstall)
COPY prisma/ ./prisma/

# Install production dependencies (postinstall runs prisma generate)
RUN npm ci --omit=dev

# Stage 2: Production runtime
FROM node:20-alpine

RUN apk add --no-cache openssl

# Create non-root user
RUN addgroup -g 1001 goresto && adduser -D -u 1001 -G goresto goresto

WORKDIR /app

# Copy built dependencies and Prisma client
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma

# Copy server source code
COPY src/ ./src/
COPY config/ ./config/
COPY middleware/ ./middleware/
COPY routes/ ./routes/
COPY controllers/ ./controllers/
COPY services/ ./services/
COPY validators/ ./validators/
COPY errors/ ./errors/
COPY utils/ ./utils/
COPY app.js ./
COPY package.json ./

# Set ownership
RUN chown -R goresto:goresto /app

USER goresto

ENV NODE_ENV=production
EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --spider -q http://localhost:3001/api/health || exit 1

CMD ["node", "src/index.js"]
