# Stage 1: Building the application
FROM node:20-alpine AS builder

WORKDIR /app

# Use build arguments
ARG DB_URI
ARG DB_USER
ARG NEO4J_PASSWORD

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy source code
COPY . .

# Set environment variables for build
ENV DB_URI=${DB_URI}
ENV DB_USER=${DB_USER}
ENV NEO4J_PASSWORD=${NEO4J_PASSWORD}

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

EXPOSE 3000

# Start the application
CMD ["node", "server.js"]
