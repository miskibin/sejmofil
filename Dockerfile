# Stage 1: Building the application
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy source code
COPY . .

# Set environment variables
ENV DB_URI="bolt+s://neo.msulawiak.pl:7687"
ENV DB_USER="neo4j"
ENV NEO4J_PASSWORD="677PSbixydyryBVUf3JgsZnpppzpy3C5ytNw"

# Build the application
RUN npm run build

# Stage 2: Production image
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Copy necessary files from builder
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Set environment variables for production
ENV DB_URI="bolt+s://neo.msulawiak.pl:7687"
ENV DB_USER="neo4j"
ENV NEO4J_PASSWORD="677PSbixydyryBVUf3JgsZnpppzpy3C5ytNw"
ENV PORT=3000

EXPOSE 3000

# Start the application
CMD ["node", "server.js"]
